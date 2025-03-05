// Solana API service for blockchain interactions
// This file connects to our backend API server which handles the actual Solana blockchain interactions

import axios from 'axios';

// Backend API URL
const API_URL = 'http://localhost:3001/api';

// Token and wallet addresses
const TOKEN_ADDRESS = 'F4qB6W5tUPHXRE1nfnw7MkLAu3YU7T12o6T52QKq5pQK';
const PRESALE_POOL_ADDRESS = 'bJhdXiRhddYL2wXHjx3CEsGDRDCLYrW5ZxmG4xeSahX';
const REWARDS_POOL_ADDRESS = 'FdYsNj3jhGLcCzoMLA2KZdzUnM3UiwCYUNhMmmFaUDie';
const LIQUIDITY_POOL_ADDRESS = '3HUwa6YYKNdDgsU6nkkMWyBgT2BRtzmD1JpWSg77sa55';
const MARKETING_POOL_ADDRESS = '99AufghSAA7Xj1grrhLgiZMvGXk6XAGLESf1PRJBpoko';
const TEAM_ALLOCATION_ADDRESS = '2MAP3pASkcvdeKnsRS5JGFebYvvAG14ikShtPLbwg4sw';
const TREASURY_RESERVES_ADDRESS = '2BLLHiCHtrYDRUuh4VndsnNPpyJ3AHFp3oMAcxNX1kJj';

// Helper function to get token balance
export const getTokenBalance = async (walletAddress, tokenAddress = TOKEN_ADDRESS) => {
  try {
    console.log(`Getting token balance for ${walletAddress}`);
    const response = await axios.get(`${API_URL}/token-balance/${walletAddress}`, {
      params: { tokenAddress }
    });
    return response.data.balance;
  } catch (error) {
    console.error('Error getting token balance:', error);
    throw error;
  }
};

// Helper function to get token supply
export const getTokenSupply = async (tokenAddress = TOKEN_ADDRESS) => {
  try {
    console.log(`Getting token supply for ${tokenAddress}`);
    const response = await axios.get(`${API_URL}/token-supply`, {
      params: { tokenAddress }
    });
    return response.data.supply;
  } catch (error) {
    console.error('Error getting token supply:', error);
    throw error;
  }
};

// Helper function to get transaction count
export const getTransactionCount = async (walletAddress) => {
  try {
    console.log(`Getting transaction count for ${walletAddress}`);
    const response = await axios.get(`${API_URL}/transaction-count/${walletAddress}`);
    return response.data.count;
  } catch (error) {
    console.error('Error getting transaction count:', error);
    throw error;
  }
};

// Helper function to get transaction history
export const getTransactionHistory = async (walletAddress, limit = 10) => {
  try {
    console.log(`Getting transaction history for ${walletAddress}, limit: ${limit}`);
    const response = await axios.get(`${API_URL}/transaction-history/${walletAddress}`, {
      params: { limit }
    });
    return response.data.transactions;
  } catch (error) {
    console.error('Error getting transaction history:', error);
    throw error;
  }
};

// Get presale pool data directly from blockchain
export const getPresalePoolData = async () => {
  try {
    console.log('Getting presale pool data');
    const response = await axios.get(`${API_URL}/presale-pool-data`);
    return response.data;
  } catch (error) {
    console.error('Error getting presale pool data:', error);
    throw error;
  }
};

// Get rewards pool data directly from blockchain
export const getRewardsPoolData = async () => {
  try {
    console.log('Getting rewards pool data');
    const response = await axios.get(`${API_URL}/rewards-pool-data`);
    return response.data;
  } catch (error) {
    console.error('Error getting rewards pool data:', error);
    throw error;
  }
};

// Get liquidity pool data directly from blockchain
export const getLiquidityPoolData = async () => {
  try {
    console.log('Getting liquidity pool data');
    const response = await axios.get(`${API_URL}/liquidity-pool-data`);
    return response.data;
  } catch (error) {
    console.error('Error getting liquidity pool data:', error);
    throw error;
  }
};

// Get marketing pool data directly from blockchain
export const getMarketingPoolData = async () => {
  try {
    console.log('Getting marketing pool data');
    const response = await axios.get(`${API_URL}/marketing-pool-data`);
    return response.data;
  } catch (error) {
    console.error('Error getting marketing pool data:', error);
    throw error;
  }
};

// Get team allocation data directly from blockchain
export const getTeamAllocationData = async () => {
  try {
    console.log('Getting team allocation data');
    const response = await axios.get(`${API_URL}/team-allocation-data`);
    return response.data;
  } catch (error) {
    console.error('Error getting team allocation data:', error);
    throw error;
  }
};

// Get treasury reserves data directly from blockchain
export const getTreasuryReservesData = async () => {
  try {
    console.log('Getting treasury reserves data');
    const response = await axios.get(`${API_URL}/treasury-reserves-data`);
    return response.data;
  } catch (error) {
    console.error('Error getting treasury reserves data:', error);
    throw error;
  }
};

// Get token information directly from blockchain
export const getTokenInfo = async () => {
  try {
    console.log('Getting token info');
    const response = await axios.get(`${API_URL}/token-info`);
    return response.data;
  } catch (error) {
    console.error('Error getting token info:', error);
    throw error;
  }
};

const solanaApi = {
  getTokenBalance,
  getTokenSupply,
  getTransactionCount,
  getTransactionHistory,
  getPresalePoolData,
  getRewardsPoolData,
  getLiquidityPoolData,
  getMarketingPoolData,
  getTeamAllocationData,
  getTreasuryReservesData,
  getTokenInfo
};

export default solanaApi;
