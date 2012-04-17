var assert = require('assert');

var asserter = function(actual, expected, message) {
  try {
    assert.deepEqual(actual, expected, message);
    console.log("\033[1;32mPASS\033[m: " + message);
  } catch (e) {
    console.log("\033[1;31mFAIL\033[m: " + message);
    console.log(e);
  }
};

module.exports = {test: asserter};
