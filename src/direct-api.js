/**
 * Direct API service for making requests directly to the backend
 * This bypasses the proxy configuration and makes requests directly to the backend
 */

import axios from 'axios';

// Backend API URL - using absolute URL to ensure proper connection
const BACKEND_API_URL = 'https://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com/api';

// Create an axios instance with the backend API URL
const directApi = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': 'https://www.dash628.com'
  }
});

// Whitelist Management API
export const getWhitelistedUsers = async () => {
  try {
    const response = await directApi.get('/pool/whitelist');
    return response.data;
  } catch (error) {
    console.error('Error fetching whitelisted users:', error);
    throw error;
  }
};

export const addToWhitelist = async (address, allocation, email) => {
  try {
    const response = await directApi.post('/pool/whitelist/add', {
      address,
      allocation,
      email
    });
    return response.data;
  } catch (error) {
    console.error('Error adding to whitelist:', error);
    throw error;
  }
};

export const bulkAddToWhitelist = async (addresses, allocation) => {
  try {
    const response = await directApi.post('/pool/whitelist/bulk-add', {
      addresses,
      allocation
    });
    return response.data;
  } catch (error) {
    console.error('Error bulk adding to whitelist:', error);
    throw error;
  }
};

export const removeFromWhitelist = async (address) => {
  try {
    const response = await directApi.delete('/pool/whitelist/remove', {
      data: { address }
    });
    return response.data;
  } catch (error) {
    console.error('Error removing from whitelist:', error);
    throw error;
  }
};

// Presale API
export const getPresaleInfo = async () => {
  try {
    const response = await directApi.get('/pool/presale/info');
    return response.data;
  } catch (error) {
    console.error('Error fetching presale info:', error);
    throw error;
  }
};

export const getPresalePoolData = async () => {
  try {
    const response = await directApi.get('/pool/presale-pool-data');
    return response.data;
  } catch (error) {
    console.error('Error fetching presale pool data:', error);
    throw error;
  }
};

// Token API
export const getTokenInfo = async () => {
  try {
    const response = await directApi.get('/pool/token-info');
    return response.data;
  } catch (error) {
    console.error('Error fetching token info:', error);
    throw error;
  }
};

export const getTokenBalance = async (walletAddress, tokenAddress) => {
  try {
    const response = await directApi.get(`/pool/token-balance/${walletAddress}`, {
      params: { tokenAddress }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    throw error;
  }
};

export const getTransactionHistory = async (walletAddress, limit = 10) => {
  try {
    const response = await directApi.get(`/pool/transaction-history/${walletAddress}`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
};

export default {
  getWhitelistedUsers,
  addToWhitelist,
  bulkAddToWhitelist,
  removeFromWhitelist,
  getPresaleInfo,
  getPresalePoolData,
  getTokenInfo,
  getTokenBalance,
  getTransactionHistory
};
