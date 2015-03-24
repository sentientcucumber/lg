(function () {
  'use strict';

  var Start = function (start, end, length) {
    this.name = 'S';
    this.start = start;
    this.end = end;
    this.length = length;
  };

  Start.prototype.toString = function () {
    return this.name + '(' + this.start + ', ' + this.end + ', ' + this.length + ')';
  };

  // Nonterminal object, subclass of Symbol
  var NonTerminal = function (start, end, length) {
    this.name = 'A';
    this.start = start;
    this.end = end;
    this.length = length;
  };

  NonTerminal.prototype.toString = function () {
    return this.name + '(' + this.start + ', ' + this.end + ', ' + this.length + ')';
  };

  // Terminal object, subclass of Symbol
  var Terminal = function (location) {
    this.name = 'a';
    this.location = location;
  };

  Terminal.prototype.toString = function () {
    return this.name + '(' + this.location + ')';
  };

  module.exports = {
    Start: Start,
    NonTerminal: NonTerminal,
    Terminal: Terminal
  };
})();
