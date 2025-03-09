/**
 * Test script to check if the frontend can communicate with the backend
 * 
 * This script makes a request to the backend API endpoint and logs the response.
 * It tests both the health check endpoint and a specific API endpoint.
 */

const axios = require('axios');

// Backend API URL from the frontend code
const API_URL = 'http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com/api';

async function testBackendConnection() {
  try {
    console.log('Testing backend connection...');
    
    // Test health check endpoint
    console.log('\n1. Testing health check endpoint...');
    try {
      const healthResponse = await axios.get(API_URL.replace('/api', ''));
      console.log('Health check response:', healthResponse.data);
      console.log('Status:', healthResponse.status);
      console.log('Headers:', healthResponse.headers);
    } catch (error) {
      console.error('Health check failed:', error.response?.data || error.message);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
    }
    
    // Test the mapped API endpoint
    console.log('\n2. Testing token info endpoint (mapped)...');
    try {
      const tokenInfoResponse = await axios.get(`${API_URL}/token-info`);
      console.log('Token info response:', tokenInfoResponse.data);
      console.log('Status:', tokenInfoResponse.status);
      console.log('Headers:', tokenInfoResponse.headers);
    } catch (error) {
      console.error('Token info request failed:', error.response?.data || error.message);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
    }
    
    // Test the direct API endpoint
    console.log('\n3. Testing token info endpoint (direct)...');
    try {
      const directTokenInfoResponse = await axios.get(`${API_URL}/pool/token-info`);
      console.log('Direct token info response:', directTokenInfoResponse.data);
      console.log('Status:', directTokenInfoResponse.status);
      console.log('Headers:', directTokenInfoResponse.headers);
    } catch (error) {
      console.error('Direct token info request failed:', error.response?.data || error.message);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
    }
    
    // Test the presale pool data endpoint (mapped)
    console.log('\n4. Testing presale pool data endpoint (mapped)...');
    try {
      const presalePoolResponse = await axios.get(`${API_URL}/presale-pool-data`);
      console.log('Presale pool data response:', presalePoolResponse.data);
      console.log('Status:', presalePoolResponse.status);
      console.log('Headers:', presalePoolResponse.headers);
    } catch (error) {
      console.error('Presale pool data request failed:', error.response?.data || error.message);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
    }
    
    // Test the presale pool data endpoint (direct)
    console.log('\n5. Testing presale pool data endpoint (direct)...');
    try {
      const directPresalePoolResponse = await axios.get(`${API_URL}/pool/presale-pool-data`);
      console.log('Direct presale pool data response:', directPresalePoolResponse.data);
      console.log('Status:', directPresalePoolResponse.status);
      console.log('Headers:', directPresalePoolResponse.headers);
    } catch (error) {
      console.error('Direct presale pool data request failed:', error.response?.data || error.message);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
    }
    
    // Test the token supply endpoint (mapped)
    console.log('\n6. Testing token supply endpoint (mapped)...');
    try {
      const tokenSupplyResponse = await axios.get(`${API_URL}/token-supply`);
      console.log('Token supply response:', tokenSupplyResponse.data);
      console.log('Status:', tokenSupplyResponse.status);
      console.log('Headers:', tokenSupplyResponse.headers);
    } catch (error) {
      console.error('Token supply request failed:', error.response?.data || error.message);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
    }
    
    // Test the token supply endpoint (direct)
    console.log('\n7. Testing token supply endpoint (direct)...');
    try {
      const directTokenSupplyResponse = await axios.get(`${API_URL}/pool/token-supply`);
      console.log('Direct token supply response:', directTokenSupplyResponse.data);
      console.log('Status:', directTokenSupplyResponse.status);
      console.log('Headers:', directTokenSupplyResponse.headers);
    } catch (error) {
      console.error('Direct token supply request failed:', error.response?.data || error.message);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
    }
    
    console.log('\nBackend connection tests completed.');
  } catch (error) {
    console.error('Error testing backend connection:', error.message);
  }
}

// Run the tests
testBackendConnection();
