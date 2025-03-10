/**
 * Test script to verify the deployed frontend's API access
 */

const axios = require('axios');

// Deployed Frontend URL
const DEPLOYED_URL = 'https://admin.dash628.com';

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
        'Accept': 'application/json'
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
  console.log('Testing Deployed Frontend API Access');
  console.log('='.repeat(80));
  
  let successCount = 0;
  let failCount = 0;
  
  // Test each endpoint
  for (const endpoint of endpoints) {
    console.log('-'.repeat(80));
    const url = `${DEPLOYED_URL}${endpoint}`;
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
    console.log('Some tests failed. Please check the deployed frontend configuration and try again.');
    console.log('Possible issues:');
    console.log('1. Amplify proxy configuration is incorrect');
    console.log('2. _redirects file is not properly configured');
    console.log('3. Backend server is not accessible from the deployed frontend');
    console.log('4. CORS issues preventing the requests');
    console.log('5. Network connectivity issues');
    console.log('6. Protocol mismatch (HTTPS frontend trying to access HTTP backend)');
  } else {
    console.log('All tests passed! The deployed frontend API access is working correctly.');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
});
