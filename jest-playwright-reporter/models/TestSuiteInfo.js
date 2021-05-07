class TestSuiteInfo {
  constructor(testResult) {
    this.path = testResult.testFilePath;
    this.numFailedTests = testResult.numFailingTests;
    this.numPassedTests = testResult.numPassingTests;
    this.message = testResult.failureMessage;
    this.startTime = testResult.perfStats.start;
    this.endTime = testResult.perfStats.end;
  }
}

module.exports = TestSuiteInfo;
