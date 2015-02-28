(function() {
  'use-strict';

  // Dependencies
  var utils = require('./utils.js');
  var board = require('./board');

  var input = utils.validateFile(2);
  var output = new Array();

  if (input) {
    input.pieces.forEach(function (piece) {

      var moveInfo = {};

      moveInfo.xMax = input.board.xMax;
      moveInfo.yMax = input.board.yMax;
      moveInfo.zMax = input.board.zMax;
      moveInfo.start = {
	"x": piece.startX,
	"y": piece.startY,
	"z": piece.startZ
      };

      var reachInfo = {};

      reachInfo.xMax = input.board.xMax * 2 - 1;
      reachInfo.yMax = input.board.yMax * 2 - 1;
      reachInfo.zMax = input.board.zMax * 2 - 1;
      reachInfo.start = {
	"x": Math.floor(reachInfo.n / 2),
	"y": Math.floor(reachInfo.m / 2),
	"z": Math.floor(reachInfo.z / 2)
      };

      var moveBoard = board.generateBoard(input.board, moveInfo.start),
	  reachabilityBoard = board.generateBoard(input.board, reachInfo.start);
      
      var outputMoveBoard = board.populateBoard(moveBoard, piece);
      var outputReachBoard = board.populateBoard(reachabilityBoard, piece);

      var data = {};

      data.piece = piece.piece;
      data.moveBoard = outputMoveBoard;
      data.reachBoard = outputReachBoard;

      console.log(JSON.stringify(data, null, 2));

      output.push(data);
    });

    utils.writeOutput(output);
  } else {
    console.log("Invalid file, exiting program.");
  }
})();
