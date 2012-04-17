/**
 * A simple test runner.
 *
 * Usage:
 *   testrunner.run(test_cases, function(tc) { ... });
 *
 * The first argument is an array containing one or more test cases to run. The
 * only requirement is that each test case is a JavaScript object with a
 * "message" field. The rest of the object is interpreted by the executor.
 *
 * The second argument is a function taking a single parameter. This function
 * is responsible for running the actual test, and returning a pass/fail code
 * as appropriate. If this function throws an exception or returns boolean
 * false, the test will be considered a FAIL. Otherwise, the test will be
 * marked as a PASS. The test case object will be passed as the first and only
 * parameter.
 *
 * NOTE #1: The test suite does not stop on failure.
 * NOTE #2: If the executor does not return anything, it will be considered a
 *          PASS. Explicitly "return false" if you wish the test to fail.
 * NOTE #3: If an exception is thrown, it will be logged to the console.
 *
 * Future expansion:
 * -----------------
 *
 *  - I would like to add a way of specifying options, such as:
 *    - suppress colours
 *    - stop on failure
 *    - require explicit "return true" to pass
 *    - progress display in the case of long-running tests?
 */

var testrunner = function(test_cases, executor) {
  for (var i=0, l=test_cases.length; i<l; ++i) {
    var result = false, e = undefined;
    tc = test_cases[i];
    try {
      result = executor(tc);
    } catch (ex) {
      e = ex;
    }

    // only fail the test if the executor explicitly returned false, or an
    // exception was thrown
    if (result !== false) {
      console.log("\033[1;32mPASS\033[m: " + tc.message);
    } else {
      console.log("\033[1;31mFAIL\033[m: " + tc.message);
      if (e) console.log("  "+e+"\n");
    }
  }
}

module.exports = {run: testrunner};
