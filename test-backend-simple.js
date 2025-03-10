/**
 * Simple test script to verify the backend API endpoints directly
 */

const axios = require('axios');

// Backend API URL
const BACKEND_API_URL = 'http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com';

// Test endpoints
const endpoints = [
  '/api/pool/whitelist',
  '/api/pool/presale/info',
  '/api/pool/token-info',
  '/api/pool/presale-pool-data'
];

// Function to test an endpoint
async function testEndpoint(url) {
  try {
    console.log(`Testing endpoint: ${url}`);
    const response = await axios.get(url, { 
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://admin.dash628.com'
      }
    });
    console.log(`✅ Success! Status: ${response.status}`);
    console.log('Response data:');
    console.log(JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

// Main function to run tests
async function runTests() {
  console.log('='.repeat(80));
  console.log('Testing Backend API Endpoints Directly');
  console.log('='.repeat(80));
  
  let successCount = 0;
  let failCount = 0;
  
  // Test each endpoint
  for (const endpoint of endpoints) {
    console.log('-'.repeat(80));
    const url = `${BACKEND_API_URL}${endpoint}`;
    const success = await testEndpoint(url);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  console.log('='.repeat(80));
  console.log('Test Results:');
  console.log(`✅ Successful tests: ${successCount}`);
  console.log(`❌ Failed tests: ${failCount}`);
  console.log('='.repeat(80));
  
  if (failCount > 0) {
    console.log('Some tests failed. Please check the backend API endpoints and try again.');
    console.log('Possible issues:');
    console.log('1. Backend server is not running');
    console.log('2. Backend server is not accessible from your network');
    console.log('3. Backend server is not configured to accept requests from your IP');
    console.log('4. Backend server is not configured to handle the requested endpoints');
    console.log('5. CORS issues preventing the requests');
  } else {
    console.log('All tests passed! The backend API is working correctly.');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
});
