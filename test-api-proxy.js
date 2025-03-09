// Test script to verify API proxy configuration

const fetch = require('node-fetch');

// API URLs
const DIRECT_API_URL = 'http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com/api';
const PROXIED_API_URL = 'https://admin.dash628.com/api';

// Test functions
async function testDirectAPI() {
  try {
    console.log('Testing direct API endpoint...');
    console.log(`URL: ${DIRECT_API_URL}/pool/whitelist`);
    
    const response = await fetch(`${DIRECT_API_URL}/pool/whitelist`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Success! Received whitelist data from direct API:');
    console.log(JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error fetching from direct API:', error.message);
    return false;
  }
}

async function testProxiedAPI() {
  try {
    console.log('Testing proxied API endpoint...');
    console.log(`URL: ${PROXIED_API_URL}/pool/whitelist`);
    
    const response = await fetch(`${PROXIED_API_URL}/pool/whitelist`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Success! Received whitelist data from proxied API:');
    console.log(JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error fetching from proxied API:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('Starting API proxy tests...');
  console.log('-----------------------------------');
  
  const directResult = await testDirectAPI();
  console.log('-----------------------------------');
  
  const proxiedResult = await testProxiedAPI();
  console.log('-----------------------------------');
  
  if (directResult && proxiedResult) {
    console.log('All tests passed! The API proxy is working correctly.');
  } else if (directResult && !proxiedResult) {
    console.log('Direct API is working, but the proxied API is not.');
    console.log('This suggests that the API proxy configuration is not working correctly.');
    console.log('Please check the AWS Amplify deployment and configuration.');
  } else if (!directResult && proxiedResult) {
    console.log('Proxied API is working, but the direct API is not.');
    console.log('This is an unusual situation that suggests the backend might have changed.');
  } else {
    console.log('Both direct and proxied API tests failed.');
    console.log('Please check that the backend is running and accessible.');
  }
}

// Run the tests
runTests();
