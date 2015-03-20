(function () {
  /* Important!
   *
   */

  'use strict';

  var Piece = function (piece) {
    this.name = piece.name;
    this.startX = piece.startX;
    this.startY = piece.startY;
    this.endX = piece.endX;
    this.endY = piece.endY;
    this.goal = piece.goal;
    this.reachability = piece.reachability;
  };
  
  Piece.prototype.toString = function() {
    return this.name[0];
  };

  module.exports = {
    Piece: Piece
  };
})();
