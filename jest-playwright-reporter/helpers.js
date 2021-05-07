const childProcess = require('child_process');
const storage = require('@azure/storage-blob');
const fs = require('fs');
const { getPostRunConfig, getSasTokenConfig, callAPI } = require('./httpClient');
const TestCaseInfo = require('./models/TestCaseInfo');
const TestSuiteInfo = require('./models/TestSuiteInfo');
const https = require('https');
const axios = require('axios');
const testResultsFile = 'testResults.json';
const testResultsFileZipped = 'testResults.zip';
const sasUriMap = new Map();

/*
async function getSasUri(runId, accountId) {
  const sasApiUrl = `https://${process.env.ENDPOINT}/api/${accountId}/sasuri?runId=${runId}`;
  const config = await getSasTokenConfig(
    'get',
    sasApiUrl,
  );
  const response = await callAPI(config);
  return response.data.sasUri;
}
*/

async function getSasUri(permission, fileRelativePath) {
  try {
    let paths = [];
    paths.push(fileRelativePath);
    let obj = {
        paths
    }
    const url =  `https://${process.env.ENDPOINT}/api/artifacts/${process.env.TENANT_ID}/sasuri/${process.env.RUN_ID}?op=${permission}`;
    const method = 'POST';
    const data = JSON.stringify(obj);
    const config = await getSasTokenConfig(method, url, data);

    const response = await callAPI(config);

    sasUriMap.set(fileRelativePath, response.data.sasUris[0]);
    return response;
  }
  catch (err) {
      console.error("error fetching sasuri \n" + err);
  }
}

async function createBlobInContainer(uri, file) {
  try{
    const blobClient = new storage.BlockBlobClient(uri);
    const response = await blobClient.uploadFile(file);
    return response;
  }
  catch(error){
    //console.log("upload error : \n" + error);
  }
}

async function registerTestResults() {
  try {
    fs.writeFileSync(testResultsFile, JSON.stringify(testSuites));
    //childProcess.execSync(`zip testResults ${testResultsFile}`);
    childProcess.execSync(`C:\\Windows\\System32\\tar.exe -a -c -f ${testResultsFileZipped} ${testResultsFile}`);

    const sasUri = sasUriMap.get(`${testResultsFileZipped}`);
    if (fs.existsSync(testResultsFileZipped) && sasUri ) {
     const response = await createBlobInContainer(sasUri, testResultsFileZipped);

     sasUriMap.delete(`${testResultsFileZipped}`);
     await getSasUri('Read', `${testResultsFileZipped}`);
     return "Uploaded testReport";
    }
  } catch (error) {
    console.log("error while uploading \n" + error);
  }
}

async function registerRunResults(runResult, runInfo, postRunUrl) {
await registerTestResults();

let testResults = [];
testResults.push(sasUriMap.get(`${testResultsFileZipped}`));
runInfo.testResults = testResults;

const url =  `https://${process.env.ENDPOINT}/api/runs/${process.env.TENANT_ID}`;
const method = 'POST';
const data = JSON.stringify(runInfo);
const config = await getPostRunConfig(method, url, data);
try{
  const response = await callAPI(config);
}
catch( error ) {
  console.log("run results uploaded error \n" + error);
}

}

let id = 0;
const testSuites = [];

function addTestSuiteInformation(testSuiteInfo) {
  testSuites.push(testSuiteInfo);
}

function getNextTestCaseId(testSuiteInfo) {
  return ++id;
}


module.exports = { registerRunResults, getSasUri, addTestSuiteInformation, getNextTestCaseId };
