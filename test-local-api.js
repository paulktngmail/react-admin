#!/usr/bin/env node

/**
 * Test script to verify API communication locally
 * This script tests the API endpoints directly without going through the proxy
 */

const axios = require('axios');
const chalk = require('chalk'); // You may need to install this: npm install chalk

// Backend API URL
const BACKEND_API_URL = 'http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com';

// Test endpoints
const endpoints = [
  '/api/pool/whitelist',
  '/api/pool/presale/info',
  '/api/pool/token-info'
];

// Function to test an endpoint
async function testEndpoint(url) {
  try {
    console.log(chalk.blue(`Testing endpoint: ${url}`));
    const response = await axios.get(url, { timeout: 10000 });
    console.log(chalk.green(`✅ Success! Status: ${response.status}`));
    console.log(chalk.gray('Response data sample:'));
    console.log(chalk.gray(JSON.stringify(response.data).substring(0, 200) + '...'));
    return true;
  } catch (error) {
    console.log(chalk.red(`❌ Error: ${error.message}`));
    if (error.response) {
      console.log(chalk.red(`Status: ${error.response.status}`));
      console.log(chalk.red(`Data: ${JSON.stringify(error.response.data)}`));
    }
    return false;
  }
}

// Main function to run tests
async function runTests() {
  console.log(chalk.yellow('='.repeat(80)));
  console.log(chalk.yellow('Testing API Communication'));
  console.log(chalk.yellow('='.repeat(80)));
  
  let successCount = 0;
  let failCount = 0;
  
  // Test each endpoint
  for (const endpoint of endpoints) {
    console.log(chalk.yellow('-'.repeat(80)));
    const url = `${BACKEND_API_URL}${endpoint}`;
    const success = await testEndpoint(url);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  console.log(chalk.yellow('='.repeat(80)));
  console.log(chalk.yellow('Test Results:'));
  console.log(chalk.green(`✅ Successful tests: ${successCount}`));
  console.log(chalk.red(`❌ Failed tests: ${failCount}`));
  console.log(chalk.yellow('='.repeat(80)));
  
  if (failCount > 0) {
    console.log(chalk.red('Some tests failed. Please check the API endpoints and try again.'));
    console.log(chalk.yellow('Possible issues:'));
    console.log(chalk.yellow('1. Backend server is not running'));
    console.log(chalk.yellow('2. Backend server is not accessible from your network'));
    console.log(chalk.yellow('3. Backend server is not configured to accept requests from your IP'));
    console.log(chalk.yellow('4. Backend server is not configured to handle the requested endpoints'));
    console.log(chalk.yellow('5. CORS issues preventing the requests'));
  } else {
    console.log(chalk.green('All tests passed! The API is working correctly.'));
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
});
