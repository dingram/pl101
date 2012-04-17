var testrunner = function(test_cases, executor) {
  for (var i in test_cases) {
    if (/[^0-9]/.test(i)) continue;
    tc = test_cases[i];
    var result = false, ex = undefined;
    try {
      result = executor(tc);
    } catch (e) {
      ex = e;
    }

    // only fail the test if the executor explicitly returned false, or an
    // exception was thrown
    if (result !== false) {
      console.log("\033[1;32mPASS\033[m: " + tc.message);
    } else {
      console.log("\033[1;31mFAIL\033[m: " + tc.message);
      if (ex) console.log("  "+ex+"\n");
    }
  }
}

module.exports = {run: testrunner};
