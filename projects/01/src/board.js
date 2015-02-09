// board.js
// Contains functions used for creating and manipulating boards

(function() {
  'use-strict';

  // Dependencies
  var mathjs = require('mathjs'),
      _ = require('underscore');

  // Gloabls
  var global = {};
  global.UNDISCOVERED = '-';
  global.UNREACHABLE = '*';

  // Generate a board of n x m, if a seed is provided, a starting point (0)
  // will be placed at the coordinates
  exports.generateBoard = function (board, n, m, seed) {
    var rows = [];

    for (var i = 0; i < n; i++) {
      var cols = [];

      for (var j = 0; j < m; j++) {
	cols.push(global.UNDISCOVERED);
      }

      rows.push(cols);
    }

    if (seed) {
      rows[seed.y][seed.x] = 0;
    }

    var info = {};

    info.rows = rows;
    info.xLimit = n;
    info.yLimit = m;

    return info;
  };

  // Generate a board based on the information passed in.
  exports.generateReachabilityBoard = function (board) {
    var rows = [],
        xLimit = board.xMax * 2 - 1,
        yLimit = board.yMax * 2 - 1;

    for (var i = 0; i < xLimit; i++) {
      var cols = [];

      for (var j = 0; j < yLimit; j++)
        cols.push(global.UNDISCOVERED);

      rows.push(cols);
    }

    // Seed the starting position of the piece
    rows[Math.floor(xLimit / 2)][Math.floor(yLimit / 2)] = 0;

    var info = {};

    info.rows = rows;
    info.xLimit = xLimit;
    info.yLimit = yLimit;

    return info;
  };

  // Pretty printing for the board
  var prettyPrintBoard = function (board) {
    var b = board.reverse();

    b.forEach(function (row) {
      console.log(row.join(' '));
    });
  };

  // Determines whether or not the board contains a given step
  var containsStep = function (board, step) {
    var found = false;

    board.rows.forEach(function (row) {
      if (_.contains(row, step)) {
        found = true;
      };
    });

    return found;
  };

  // Determines whether or not the cell to be evaluated is valid
  var validCell = function (board, x, y) {
    var valid = false;

    if (x < board.xLimit &&
        x > -1 &&
        y < board.yLimit &&
        y > -1 &&
        board.rows[y][x] === global.UNDISCOVERED) {
      valid = true;
    }

    return valid;
  };

  // Process the piece's reachability to see if the cell can be reached
  var evalCell = function (board, x, y, piece, start) {
    var reachability = piece.reachability;

    // Only one of the entries must be true
    var conditionMet = reachability.some(function (entry) {
      var conditions = Object.keys(entry);

      // Both conditions must be true
      var outcome = conditions.every(function (condition) {
        var expr = processCondition(entry[condition]);
        return evalExpression(expr, x, y, start);
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

    var arr = str.split(expr.equality),
        lhs,
        rhs;

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
  var evalExpression = function (expr, y1, y2, start) {
    var x1 = start.x,
        x2 = start.y,
        lhs = expr.lhs,
        rhs = expr.rhs,
        result;

    if (isNaN(rhs)) {
      rhs = rhs.replace('x1', x1)
        .replace('y1', y1)
        .replace('x2', x2)
        .replace('y2', y2);

      rhs = (expr.rhsAbsolute) ? Math.abs(mathjs.eval(rhs)) : mathjs.eval(rhs);
    }

    lhs = lhs.replace('x1', x1)
      .replace('y1', y1)
      .replace('x2', x2)
      .replace('y2', y2);

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
        if (board.rows[i][j] === step) {
          steps.push({
            "x": j,
            "y": i
          });
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
        result;

    for (var i = (y - limit); i <= (y + limit); i++) {
      for (var j = (x - limit); j <= (x + limit); j++) {
	if (validCell(board, j, i)) {
	  result = evalCell(board, j, i, piece, point);
	  rows[i][j] = (result) ? step + 1 : global.UNDISCOVERED;
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

    console.log(piece.piece);
    prettyPrintBoard(board.rows);
    console.log("\n");
  };
})();
