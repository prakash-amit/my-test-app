const { registerRunResults, getSasUri, addTestSuiteInformation, getNextTestCaseId } = require('./helpers');
const RunInfo = require('./models/RunInfo');
const TestCaseInfo = require('./models/TestCaseInfo');
const TestSuiteInfo = require('./models/TestSuiteInfo');
const testResultsFileZipped = 'testResults.zip';

class PlaywrightReporter {
  /**
   * constructor for the reporter
   *
   * @param {Object} globalConfig - Jest configuration object
   * @param {Object} options - Options object defined in jest config
   */
  constructor(globalConfig, options = {}) {
    this._globalConfig = globalConfig;
    this.options = options;
    this.accountId = options.accountId ? options.accountId : process.env.ACCOUNT_ID;
    this.tenantId = options.tenantId ? options.tenantId : process.env.TENANT_ID;
    this.runId = process.env.RUN_ID ? process.env.RUN_ID  : process.env.GITHUB_RUN_ID;
    this.postRunUrl = options.postRunUrl ? options.postRunUrl
      : `https://${process.env.ENDPOINT}/api/runs/${process.env.TENANT_ID}`;
    this.workflowId = options.workflowId ? options.workflowId : process.env.WORKFLOW_ID;
    this.workflowName = options.workflowName ? options.workflowName : process.env.GITHUB_WORKFLOW;
    this.workflowUrl = options.workflowUrl ? options.workflowUrl : process.env.WORKFLOW_URL;
    this.repo = options.repo ? options.repo : process.env.GITHUB_REPOSITORY;
    this.branch = process.env.BRANCH_NAME;
    this.triggerType = options.triggerType ? options.triggerType : process.env.TRIGGER_TYPE;
    this.triggerId = process.env.TRIGGER_ID ? process.env.TRIGGER_ID : process.env.GITHUB_SHA;
    this.triggerUrl = process.env.REPO_URI ? `${process.env.REPO_URI}/commit/${process.env.TRIGGER_ID}`:`https://www.github.com/${process.env.GITHUB_REPOSITORY}/commit/${process.env.GITHUB_SHA}`;
    this.testIdCounter = Number(process.env.ID);
    this.sasUriMap = new Map();
  }

  async onRunStart() {
    const sasUri = await getSasUri('Write', `${testResultsFileZipped}`);
  }

  /**
   * @param {string} test - The Test last run
   * @param {TestRunResult} runResult - Results from the test run
   */
  onRunComplete(test, runResult) {
    const runInfo = new RunInfo(runResult);
    runInfo.id = this.runId;
   // runInfo.accountId = this.accountId;
    runInfo.tenantId = this.tenantId;
    runInfo.workflowId = this.workflowId;
    runInfo.workflowName = this.workflowName;
    runInfo.workflowUrl = this.workflowUrl;
    runInfo.repo = this.repo;
    runInfo.branch = this.branch;
    runInfo.triggerType = this.triggerType;
    runInfo.triggerId = this.triggerId;
    runInfo.triggerUrl = this.triggerUrl;
    runInfo.endTime = Date.now();

    registerRunResults(runResult, runInfo, this.postRunUrl);
  }

  onTestResult(testContext, testSuiteResult, runResultAsOfNow) {
    const testCases = [];

    for ( let j = 0; j < testSuiteResult.testResults.length; j++ ) {
      let testCaseId = getNextTestCaseId();
      const testCaseInfo = new TestCaseInfo( testCaseId, testSuiteResult.testResults[j] );
      testCases.push( testCaseInfo );
    }

    const testSuiteInfo = new TestSuiteInfo( testSuiteResult );
    testSuiteInfo.tests = testCases;

    addTestSuiteInformation(testSuiteInfo);
  }
}

module.exports = PlaywrightReporter;
