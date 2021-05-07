class RunInfo {
  constructor(runResult) {
    this.numTotalTestSuites = runResult.numTotalTestSuites;
    this.numFailedTestSuites = runResult.numFailedTestSuites;
    this.numPassedTestSuites = runResult.numPassedTestSuites;
    this.numTotalTests = runResult.numTotalTests;
    this.numFailedTests = runResult.numFailedTests;
    this.numPassedTests = runResult.numPassedTests;
    this.startTime = runResult.startTime;
    this.status = (runResult.numFailedTestSuites === 0) ? 'passed' : 'failed';
  }
}

module.exports = RunInfo;
