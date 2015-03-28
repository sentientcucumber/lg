(function () {
  // Dependencies
  var ReachBoard = require('../maps/ReachabilityBoard.js').ReachabilityBoard
  ,   _ = require('lodash');

  // Generate a board to "overlay" onto the existing game board to determine
  // reachable locations quickly. Should be used with ReachabilityBoard's subset
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

    var i = _.findIndex(reachBoard.pieces, function (entry) {
      return entry.startX === overlayPiece.startX &&
             entry.startY === overlayPiece.startY;
    });

    reachBoard.pieces.splice(i, 1, piece);

    return reachBoard;
  };

  var withinReach = function (end, board) {
    return board.atLocation(end);
  };

  module.exports = {
    overlayBoard: overlayBoard,
    withinReach: withinReach
  };
})();
