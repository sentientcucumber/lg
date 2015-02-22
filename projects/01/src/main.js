(function() {
  'use-strict';

  // Dependencies
  var utils = require('./utils.js');
  var board = require('./board');

  var input = utils.validateRun();
  var output = [];

  if (input) {
    input.pieces.forEach(function (piece) {

      var chessInfo = {};
      chessInfo.n = input.board.xMax;
      chessInfo.m = input.board.yMax;
      chessInfo.z = input.board.zMax;
      chessInfo.start = {
	"x": piece.x - 1,
	"y": piece.y - 1,
	"z": piece.z - 1
      };

      var reachInfo = {};
      reachInfo.n = input.board.xMax * 2 - 1;
      reachInfo.m = input.board.yMax * 2 - 1;
      reachInfo.z = input.board.zMax * 2 - 1;
      reachInfo.start = {
	"x": Math.floor(reachInfo.n / 2),
	"y": Math.floor(reachInfo.m / 2),
	"z": Math.floor(reachInfo.z / 2)
      };

      var chessBoard = board.generateBoard(input.board,
	  				   chessInfo.n,
	  				   chessInfo.m,
					   chessInfo.z,
	  				   chessInfo.start),
	  reachabilityBoard = board.generateBoard(input.board,
	  					  reachInfo.n,
	  					  reachInfo.m,
	  					  reachInfo.z,
	  					  reachInfo.start);
      
      var outputChessBoard = board.populateBoard(chessBoard, piece);
      var outputReachBoard = board.populateBoard(reachabilityBoard, piece);

      var data = {};
      data.piece = piece.piece;
      data.chessBoard = outputChessBoard;
      data.reachBoard = outputReachBoard;

      output.push(data);
    });

    utils.writeOutput(output);
  } else {
    console.log("Invalid file, exiting program.");
  }
})();
