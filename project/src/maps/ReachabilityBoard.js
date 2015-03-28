(function() {
  /* Important!
   *
   * A subclass of the board object, the reachability board shows the moves a piece
   * can make for the provided board
   */

  'use strict';

  // Dependencies 
  var Board = require('../objects/Board.js').Board
  ,   _ = require('underscore')
  ,   mathjs = require('mathjs');

  // ReachabilityBoard object and prototypes //////////////////////////////////

  // ReachabilityBoard Constructor
  var ReachabilityBoard = function (board) {
    Board.call(this, board);
  };

  // Inherit from the Board prototype
  ReachabilityBoard.prototype = Object.create(Board.prototype);

  // Generate a board with a given piece's reachability. This assumes there
  // is exactly one piece on the board. It doesn't make sense to generate
  // reachability for a blank board and multiple pieces may be too time
  // consuming. A reachability board is a subset of an abstract board game
  // board.
  ReachabilityBoard.prototype.generateReachability = function (piece) {
    this.addPiece(piece);

    var reachability = this;

    if (this.pieces.length !== 1) {
      throw new Error('There must be exactly one piece to generate' +
                      'reachabilities!');
    } else {
      if (_.isObject(reachability.board[piece.startY - 1][piece.startX - 1])) {
        reachability.board[piece.startY - 1][piece.startX - 1] = 0;

        for (var i = 0; containsStep(reachability, i); i++) {
          var points = findStartingPoints(reachability, i);

          points.forEach(function (point) {
            var limit = findLimit(piece.reachability);
            iterateRadially(reachability, point, limit);
          });
        }
      } else {
        throw new Error('Could not find a piece at the starting location');
      }
    }

    this.board = reachability.board;
  };

  module.exports = {
    ReachabilityBoard: ReachabilityBoard
  };

  // Determine if a step is on the board or not
  var containsStep = function (boardObj, step) {
    var flatBoard = _.flatten(boardObj.board);
    return (_.indexOf(flatBoard, step) > -1) ? true : false;
  };

  // Determines whether or not the cell to be evaluated is valid
  var validCell = function (board, x, y, z) {
    var valid = false;

    if (x < board.xMax && x > -1 &&
        y < board.yMax && y > -1) {
      if (z < board.zMax && z > -1) {
        valid = (board.board[y][x][z] === global.BoardSymbols.UNDISCOVERED) ?
          true : false;
      } else {
        valid = (board.board[y][x] === global.BoardSymbols.UNDISCOVERED) ?
          true : false;
      }
    }

    return valid;
  };

  // Process the piece's reachability to see if the cell can be reached
  var evalCell = function (board, piece, start, x, y, z) {
    var reachability = piece.reachability;

    // Only one of the entries must be true
    var conditionMet = reachability.some(function (entry) {
      var conditions = Object.keys(entry);

      // Both conditions must be true
      var outcome = conditions.every(function (condition) {
        var expr = processCondition(entry[condition]);
        return evalExpression(expr, start, x, y, z);
      });

      return outcome;
    });

    return conditionMet;
  };

  // Change the limit into something MathJs can use
  var processCondition = function (str) {
    // expr holds information for proper evaluation in evalExpression
    var expr = {};
    expr.equality = str.match(/(<?>?=)/g).toString();

    var arr = str.split(expr.equality);
    var lhs;
    var rhs;

    // After splitting, the first portion should be the expression to evaluate
    if (arr.length === 2) {
      lhs = arr[0].trim();
      rhs = arr[1].trim();
    }

    if (isNaN(rhs)) {
      if ((lhs.match(/\|/g) || []).length > 0) {
        expr.rhsAbsolute = true;
        rhs = rhs.replace(/\|/g, '');
      } else {
        expr.rhsAbsolute = false;
      }
    }

    expr.rhs = rhs.trim();

    if ((lhs.match(/\|/g) || []).length > 0) {
      expr.lhsAbsolute = true;
      lhs = lhs.replace(/\|/g, '');
    } else {
      expr.lhsAbsolute = false;
    }

    expr.lhs = lhs.trim();

    return expr;
  };

  // Evaluate the expression given
  var evalExpression = function (expr, start, y1, y2, y3) {
    var x1 = start.x;
    var x2 = start.y;
    var x3 = start.z;
    var lhs = expr.lhs;
    var rhs = expr.rhs;
    var result;

    if (isNaN(rhs)) {
      rhs = rhs.replace('x1', x1)
        .replace('y1', y1)
        .replace('x2', x2)
        .replace('y2', y2)
        .replace('x3', x3)
        .replace('y3', y3);

      rhs = (expr.rhsAbsolute) ? Math.abs(mathjs.eval(rhs)) : mathjs.eval(rhs);
    }

    lhs = lhs.replace('x1', x1)
      .replace('y1', y1)
      .replace('x2', x2)
      .replace('y2', y2)
      .replace('x3', x3)
      .replace('y3', y3);

    lhs = (expr.lhsAbsolute) ? Math.abs(mathjs.eval(lhs)) : mathjs.eval(lhs);

    switch (true) {
    case (expr.equality === '<='):
      result = (lhs <= rhs);
      break;
    case (expr.equality === '>='):
      result = (lhs >= rhs);
      break;
    case (expr.equality === '='):
      result = (lhs == rhs);
      break;
    }

    return result;
  };

  // Find all the locations on the board for a given step.
  var findStartingPoints = function (boardObj, step) {
    var points = [ ]
    ,   board = boardObj.board;

    board.forEach(function (row, i) {
      row.forEach(function (col, j) {

        if (_.isArray(col)) {
          col.forEach(function (depth, k) {

            if (board[i][j][k] === step)
              points.push({ "x": j, "y": i, "z": k, "step": step });
          });
        } else {
          if (board[i][j] === step)
            points.push({ "x": j, "y": i, "step": step });
        }
      });
    });

    return points;
  };

  var findLimit = function (reachability) {
    var limits = [ ];

    reachability.forEach(function (conditions) {
      var keys = Object.keys(conditions);

      keys.forEach(function (entry) {
        limits.push(conditions[entry].replace(/[a-z]\d|\W/g, '').trim());
      });
    });

    return parseInt(_.max(limits));
  };

  // Iterate radially outwards from the starting point given from x and y.
  var iterateRadially = function (boardObj, point, limit) {
    var rows = boardObj.board
    ,   piece = boardObj.pieces[0]
    ,   x = point.x, y = point.y, z = point.z, step = point.step;

    for (var i = (y - limit); i <= (y + limit); i++) {
      for (var j = (x - limit); j <= (x + limit); j++) {
        if (z) {
          for (var k = (z - limit); k <= (z + limit); k++) {
            if (validCell(boardObj, j, i, k)) {
              var result = evalCell(boardObj, piece, point, j, i, k);
              rows[i][j][k] = (result) ? step + 1 : global.BoardSymbols.UNDISCOVERED;
            }
          }
        } else {
          if (validCell(boardObj, j, i)) {
            var result = evalCell(boardObj, piece, point, j, i);
            rows[i][j] = (result) ? step + 1 : global.BoardSymbols.UNDISCOVERED;
          }
        }
      }
    }
  };
})();
