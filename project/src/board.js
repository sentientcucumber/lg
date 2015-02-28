// board.js
// Contains functions used for creating and manipulating boards

(function() {
  'use strict';

  // Dependencies
  var mathjs = require('mathjs');
  var _ = require('underscore');
  var fs = require('fs');

  // Gloabls
  var global = {};
  global.UNDISCOVERED = '-';
  global.UNREACHABLE = '*';

  // Generate a board of n x m, if a seed is provided, a starting point (0)
  // will be placed at the coordinates
  exports.generateBoard = function (board, seed) {
    var rows = [];

    for (var i = 0; i < board.xMax; i++) {
      var cols = [];

      for (var j = 0; j < board.yMax; j++) {
        if (board.zMax) {
          var tmp = [];

          for (var k = 0; k < board.zMax; k++) {
            tmp.push(global.UNDISCOVERED);
          }

          cols.push(tmp);
        } else {
          cols.push(global.UNDISCOVERED);
        }
      }

      rows.push(cols);
    }

    if (seed.z) {
      rows[seed.y][seed.x][seed.z] = 0;
    } else {
      rows[seed.y][seed.x] = 0;
    }

    board.obstacles.forEach(function (obstacle) {
      rows[obstacle.y - 1][obstacle.x - 1] = global.UNREACHABLE;
    });

    return {
      "rows": rows,
      "xLimit": board.xMax,
      "yLimit": board.yMax,
      "zLimit": board.zMax
    };
  };

  // Pretty printing for the board
  var prettyPrintBoard = function (board, piece) {
    var b = board.reverse();
    var output = [];

    b.forEach(function (row) {
      if (board.hasOwnProperty('zMax')) {
        row.forEach(function (col) {
	  output.push(col.join(' '));
        });
      } else {
	output.push(row.join(' '));
      }
    });

    return output;
  };

  // Determines whether or not the board contains a given step
  var containsStep = function (board, step) {
    var found = false;

    board.rows.forEach(function (row) {
      if (typeof row[0] === "object") {
        row.forEach(function (col) {
          if (_.contains(col, step)) {
            found = true;
          }
        });
      } else {
        if (_.contains(row, step)) {
          found = true;
        };
      }
    });

    return found;
  };

  // Determines whether or not the cell to be evaluated is valid
  var validCell = function (board, x, y, z) {
    var valid = false;

    if (x < board.xLimit && x > -1 &&
        y < board.yLimit && y > -1) {
      if (z < board.zLimit && z > -1) {
	valid = (board.rows[y][x][z] === global.UNDISCOVERED) ? true : false;
      } else {
	valid = (board.rows[y][x] === global.UNDISCOVERED) ? true : false;
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

  // Find the starting points of the steps
  var findStartingPoints = function (board, step) {
    var steps = [];

    board.rows.forEach(function (row, i) {
      row.forEach(function (col, j) {

        if (typeof col === "object") {
          // If a 3D board
          col.forEach(function (dep, k) {
            if (board.rows[i][j][k] === step) {
              steps.push({
                "x": j,
                "y": i,
                "z": k
              });
            }
          });
        } else {
          // If a 2D board
          if (board.rows[i][j] === step) {
            steps.push({
              "x": j,
              "y": i
            });
          }
        }
      });
    });

    return steps;
  };

  var findLimit = function (reachability) {
    var limits = [];

    reachability.forEach(function (conditions) {
      var keys = Object.keys(conditions);

      keys.forEach(function (entry) {
        limits.push(conditions[entry].replace(/[a-z]\d|\W/g, '').trim());
      });
    });

    return parseInt(_.max(limits));
  };

  // Iterate radially outwards from the starting point given from x and y.
  var iterateRadially = function (board, point, piece, step, limit) {
    var rows = board.rows,
        x = point.x,
        y = point.y,
        z = point.z,
        result;

    for (var i = (y - limit); i <= (y + limit); i++) {
      for (var j = (x - limit); j <= (x + limit); j++) {
        if (z) {
          for (var k = (z - limit); k <= (z + limit); k++) {
            if (validCell(board, j, i, k)) {
              result = evalCell(board, piece, point, j, i, k);
              rows[i][j][k] = (result) ? step + 1 : global.UNDISCOVERED;
            }
          }
        } else {
          if (validCell(board, j, i)) {
            result = evalCell(board, piece, point, j, i);
            rows[i][j] = (result) ? step + 1 : global.UNDISCOVERED;
          }
        }
      }
    }
  };

  // Populate the reachability board based on the current piece
  exports.populateBoard = function (board, piece) {
    var reachability = piece.reachability;

    for (var i = 0; containsStep(board, i); i++) {
      var points = findStartingPoints(board, i);

      points.forEach(function (point) {
        var limit = findLimit(piece.reachability);
        iterateRadially(board, point, piece, i, limit);
      });
    }

    var output = prettyPrintBoard(board.rows);

    return output;
  };
  
  // Transform the move board (an array of strings) to a 2d array
  exports.transformMoves = function (moves) {
    var tmp = moves;

    tmp.forEach(function (row, i) {
      tmp[i] = row.split(' ').map(function (entry) {
        return Number(entry);
      });
    });

    return tmp;
  };
})();
