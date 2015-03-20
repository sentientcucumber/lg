var board = require('../src/objects/board.js');

exports['ThisMayActuallyWork'] = function (test) {
  var b = new board.Board({"xMax": 8, "yMax": 8});

  b.addPiece(); 

  console.log(b.toString());
  test.done();
};
