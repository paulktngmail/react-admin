/**
 * Test script to verify the frontend proxy to the backend API
 */

const axios = require('axios');

// Frontend URL (local development server)
const FRONTEND_URL = 'http://localhost:3000';

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
  console.log('Testing Frontend Proxy to Backend API');
  console.log('='.repeat(80));
  console.log('Note: Make sure the frontend development server is running on port 3000');
  console.log('='.repeat(80));
  
  let successCount = 0;
  let failCount = 0;
  
  // Test each endpoint
  for (const endpoint of endpoints) {
    console.log('-'.repeat(80));
    const url = `${FRONTEND_URL}${endpoint}`;
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
    console.log('Some tests failed. Please check the frontend proxy configuration and try again.');
    console.log('Possible issues:');
    console.log('1. Frontend development server is not running');
    console.log('2. Proxy configuration in setupProxy.js is incorrect');
    console.log('3. Backend server is not accessible from the frontend');
    console.log('4. CORS issues preventing the requests');
    console.log('5. Network connectivity issues');
  } else {
    console.log('All tests passed! The frontend proxy is working correctly.');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
});
