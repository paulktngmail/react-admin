// Test script to verify API communication between frontend and backend
const axios = require('axios');

// Test endpoints
const endpoints = [
  '/api/pool/whitelist',
  '/api/pool/presale/info',
  '/api/pool/token-info'
];

// Test both direct and proxied endpoints
async function testEndpoints() {
  console.log('Testing API communication...');
  console.log('='.repeat(50));
  
  // Test direct backend endpoint
  try {
    console.log('Testing direct backend endpoint:');
    const directResponse = await axios.get('http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com/api/pool/presale/info');
    console.log('✅ Direct backend endpoint is working!');
    console.log('Response status:', directResponse.status);
    console.log('Response data sample:', JSON.stringify(directResponse.data).substring(0, 100) + '...');
  } catch (error) {
    console.error('❌ Direct backend endpoint failed:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
  
  console.log('-'.repeat(50));
  
  // Test proxied endpoints
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing proxied endpoint: ${endpoint}`);
      const response = await axios.get(`http://localhost:3000${endpoint}`);
      console.log(`✅ Endpoint ${endpoint} is working!`);
      console.log('Response status:', response.status);
      console.log('Response data sample:', JSON.stringify(response.data).substring(0, 100) + '...');
    } catch (error) {
      console.error(`❌ Endpoint ${endpoint} failed:`);
      console.error('Error:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
    }
    console.log('-'.repeat(50));
  }
  
  console.log('API communication test completed.');
}

// Run the tests
testEndpoints();
