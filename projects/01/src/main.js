(function() {
  'use-strict';

  // Dependencies
  var fs = require('fs'),
      mathjs = require('mathjs'),
      _ = require('underscore');

  // Gloabls
  var global = {};
  global.UNDISCOVERED = '-';
  global.UNREACHABLE = '*';

  // Validates the file is JSON and has required fields
  var validateFile = function (file) {
    try {
      var parsedFile = JSON.parse(fs.readFileSync(file));

      // TODO Check for required fields before returning
      return parsedFile;
    } catch (e) {
      console.error("The input file was not properly formatted JSON.");
      console.error(e.message);

      return null;
    }
  };

  // Checks to see if a file was provided, and if so, does the file contain
  // the required information. If so, a JSON object is returned to be used
  // in subsequent calls.
  var validateRun = function () {
    var file = process.argv[2];

    if (file) {
      return validateFile(file);
    } else {
      console.error("Usage: npm run <input file>\n");

      return null;
    }
  };

  // Generate a board based on the information passed in.
  var generateReachabilityBoard = function (board) {
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
    board.forEach(function (row) {
      console.log(row.join(' '));
    });
  };

  // Determines whether or not the board contains a given step
  var containsStep = function (board, step) {
    var found = false;n

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
    var reachability = piece.reachability,
	outcome;

    reachability.forEach(function (entry) {
      var conditions = Object.keys(entry);
      
      conditions.forEach(function (condition) {
	var expr = processCondition(entry[condition]);
	outcome = evalExpression(expr, x, y, start);
      });
    });

    return outcome;
  };

  // Change the limit into something MathJs can use
  var processCondition = function (str) {

    // expr holds information for proper evaluation in evalExpression
    var expr = {};
    expr.equality = str.match(/(<?>?=)/g).toString();

    var eq = str.split(expr.equality),
	ex;

    // After splitting, the first portion should be the expression to evaluate
    if (eq.length === 2) {
      ex = eq[0].trim();
      expr.result = eq[1].trim();
    };

    // Signal to evalExpression absolute value should be applied
    if ((ex.match(/\|/g) || []).length === 2) {
      expr.absolute = true;
      expr.equation = ex.replace(/\|/g, '').trim();
    }
    
    return expr;
  };

  // Evaluate the expression given, if it is unreachable, return saying so
  var evalExpression = function (expr, y1, y2, start) {
    var x1 = start.x,
	x2 = start.y,
	eq = expr.equation;

    eq = eq.replace('x1', x1)
      .replace('y1', y1)
      .replace('x2', x2)
      .replace('y2', y2);

    var result = (expr.absolute) ? Math.abs(mathjs.eval(eq)) : mathjs.eval(eq),
	outcome;
    
    switch (true) {
    case (expr.equality === '<='):
      outcome = (result <= expr.result);
      break;
    case (expr.equality === '>='):
      outcome = (result >= expr.result);
      break;
    case (expr.equality === '='):
      outcome = (result == expr.result);
      break;
    default:
      break;
    }

    return outcome;
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
  
  // Iterate radially outwards from the starting point given from x and y.
  var iterateRadially = function (board, point, piece, step) {
    var limit = Math.max(board.xLimit, board.yLimit),
	rows = board.rows,
	x = point.x,
	y = point.y;

    // FIXME Remove constant for limit
    for (var i = 1; i <= 1; i++) {
      if (validCell(board, x, y + i)) {
      	var result = evalCell(board, x, y + i, piece, point);
      	rows[y + i][x] = (result) ? step + 1 : '+';
      }

      if (validCell(board, x + i, y + i)) {
      	var result = evalCell(board, x + i, y + i, piece, point);
      	rows[y + i][x + i] = (result) ? step + 1 : '+';
      }

      if (validCell(board, x + i, y)) {
      	var result = evalCell(board, x + i, y, piece, point);
      	rows[y][x + i] = (result) ? step + 1 : '+';
      }

      if (validCell(board, x + i, y - i)) {
      	var result = evalCell(board, x + i, y - i, piece, point);
      	rows[y - i][x + i] = (result) ? step + 1 : '+';
      }

      if (validCell(board, x, y - i)) {
      	var result = evalCell(board, x, y - i, piece, point);
      	rows[y - i][x] = (result) ? step + 1 : '+';
      }

      if (validCell(board, x - i, y - i)) {
      	var result = evalCell(board, x - i, y - i, piece, point);
      	rows[y - i][x - i] = (result) ? step + 1 : '+';
      }

      if (validCell(board, x - i, y)) {
      	var result = evalCell(board, x - i, y, piece, point);
      	rows[y][x - i] = (result) ? step + 1 : '+';
      }

      if (validCell(board, x - i, y + i)) {
      	var result = evalCell(board, x - i, y + 1, piece, point);
      	rows[y + i][x - i] = (result) ? step + 1 : '+';
      }
    }
  };

  // Populate the reachability board based on the current piece
  var populateReachabilityBoard = function (board, piece) {
    var reachability = piece.reachability,
        step = 0;

    for (var i = 0; containsStep(board, i); i++) {
      var points = findStartingPoints(board, i);

      points.forEach(function (point) {
	iterateRadially(board, point, piece, i);
      });
    }

    prettyPrintBoard(board.rows);
  };

  // Actual chunk of code that runs
  var info = validateRun();

  if (info) {
    info.pieces.forEach(function (piece) {
      var reachabilityBoard = generateReachabilityBoard(info.board);
      populateReachabilityBoard(reachabilityBoard, piece);
    });
  } else {
    console.log("Exiting...");
  }
})();
