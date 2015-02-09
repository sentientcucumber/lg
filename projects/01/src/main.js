(function() {
  'use-strict';

  // Dependencies
  var validation = require('./validation.js'),
      board = require('./board');

  var input = validation.validateRun();

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
      
      board.populateBoard(chessBoard, piece);
      board.populateBoard(reachabilityBoard, piece);
    });
  } else {
    console.log("Exiting...");
  }
})();
