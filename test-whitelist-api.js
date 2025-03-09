// Test script to verify whitelist API endpoints

const fetch = require('node-fetch');

// API URL
const API_URL = 'http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com/api';

// Test functions
async function testGetWhitelistedUsers() {
  try {
    console.log('Testing GET /api/pool/whitelist...');
    const response = await fetch(`${API_URL}/pool/whitelist`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Success! Received whitelist data:');
    console.log(JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error fetching whitelisted users:', error.message);
    return false;
  }
}

async function testAddToWhitelist() {
  try {
    console.log('Testing POST /api/pool/whitelist/add...');
    const testAddress = 'GK2zqSsXLA2rwVZk347RYhh6jJpRsCA69FjLW93ZGi3B';
    
    const response = await fetch(`${API_URL}/pool/whitelist/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        address: testAddress, 
        allocation: 0,
        email: 'test@example.com'
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText} - ${JSON.stringify(data)}`);
    }
    
    console.log('Success! Added user to whitelist:');
    console.log(JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error adding to whitelist:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('Starting whitelist API tests...');
  console.log('API URL:', API_URL);
  console.log('-----------------------------------');
  
  const getResult = await testGetWhitelistedUsers();
  console.log('-----------------------------------');
  
  const addResult = await testAddToWhitelist();
  console.log('-----------------------------------');
  
  if (getResult && addResult) {
    console.log('All tests passed! The whitelist API is working correctly.');
  } else {
    console.log('Some tests failed. Please check the errors above.');
  }
}

// Run the tests
runTests();
