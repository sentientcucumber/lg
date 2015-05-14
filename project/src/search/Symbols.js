(function () {
  'use strict';

  function Start (step) {
    this.name = 'S';
    this.step = step;
  };

  Start.prototype.toString = function () {
    return this.name + '(' + this.step + ')';
  };

  var NonTerminal = function (step) {
    this.name = 'A';
    this.step = step;
  };

  NonTerminal.prototype.toString = function () {
    return this.name + '(' + this.step + ')';
  };

  function Terminal (step) {
    this.name = 'pi';
    this.step = step;
  };

  Terminal.prototype.toString = function () {
    return this.name + '(' + this.step + ')';
  };
  
  module.exports = {
    Start: Start,
    NonTerminal: NonTerminal,
    Terminal: Terminal
  };
})();
