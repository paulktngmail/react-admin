/**
 * Test script to verify the fixed API communication between frontend and backend
 * 
 * This script tests the API endpoints after removing the double /api/ prefix
 */

const axios = require('axios');

// Backend API URL from the frontend code
const API_URL = 'http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com/api';

async function testFixedConnection() {
  try {
    console.log('Testing fixed backend connection...');
    console.log(`Using API URL: ${API_URL}`);
    
    // Test the presale info endpoint
    console.log('\n1. Testing presale pool data endpoint...');
    try {
      const presaleInfoResponse = await axios.get(`${API_URL}/pool/presale-pool-data`);
      console.log('Presale info response status:', presaleInfoResponse.status);
      console.log('Presale info data:', presaleInfoResponse.data);
    } catch (error) {
      console.error('Presale info request failed:', error.response?.data || error.message);
      console.error('Status:', error.response?.status);
      if (error.response?.status === 404) {
        console.error('This suggests the endpoint path is still incorrect.');
      }
    }
    
    // Test the token info endpoint
    console.log('\n2. Testing token info endpoint...');
    try {
      const tokenInfoResponse = await axios.get(`${API_URL}/pool/token-info`);
      console.log('Token info response status:', tokenInfoResponse.status);
      console.log('Token info data:', tokenInfoResponse.data);
    } catch (error) {
      console.error('Token info request failed:', error.response?.data || error.message);
      console.error('Status:', error.response?.status);
      if (error.response?.status === 404) {
        console.error('This suggests the endpoint path is still incorrect.');
      }
    }
    
    // Test CORS configuration
    console.log('\n3. Checking CORS headers...');
    try {
      const corsResponse = await axios.options(`${API_URL}/pool/presale-pool-data`);
      console.log('CORS headers:', corsResponse.headers);
      
      if (corsResponse.headers['access-control-allow-origin']) {
        console.log('CORS is properly configured with Access-Control-Allow-Origin header.');
      } else {
        console.log('CORS might not be properly configured. No Access-Control-Allow-Origin header found.');
      }
    } catch (error) {
      console.error('CORS check failed:', error.message);
    }
    
    console.log('\nConnection tests completed.');
  } catch (error) {
    console.error('Error testing connection:', error.message);
  }
}

// Run the tests
testFixedConnection();
