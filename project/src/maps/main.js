(function() {
  'use strict';

  // Dependencies
  var utils = require('../utilities/utilities.js')
  ,   ReachBoard = require('./ReachabilityBoard.js').ReachabilityBoard;

  var input = utils.validateFile(process.argv[2]);
  var output = new Array();

  if (input) {
    var pieces = input.pieces;

    pieces.forEach(function (piece) {
      var reachBoard = new ReachBoard(input.board);
      reachBoard.generateReachability(piece);
      
      console.log(reachBoard + '\n');
    });
  } else {
    console.log("Invalid file, exiting program.");
  }
})();
