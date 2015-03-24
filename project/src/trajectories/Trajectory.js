(function () {
  'use strict';

  /* Trajectory.js
   * 
   */

  // Dependencies
  var Parser = require('../objects/Parser.js').Parser
  ,   Symbols = require('./Symbols.js')
  ,   Location = require('../objects/Location.js').Location
  ,   ReachBoard = require('../maps/ReachabilityBoard.js').ReachabilityBoard
  ,   Start = Symbols.Start
  ,   A = Symbols.NonTerminal
  ,   a = Symbols.Terminal
  ,   _ = require('lodash');

  // Trajectory constructor, adds the piece and board to global scope
  var Trajectory = function (piece, board) {
    this.piece = piece;
    this.board = board;
    this.overlay = overlayBoard(board, piece);

    var parser = new Parser();

    var start = new Location(piece.startX, piece.startY)
    ,   end = new Location(piece.endX, piece.endY)
    ,   length = piece.length
    ,   size = board.xMax * board.yMax;

    var subset = this.overlay.subset(board, start);

    if (withinReach(end, subset) <= length &&
        length < 2 * withinReach(end, subset) &&
        length < 2 * size) {

      parser.addTerminal(new A(start, end, length));
    }
  };
  
  module.exports = {
    Trajectory: Trajectory
  };

  // Helper functions ////////////////////////////////////////////////////////

  // Analagous to the MAP function in the Trajectory Grammar
  var withinReach = function (end, board) {
    return board.atLocation(end);
  };

  // Generate a board to "overlay" onto the existing game board to determine
  // reachable locations quickly
  var overlayBoard = function (board, piece) {
    var overlayBoard = {
      "xMax": board.xMax * 2 - 1,
      "yMax": board.yMax * 2 - 1
    };

    var overlayPiece = {
      "name": piece.name,
      "startX": Math.ceil(overlayBoard.xMax / 2),
      "startY": Math.ceil(overlayBoard.yMax / 2),
      "reachability": piece.reachability
    };

    var reachBoard = new ReachBoard(overlayBoard);
    reachBoard.generateReachability(overlayPiece);

    return reachBoard;
  };
})();
