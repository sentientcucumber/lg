(function () {
  'use strict';

  // Dependencies
  var utils = require('../utilities/utilities.js')
  ,   Trajectory = require('./Trajectory.js').Trajectory
  ,   Board = require('../objects/Board.js').Board;

  var input = utils.validateFile(process.argv[2]);
  var output = new Array();

  if (input) {
    var pieces = input.pieces
    ,   board = new Board(input.board);
    
    pieces.forEach(function (piece) {
      var trajectory = new Trajectory(piece, board);
      trajectory.printTrajectory();
    });
  } else {
    console.log("Invalid file, exiting program.");
  }
})();
