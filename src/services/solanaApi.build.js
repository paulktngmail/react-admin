// Mock implementation for build process only
// This file is used during the build process to avoid errors with Solana libraries

// Mock data for build and fallback
const mockData = {
  totalSupply: 1500000000,
  presalePoolBalance: 1250000000,
  tokensSold: 250000000,
  tokensSoldForSol: 200000000,
  tokensSoldForFiat: 50000000,
  transactionsNumber: 1250,
  transactions: [
    {
      signature: '5xKVdH4Zk2DMRXDvGSzLWFJYZ5YmYnUARXMoCLMpKA1iqbAWYCgAjCNm9iX9NMkaLQnZEGqRhdvNNvPNouDSDM8r',
      blockTime: new Date().toISOString(),
      slot: 123456789,
      fee: 5000,
      status: 'Success'
    },
    {
      signature: '4tKVdH4Zk2DMRXDvGSzLWFJYZ5YmYnUARXMoCLMpKA1iqbAWYCgAjCNm9iX9NMkaLQnZEGqRhdvNNvPNouDSDM8r',
      blockTime: new Date(Date.now() - 3600000).toISOString(),
      slot: 123456788,
      fee: 5000,
      status: 'Success'
    },
    {
      signature: '3tKVdH4Zk2DMRXDvGSzLWFJYZ5YmYnUARXMoCLMpKA1iqbAWYCgAjCNm9iX9NMkaLQnZEGqRhdvNNvPNouDSDM8r',
      blockTime: new Date(Date.now() - 7200000).toISOString(),
      slot: 123456787,
      fee: 5000,
      status: 'Success'
    }
  ]
};

// Token and wallet addresses from token allocation data
const TOKEN_ADDRESS = 'F4qB6W5tUPHXRE1nfnw7MkLAu3YU7T12o6T52QKq5pQK';
const PRESALE_POOL_ADDRESS = 'bJhdXiRhddYL2wXHjx3CEsGDRDCLYrW5ZxmG4xeSahX';
const REWARDS_POOL_ADDRESS = 'FdYsNj3jhGLcCzoMLA2KZdzUnM3UiwCYUNhMmmFaUDie';
const LIQUIDITY_POOL_ADDRESS = '3HUwa6YYKNdDgsU6nkkMWyBgT2BRtzmD1JpWSg77sa55';
const MARKETING_POOL_ADDRESS = '99AufghSAA7Xj1grrhLgiZMvGXk6XAGLESf1PRJBpoko';
const TEAM_ALLOCATION_ADDRESS = '2MAP3pASkcvdeKnsRS5JGFebYvvAG14ikShtPLbwg4sw';
const TREASURY_RESERVES_ADDRESS = '2BLLHiCHtrYDRUuh4VndsnNPpyJ3AHFp3oMAcxNX1kJj';

// Helper function to get token balance
export const getTokenBalance = async (walletAddress, tokenAddress = TOKEN_ADDRESS) => {
  // Return mock balance based on wallet address
  if (walletAddress === PRESALE_POOL_ADDRESS) return mockData.presalePoolBalance;
  if (walletAddress === REWARDS_POOL_ADDRESS) return 615000000;
  if (walletAddress === LIQUIDITY_POOL_ADDRESS) return 270000000;
  if (walletAddress === MARKETING_POOL_ADDRESS) return 180000000;
  if (walletAddress === TEAM_ALLOCATION_ADDRESS) return 120000000;
  if (walletAddress === TREASURY_RESERVES_ADDRESS) return 45000000;
  return 0;
};

// Helper function to get token supply
export const getTokenSupply = async (tokenAddress = TOKEN_ADDRESS) => {
  return mockData.totalSupply;
};

// Helper function to get transaction count
export const getTransactionCount = async (walletAddress) => {
  return mockData.transactionsNumber;
};

// Helper function to get transaction history
export const getTransactionHistory = async (walletAddress, limit = 10) => {
  return mockData.transactions;
};

// Get presale pool data directly from blockchain
export const getPresalePoolData = async () => {
  return {
    totalSupply: mockData.totalSupply,
    tokensSold: mockData.tokensSold,
    tokensSoldForSol: mockData.tokensSoldForSol,
    tokensSoldForFiat: mockData.tokensSoldForFiat,
    transactionsNumber: mockData.transactionsNumber,
    presalePoolAddress: PRESALE_POOL_ADDRESS,
    tokenAddress: TOKEN_ADDRESS,
    lastUpdated: new Date().toISOString()
  };
};

// Get rewards pool data directly from blockchain
export const getRewardsPoolData = async () => {
  const balance = 615000000;
  const allocation = 615000000;
  return {
    balance,
    allocation,
    percentFilled: 100,
    transactions: mockData.transactionsNumber,
    lastUpdated: new Date().toISOString()
  };
};

// Get liquidity pool data directly from blockchain
export const getLiquidityPoolData = async () => {
  const balance = 270000000;
  const allocation = 270000000;
  return {
    balance,
    allocation,
    percentFilled: 100,
    transactions: mockData.transactionsNumber,
    lastUpdated: new Date().toISOString()
  };
};

// Get marketing pool data directly from blockchain
export const getMarketingPoolData = async () => {
  const balance = 180000000;
  const allocation = 180000000;
  return {
    balance,
    allocation,
    percentFilled: 100,
    transactions: mockData.transactionsNumber,
    lastUpdated: new Date().toISOString()
  };
};

// Get team allocation data directly from blockchain
export const getTeamAllocationData = async () => {
  const balance = 120000000;
  const allocation = 120000000;
  return {
    balance,
    allocation,
    percentFilled: 100,
    transactions: mockData.transactionsNumber,
    lastUpdated: new Date().toISOString()
  };
};

// Get treasury reserves data directly from blockchain
export const getTreasuryReservesData = async () => {
  const balance = 45000000;
  const allocation = 45000000;
  return {
    balance,
    allocation,
    percentFilled: 100,
    transactions: mockData.transactionsNumber,
    lastUpdated: new Date().toISOString()
  };
};

// Get token information directly from blockchain
export const getTokenInfo = async () => {
  // Note: In the real implementation, this would call the API endpoint
  // const response = await axios.get(`${API_URL}/pool/token-info`);
  // return response.data;
  
  return {
    name: 'DPNET-10',
    symbol: 'DPNET',
    decimals: 6,
    totalSupply: mockData.totalSupply,
    circulatingSupply: mockData.tokensSold,
    address: TOKEN_ADDRESS,
    owner: 'Admin',
    mintAuthority: true,
    freezeAuthority: true
  };
};

export default {
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
