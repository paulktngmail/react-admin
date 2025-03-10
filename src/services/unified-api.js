/**
 * Unified API Service
 * This service provides a standardized way to interact with the backend API
 */

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor
api.interceptors.request.use(
  config => {
    // Log all API requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  response => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.status} ${response.statusText}`);
    }
    return response;
  },
  error => {
    // Handle common errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.status, error.response.data);
      
      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          console.error('Authentication error: User is not authenticated');
          break;
        case 403:
          console.error('Authorization error: User does not have permission');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error(`Error with status code: ${error.response.status}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response:', error.request);
      
      // Check if it's a network error
      if (error.message.includes('Network Error')) {
        console.error('Network error: Please check your internet connection or the backend server might be down');
      } else if (error.message.includes('timeout')) {
        console.error('Request timeout: The server took too long to respond');
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Request Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Whitelist Management API
const whitelist = {
  getWhitelistedUsers: async () => {
    const response = await api.get('/pool/whitelist');
    return response.data;
  },
  
  addToWhitelist: async (address, allocation, email) => {
    const response = await api.post('/pool/whitelist/add', {
      address,
      allocation,
      email
    });
    return response.data;
  },
  
  bulkAddToWhitelist: async (addresses, allocation) => {
    const response = await api.post('/pool/whitelist/bulk-add', {
      addresses,
      allocation
    });
    return response.data;
  },
  
  removeFromWhitelist: async (address) => {
    const response = await api.delete('/pool/whitelist/remove', {
      data: { address }
    });
    return response.data;
  }
};

// Presale API
const presale = {
  getPresaleInfo: async () => {
    const response = await api.get('/pool/presale/info');
    return response.data;
  },
  
  getPresalePoolData: async () => {
    const response = await api.get('/pool/presale-pool-data');
    return response.data;
  },
  
  extendPresaleTime: async (minutes) => {
    const response = await api.post('/pool/presale/extend-time', {
      minutes
    });
    return response.data;
  },
  
  pausePresale: async () => {
    const response = await api.post('/pool/presale/pause');
    return response.data;
  },
  
  resumePresale: async () => {
    const response = await api.post('/pool/presale/resume');
    return response.data;
  },
  
  updatePresaleParams: async (params) => {
    const response = await api.post('/pool/presale/update-params', params);
    return response.data;
  },
  
  withdrawUnsoldTokens: async (amount) => {
    const response = await api.post('/pool/presale/withdraw-unsold', {
      amount
    });
    return response.data;
  }
};

// Token API
const token = {
  getTokenInfo: async () => {
    const response = await api.get('/pool/token-info');
    return response.data;
  },
  
  getTokenBalance: async (walletAddress, tokenAddress) => {
    const response = await api.get(`/pool/token-balance/${walletAddress}`, {
      params: { tokenAddress }
    });
    return response.data;
  },
  
  getTokenSupply: async (tokenAddress) => {
    const response = await api.get('/pool/token-supply', {
      params: { tokenAddress }
    });
    return response.data;
  },
  
  transferTokens: async (recipient, amount) => {
    const response = await api.post('/pool/token/transfer', {
      recipient,
      amount
    });
    return response.data;
  },
  
  mintTokens: async (recipient, amount) => {
    const response = await api.post('/pool/token/mint', {
      recipient,
      amount
    });
    return response.data;
  },
  
  burnTokens: async (amount) => {
    const response = await api.post('/pool/token/burn', {
      amount
    });
    return response.data;
  }
};

// Transaction API
const transaction = {
  getTransactionCount: async (walletAddress) => {
    const response = await api.get(`/pool/transaction-count/${walletAddress}`);
    return response.data;
  },
  
  getTransactionHistory: async (walletAddress, limit = 10) => {
    const response = await api.get(`/pool/transaction-history/${walletAddress}`, {
      params: { limit }
    });
    return response.data;
  }
};

// Pool Data API
const poolData = {
  getRewardsPoolData: async () => {
    const response = await api.get('/pool/rewards-pool-data');
    return response.data;
  },
  
  getLiquidityPoolData: async () => {
    const response = await api.get('/pool/liquidity-pool-data');
    return response.data;
  },
  
  getMarketingPoolData: async () => {
    const response = await api.get('/pool/marketing-pool-data');
    return response.data;
  },
  
  getTeamAllocationData: async () => {
    const response = await api.get('/pool/team-allocation-data');
    return response.data;
  },
  
  getTreasuryReservesData: async () => {
    const response = await api.get('/pool/treasury-reserves-data');
    return response.data;
  }
};

// Testing API
const testing = {
  runTokenTests: async () => {
    const response = await api.post('/pool/tests/token');
    return response.data;
  },
  
  runDynamoDBTests: async () => {
    const response = await api.post('/pool/tests/dynamodb');
    return response.data;
  },
  
  runRDSTests: async () => {
    const response = await api.post('/pool/tests/rds');
    return response.data;
  },
  
  runSolanaTests: async () => {
    const response = await api.post('/pool/tests/solana');
    return response.data;
  }
};

// Export the unified API
export default {
  whitelist,
  presale,
  token,
  transaction,
  poolData,
  testing,
  // Also export the axios instance for custom requests
  instance: api
};
