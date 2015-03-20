(function () {
  // A file used for generating zones using the Zone Grammar.

  'use strict';

  // Dependencies
  var zoneUtils = require('./utils.js')
  ,   boardUtils = require('./board.js')
  ,   pieceUtils = require('./piece.js');

  var zones = {
    state: [ ],
    board: [ ]
  };

  // Assumes a properly formatted JSON file that defines a board dimensions
  // along with a variety of pieces. One piece must have a "goal" property
  // set to true.
  exports.zoneGenerator = function (file) {
    zones.board = boardUtils.generateBoard(file.board);
    
    addPiecesToBoard(file);

    var startingPiece = pieceUtils.readJsonPiece(file.pieces[0]);
  };

  // Used to add pieces to the board, necessary for setting up initial
  // conditions
  var addPiecesToBoard = function (file) {
    var pieces = file.pieces;

    pieces.forEach(function (piece) {
      function addPiece (piece) {
        var x = piece.startX
        ,   y = piece.startY
        ,   p = pieceUtils.readJsonPiece(piece)  ;

        zones.board.rows[y - 1][x - 1] = p;
      }

      addPiece(piece);
    });

    zones.board.rows = zones.board.rows.reverse();
  };

  // Grammar //////////////////////////////////////////////////////////////
  
  // The initial production, creates a piece (u), and two matricies (v and w)
  // used to track movement
  var productionOne = function (piece, current, next) {
    
  };

  // Helper functions /////////////////////////////////////////////////////

  // Determines if a piece is on the board at a given location
  var pieceOn = function (location) {
    
  };
})();
