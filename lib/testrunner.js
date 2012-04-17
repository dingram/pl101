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
