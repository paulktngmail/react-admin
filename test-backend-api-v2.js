/**
 * Test script to verify the backend API after deployment
 * This script tests the backend API endpoints using HTTPS
 */

const axios = require('axios');

// Backend API URL with HTTPS
const BACKEND_API_URL = 'https://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com';

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
      },
      // Ignore SSL certificate errors (for testing only)
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
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
      console.log(`Headers: ${JSON.stringify(error.response.headers)}`);
    }
    return false;
  }
}

// Main function to run tests
async function runTests() {
  console.log('='.repeat(80));
  console.log('Testing Backend API Endpoints via HTTPS');
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
    console.log('6. HTTPS certificate issues');
    
    // Try HTTP instead of HTTPS
    console.log('\nTrying HTTP instead of HTTPS...');
    const httpUrl = BACKEND_API_URL.replace('https://', 'http://');
    console.log(`Testing endpoint: ${httpUrl}/api/pool/whitelist`);
    try {
      const response = await axios.get(`${httpUrl}/api/pool/whitelist`, { 
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Origin': 'https://admin.dash628.com'
        }
      });
      console.log(`✅ Success with HTTP! Status: ${response.status}`);
      console.log('Response data:');
      console.log(JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
      console.log('\nThe backend API is accessible via HTTP but not HTTPS. You may need to configure HTTPS properly.');
    } catch (error) {
      console.log(`❌ Error with HTTP: ${error.message}`);
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log(`Data: ${JSON.stringify(error.response.data)}`);
      }
    }
  } else {
    console.log('All tests passed! The backend API is working correctly via HTTPS.');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
});
