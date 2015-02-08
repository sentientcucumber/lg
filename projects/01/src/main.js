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
        (board.rows[y][x] === global.UNREACHABLE ||
	 board.rows[y][x] === global.UNDISCOVERED)) {
      valid = true;
    }

    return valid;
  };

  // Process the piece's reachability to see if the cell can be reached
  var evalCell = function () {
    
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
  var iterateRadially = function (board, x, y) {
    var start = board.rows[x][y],
	limit = Math.max(board.xLimit, board.yLimit),
	rows = board.rows;


    for (var i = 1; i <= limit; i++) {
      if (validCell(board, x, y + i)) {
	
      }

      if (validCell(board, x + i, y + i)) {

      }

      if (validCell(board, x + i, y)) {

      }

      if (validCell(board, x + i, y - i)) {

      }

      if (validCell(board, x, y - i)) {

      }

      if (validCell(board, x - i, y - i)) {

      }

      if (validCell(board, x - i, y)) {

      }

      if (validCell(board, x - i, y + i)) {

      }
    }
  };

  // Populate the reachability board based on the current piece
  var populateReachabilityBoard = function (board, piece) {
    var reachability = piece.reachability,
        step = 0;

    for (var i = 0; containsStep(board, i); i++) {
      var points = findStartingPoints(board, step);

      points.forEach(function (point) {
	iterateRadially(board, point.x, point.y);
      });
    }
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
