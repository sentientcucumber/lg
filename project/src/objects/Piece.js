(function () {
  /* Important!
   *
   */

  'use strict';

  var Piece = function (piece) {
    this.name = piece.name;
    this.startX = piece.startX || undefined;
    this.startY = piece.startY || undefined;
    this.endX = piece.endX || undefined;
    this.endY = piece.endY || undefined;
    this.length = piece.length || undefined;
    this.team = piece.team || undefined;
    this.reachability = piece.reachability || [ ];
  };
  
  Piece.prototype.toString = function() {
    return this.name[0];
  };

  module.exports = {
    Piece: Piece
  };
})();
