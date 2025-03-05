// API service for interacting with the backend

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Presale Overview API
export const getPresaleInfo = async () => {
  try {
    const response = await fetch(`${API_URL}/presale/info`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching presale info:', error);
    throw error;
  }
};

export const extendPresaleTime = async (minutes) => {
  try {
    const response = await fetch(`${API_URL}/presale/extend-time`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ minutes }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error extending presale time:', error);
    throw error;
  }
};

// Presale Management API
export const pausePresale = async () => {
  try {
    const response = await fetch(`${API_URL}/presale/pause`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Error pausing presale:', error);
    throw error;
  }
};

export const resumePresale = async () => {
  try {
    const response = await fetch(`${API_URL}/presale/resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Error resuming presale:', error);
    throw error;
  }
};

export const updatePresaleParams = async (params) => {
  try {
    const response = await fetch(`${API_URL}/presale/update-params`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating presale parameters:', error);
    throw error;
  }
};

export const withdrawUnsoldTokens = async (amount) => {
  try {
    const response = await fetch(`${API_URL}/presale/withdraw-unsold`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error withdrawing unsold tokens:', error);
    throw error;
  }
};

// Token Management API
export const getTokenInfo = async () => {
  try {
    const response = await fetch(`${API_URL}/token/info`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching token info:', error);
    throw error;
  }
};

export const transferTokens = async (recipient, amount) => {
  try {
    const response = await fetch(`${API_URL}/token/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipient, amount }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error transferring tokens:', error);
    throw error;
  }
};

export const mintTokens = async (recipient, amount) => {
  try {
    const response = await fetch(`${API_URL}/token/mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipient, amount }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error minting tokens:', error);
    throw error;
  }
};

export const burnTokens = async (amount) => {
  try {
    const response = await fetch(`${API_URL}/token/burn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error burning tokens:', error);
    throw error;
  }
};

// Whitelist Management API
export const getWhitelistedUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/whitelist`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching whitelisted users:', error);
    throw error;
  }
};

export const addToWhitelist = async (address, allocation) => {
  try {
    const response = await fetch(`${API_URL}/whitelist/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address, allocation }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error adding to whitelist:', error);
    throw error;
  }
};

export const bulkAddToWhitelist = async (addresses, allocation) => {
  try {
    const response = await fetch(`${API_URL}/whitelist/bulk-add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ addresses, allocation }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error bulk adding to whitelist:', error);
    throw error;
  }
};

export const removeFromWhitelist = async (address) => {
  try {
    const response = await fetch(`${API_URL}/whitelist/remove`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error removing from whitelist:', error);
    throw error;
  }
};

// Testing Tools API
export const runTokenTests = async () => {
  try {
    const response = await fetch(`${API_URL}/tests/token`, {
      method: 'POST',
    });
    return await response.json();
  } catch (error) {
    console.error('Error running token tests:', error);
    throw error;
  }
};

export const runDynamoDBTests = async () => {
  try {
    const response = await fetch(`${API_URL}/tests/dynamodb`, {
      method: 'POST',
    });
    return await response.json();
  } catch (error) {
    console.error('Error running DynamoDB tests:', error);
    throw error;
  }
};

export const runRDSTests = async () => {
  try {
    const response = await fetch(`${API_URL}/tests/rds`, {
      method: 'POST',
    });
    return await response.json();
  } catch (error) {
    console.error('Error running RDS tests:', error);
    throw error;
  }
};

export const runSolanaTests = async () => {
  try {
    const response = await fetch(`${API_URL}/tests/solana`, {
      method: 'POST',
    });
    return await response.json();
  } catch (error) {
    console.error('Error running Solana tests:', error);
    throw error;
  }
};

export default {
  // Presale Overview
  getPresaleInfo,
  extendPresaleTime,
  
  // Presale Management
  pausePresale,
  resumePresale,
  updatePresaleParams,
  withdrawUnsoldTokens,
  
  // Token Management
  getTokenInfo,
  transferTokens,
  mintTokens,
  burnTokens,
  
  // Whitelist Management
  getWhitelistedUsers,
  addToWhitelist,
  bulkAddToWhitelist,
  removeFromWhitelist,
  
  // Testing Tools
  runTokenTests,
  runDynamoDBTests,
  runRDSTests,
  runSolanaTests,
};
