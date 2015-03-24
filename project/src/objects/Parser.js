(function () {
  'use strict';

  /* Parser
   * 
   * A parser is a wrapper for a stack to add, find and remove symbols from the
   * stack. 
   *
   * This should be kept separate from the definitions of symbols for a parser.
   *
   * Assumes left-hand parsing.
   */

  // Dependencies
  var _ = require('lodash');

  var Parser = function () {
    this.state = [ ];
  };

  Parser.prototype.toString = function () {
    return this.state.join(', ');
  };
  
  Parser.prototype.addNonTerminal = function (nonterminal) {
    this.state.push(nonterminal);
  };

  Parser.prototype.addTerminal = function (terminal) {
    this.state.push(terminal);
  };

  Parser.prototype.findSymbol = function (name) {
    return _.findIndex(this.state, function (entry) {
      return entry.name = name;
    });
  };

  Parser.prototype.removeSymbol = function (index) {
    _.pullAt(this.state, index);
  };

  Parser.prototype.replaceSymbol = function (name, symbol) {
    var i = this.findSymbol(name);
    this.state[i] = symbol;
  };

  module.exports = {
    Parser: Parser
  };
})();
