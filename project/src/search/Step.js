(function () {
  /*  Step.js
   */

  'use strict';

  function Step (id, parent, child, sibling, move) {
    this.id = id;
    this.parent = parent;
    this.child = child;
    this.sibling = sibling;
    this.move = move;
  };

  Step.prototype.toString = function () {
    return this.id;
  };

  Step.prototype.setParent = function (step) {
    if (step instanceof Step) {
      this.parent = step;
    } else {
      throw new Error('Requires a Step to set the parent.');
    }
  };

  Step.prototype.setChild = function (step) {
    if (step instanceof Step) {
      this.child = step;
    } else {
      throw new Error('Requires a Step to set the child.');
    }
  };

  Step.prototype.setSibling = function (step) {
    if (step instanceof Step) {
      this.sibling = step;
    } else {
      throw new Error('Requires a Step to set the sibling.');
    }
  };

  module.exports = {
    Step: Step
  };
})();
