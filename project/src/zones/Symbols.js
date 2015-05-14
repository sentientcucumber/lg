(function () {
  'use strict';

  var Start = function (marker, current, next) {
    this.name = 'S';
    this.marker = marker;
    this.current = current;
    this.next = next;
  };

  Start.prototype.toString = function () {
    return this.name + '(' + this.marker + ', ' + this.current + ', ' + this.next + ')';
  };

  var NonTerminal = function (marker, current, next) {
    this.name = 'A';
    this.marker = marker;
    this.current = current;
    this.next = next;
  };

  NonTerminal.prototype.toString = function () {
    return this.name + '(' + this.marker + ', ' + this.current + ', ' + this.next + ')';
  };

  function Terminal (piece, trajectory) {
    this.name = 't';
    this.piece = piece.name;
    this.trajectory = trajectory.parser;
    this.length = piece.length;
    this.team = piece.team;
  };

  Terminal.prototype.toString = function () {
    return this.name + '(' + this.piece + ', [ ' + this.trajectory + ' ], ' +
      this.length + ')';
  };
  
  module.exports = {
    Start: Start,
    NonTerminal: NonTerminal,
    Terminal: Terminal
  };
})();
