(function() {
  /* Important!
   *
   * User's should be able to pass in information for one based board file,
   * rank and depth. Since all arrays are zero based, any function MUST take
   * this into account!
   *
   * Boards only support two and three dimensional boards!
   *
   * Boards only support XY coordinates! This does not support linear
   * coordinates!
   *
   * A board knows about pieces, yet the inverse is not true!
   *
   * A board doesn't necessarily mean the game board, it can be a representation
   * of a board that shows reachability
   *
   * When a Board is printed out (not using the toString method), it will appear
   * inverted with respect to the horizontal axis. That is pieces placed on the 
   * top-left will appear on the bottom left. Always print out using toString!
   */

  'use strict';

  // Dependencies
  var Piece = require('./Piece.js').Piece
  ,   Location = require('./Location.js').Location
  ,   _ = require('underscore');

  // Gloabls
  global.BoardSymbols = {};
  global.BoardSymbols.UNDISCOVERED = '-';
  global.BoardSymbols.UNREACHABLE = '*';
  global.BoardSymbols.OBSTACLE = '#';

  // Board object and prototypes //////////////////////////////////////////////

  // Board Constructor
  var Board = function (board) {
    this.xMax = board.xMax;
    this.yMax = board.yMax;
    this.zMax = board.zMax || null;
    this.obstacles = board.obstacles || [ ];
    this.board = blankBoard(this);
  };

  // String representation of the Board
  Board.prototype.toString = function () {
    var board = this.board
    ,   output = [ ];

    board.forEach(function (row) {
      if (board.zMax) {
        row.forEach(function (col) {
          output.push(col.join(' '));
        });
      } else {
        output.push(row.join(' '));
      }
    });

    // Only reverse the board for printing purposes!
    return output.reverse().join('\n');
  };

  // Add one or more pieces to the board
  Board.prototype.addPiece = function () {
    var pieces = arguments
    ,   that = this
    ,   x = this.xMax
    ,   y = this.yMax;

    _.forEach(pieces, function (piece) {
      that.board[piece.startY - 1][piece.startX - 1] = new Piece(piece);

      // If the board already has an array of pieces, add it, otherwise
      // create the array with that piece
      if (_.isArray(that.pieces)) {
        that.pieces.push(piece);
      } else {
        that.pieces = [ piece ];
      }
    });
  };

  // Determine whether or not a piece is at a given location
  Board.prototype.pieceOn = function (location) {
    return (typeof this.board[location.y - 1][location.x - 1] === "object");
  };

  // Returns the value at on the board for a given location object
  Board.prototype.atLocation = function (location) {
    return this.board[location.y - 1][location.x - 1];
  };

  // Return a subset of the board
  Board.prototype.subset = function (board, location) {
    var left = board.xMax - location.x
    ,   right = board.xMax + left
    ,   bottom = board.yMax - location.y
    ,   top = board.yMax + bottom
    ,   subset = [ ];

    for (var i = bottom; i < top; i++) {
      var row = [ ];

      for (var j = left; j < right; j++) {
        row.push(this.board[i][j]);
      }

      subset.push(row);
    }

    var newBoard = new Board({
      "xMax": board.xMax,
      "yMax": board.yMax
    });
    
    newBoard.board = subset;
    newBoard.pieces = this.pieces;

    return newBoard;
  };

  // Express the nonempty values as set notation
  Board.prototype.asSet = function () {
    var locations = [ ]
    ,   that = this;

    this.board.forEach(function (row, i) {
      row.forEach(function (col, j) {
        if (that.board[j][i] !== 0)
          locations.push(new Location(i + 1, j + 1));
      });
    });

    return (locations.length > 0) ? '[ (' + locations.join('), (') + ') ]': '[ ]';
  };

  // Exports
  module.exports = {
    Board: Board
  };

  // Board functions //////////////////////////////////////////////////////////

  // Generates a blank board where all spaces are undiscovered and no pieces
  // are placed on the board
  var blankBoard = function (boardObj) {
    var rows = [ ];

    for (var i = 0; i < boardObj.xMax; i++) {
      var cols = [ ];

      for (var j = 0; j < boardObj.yMax; j++) {
        var depth = [ ];

        // if the boardObj is 3d, add the third dimension
        if (boardObj.zMax) {
          for (var k = 0; k < boardObj.zMax; k++) {
            depth.push(global.BoardSymbols.UNDISCOVERED);
          }

          cols.push(depth);
        } else {
          cols.push(global.BoardSymbols.UNDISCOVERED);
        }
      }
      rows.push(cols);
    }

    // Add obstacles to the board
    if (boardObj.obstacles) {
      boardObj.obstacles.forEach(function (obstacle) {
        rows[obstacle.y - 1][obstacle.x - 1] = global.BoardSymbols.UNREACHABLE;
      });
    }

    // The rows need to be reversed so the top of the board appears on top
    return rows.reverse();
  };
})();
