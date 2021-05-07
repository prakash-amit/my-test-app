const axios = require('axios');
const https = require('https');

async function getPostRunConfig(method, url, data) {
  const config = {
    url: url,
    method: method,
    data: data,
    headers: {
      'Content-Type': 'application/json',
      'Accept': '*/*',
    },
    httpsAgent: new https.Agent({
      keepAlive: true }),
    timeout: 600000,
  };
  return config;
}

async function getSasTokenConfig(method, url, data) {
  const config = {
    url: url,
    method: method,
    data: data,
    headers: {
      'Content-Type': 'application/json',
      'Accept': '*/*',
    },
    httpsAgent: new https.Agent({
      keepAlive: true }),
    timeout: 600000,
  };
  return config;
}

async function callAPI(config) {
  try {
    const response = await axios(config);
    return response;
  } catch (error) {
    // console.error(error);
    return error;
  }
}

module.exports = {
  getPostRunConfig,
  getSasTokenConfig,
  callAPI,
}
