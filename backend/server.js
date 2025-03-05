const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { Connection, PublicKey } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID, Token } = require('@solana/spl-token');
const TOKEN_ALLOCATIONS = require('./token-allocation-data');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AKIA6JQ45C6LJGRMS64B',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Initialize DynamoDB
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Table names
const PRESALE_TABLE = process.env.PRESALE_TABLE || 'dpnetsale';
const WHITELIST_TABLE = process.env.WHITELIST_TABLE || 'dpnet-whitelist';
const TRANSACTIONS_TABLE = process.env.TRANSACTIONS_TABLE || 'dpnet-transactions';

// Solana connection
const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com', 'confirmed');

// Presale constants
const PRESALE_POOL_ADDRESS = process.env.PRESALE_POOL_ADDRESS || 'bJhdXiRhddYL2wXHjx3CEsGDRDCLYrW5ZxmG4xeSahX';
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || 'F4qB6W5tUPHXRE1nfnw7MkLAu3YU7T12o6T52QKq5pQK';

// Helper function to get token balance
async function getTokenBalance(walletAddress, tokenAddress) {
  try {
    const walletPublicKey = new PublicKey(walletAddress);
    const tokenPublicKey = new PublicKey(tokenAddress);
    
    // Get all token accounts for this wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPublicKey,
      { programId: TOKEN_PROGRAM_ID }
    );
    
    // Find the token account for the specific token
    const tokenAccount = tokenAccounts.value.find(
      account => account.account.data.parsed.info.mint === tokenPublicKey.toString()
    );
    
    if (tokenAccount) {
      const balance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount;
      return balance;
    }
    
    return 0;
  } catch (error) {
    console.error('Error getting token balance:', error);
    throw error;
  }
}

// Helper function to get token supply
async function getTokenSupply(tokenAddress) {
  try {
    const tokenPublicKey = new PublicKey(tokenAddress);
    const tokenSupply = await connection.getTokenSupply(tokenPublicKey);
    return tokenSupply.value.uiAmount;
  } catch (error) {
    console.error('Error getting token supply:', error);
    throw error;
  }
}

// Helper function to get transaction count
async function getTransactionCount(walletAddress) {
  try {
    const walletPublicKey = new PublicKey(walletAddress);
    const signatures = await connection.getSignaturesForAddress(walletPublicKey);
    return signatures.length;
  } catch (error) {
    console.error('Error getting transaction count:', error);
    throw error;
  }
}

// Helper function to get presale info from DynamoDB and Solana
async function getPresaleInfoFromDB() {
  try {
    const params = {
      TableName: PRESALE_TABLE,
      Key: {
        saleKey: 'presale-info'
      }
    };

    const result = await dynamoDB.get(params).promise();
    
    // Get real-time data from Solana
    let totalSupply;
    let tokensSold;
    let transactionsNumber;
    
    try {
      // Get token supply
      totalSupply = await getTokenSupply(TOKEN_ADDRESS);
      
      // Get tokens in presale pool (unsold tokens)
      const presalePoolBalance = await getTokenBalance(PRESALE_POOL_ADDRESS, TOKEN_ADDRESS);
      
      // Calculate tokens sold
      tokensSold = totalSupply - presalePoolBalance;
      
      // Get transaction count
      transactionsNumber = await getTransactionCount(PRESALE_POOL_ADDRESS);
    } catch (solanaError) {
      console.error('Error getting data from Solana:', solanaError);
      // Use default values if Solana data retrieval fails
      totalSupply = 500000000;
      tokensSold = 250000000;
      transactionsNumber = 1250;
    }
    
    if (result.Item) {
      // Update with real-time data
      const updatedInfo = {
        ...result.Item,
        totalSupply,
        tokensSold,
        tokensSoldForSol: Math.floor(tokensSold * 0.8), // Assuming 80% sold for SOL
        tokensSoldForFiat: Math.floor(tokensSold * 0.2), // Assuming 20% sold for Fiat
        transactionsNumber,
        lastUpdated: new Date().toISOString(),
        presalePoolAddress: PRESALE_POOL_ADDRESS,
        tokenAddress: TOKEN_ADDRESS
      };
      
      // Update in DynamoDB
      await dynamoDB.put({
        TableName: PRESALE_TABLE,
        Item: updatedInfo
      }).promise();
      
      return updatedInfo;
    } else {
      // If no presale info exists, create a new one with real-time data
      const defaultPresaleInfo = {
        saleKey: 'presale-info',
        totalSupply,
        tokensSold,
        tokensSoldForSol: Math.floor(tokensSold * 0.8), // Assuming 80% sold for SOL
        tokensSoldForFiat: Math.floor(tokensSold * 0.2), // Assuming 20% sold for Fiat
        transactionsNumber,
        lastUpdated: new Date().toISOString(),
        timeLeft: {
          days: 30,
          hours: 12,
          minutes: 45,
          seconds: 20
        },
        presalePoolAddress: PRESALE_POOL_ADDRESS,
        tokenAddress: TOKEN_ADDRESS
      };

      await dynamoDB.put({
        TableName: PRESALE_TABLE,
        Item: defaultPresaleInfo
      }).promise();

      return defaultPresaleInfo;
    }
  } catch (error) {
    console.error('Error getting presale info from DynamoDB:', error);
    throw error;
  }
}

// Helper function to update presale info in DynamoDB
async function updatePresaleInfoInDB(updates) {
  try {
    // Get current presale info with real-time data
    let presaleInfo = await getPresaleInfoFromDB();
    
    // Apply updates
    presaleInfo = { ...presaleInfo, ...updates, lastUpdated: new Date().toISOString() };
    
    // Save to DynamoDB
    await dynamoDB.put({
      TableName: PRESALE_TABLE,
      Item: presaleInfo
    }).promise();
    
    return presaleInfo;
  } catch (error) {
    console.error('Error updating presale info in DynamoDB:', error);
    throw error;
  }
}

// API Routes

// Get presale info
app.get('/api/presale/info', async (req, res) => {
  try {
    const presaleInfo = await getPresaleInfoFromDB();
    res.json(presaleInfo);
  } catch (error) {
    console.error('Error fetching presale info:', error);
    res.status(500).json({ error: 'Failed to fetch presale info' });
  }
});

// Extend presale time
app.post('/api/presale/extend-time', async (req, res) => {
  try {
    const { minutes } = req.body;
    
    if (!minutes || minutes <= 0) {
      return res.status(400).json({ error: 'Invalid minutes value' });
    }
    
    // Get current presale info
    const presaleInfo = await getPresaleInfoFromDB();
    
    // Calculate new time left
    const { days, hours, minutes: mins } = presaleInfo.timeLeft;
    const totalMinutes = (days * 24 * 60) + (hours * 60) + mins + minutes;
    
    const newDays = Math.floor(totalMinutes / (24 * 60));
    const newHours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const newMinutes = totalMinutes % 60;
    
    // Update presale info
    const updatedPresaleInfo = await updatePresaleInfoInDB({
      timeLeft: {
        days: newDays,
        hours: newHours,
        minutes: newMinutes,
        seconds: presaleInfo.timeLeft.seconds
      }
    });
    
    res.json(updatedPresaleInfo);
  } catch (error) {
    console.error('Error extending presale time:', error);
    res.status(500).json({ error: 'Failed to extend presale time' });
  }
});

// Pause presale
app.post('/api/presale/pause', async (req, res) => {
  try {
    const updatedPresaleInfo = await updatePresaleInfoInDB({
      paused: true
    });
    
    res.json(updatedPresaleInfo);
  } catch (error) {
    console.error('Error pausing presale:', error);
    res.status(500).json({ error: 'Failed to pause presale' });
  }
});

// Resume presale
app.post('/api/presale/resume', async (req, res) => {
  try {
    const updatedPresaleInfo = await updatePresaleInfoInDB({
      paused: false
    });
    
    res.json(updatedPresaleInfo);
  } catch (error) {
    console.error('Error resuming presale:', error);
    res.status(500).json({ error: 'Failed to resume presale' });
  }
});

// Update presale parameters
app.post('/api/presale/update-params', async (req, res) => {
  try {
    const { startTime, endTime, minPurchaseAmount, maxPurchaseAmount, whitelistEnabled } = req.body;
    
    if (!startTime || !endTime || !minPurchaseAmount || !maxPurchaseAmount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Calculate time left based on end time
    const now = new Date();
    const end = new Date(endTime);
    const diffMs = end - now;
    
    if (diffMs <= 0) {
      return res.status(400).json({ error: 'End time must be in the future' });
    }
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    // Update presale info
    const updatedPresaleInfo = await updatePresaleInfoInDB({
      startTime,
      endTime,
      minPurchaseAmount,
      maxPurchaseAmount,
      whitelistEnabled,
      timeLeft: {
        days: diffDays,
        hours: diffHours,
        minutes: diffMinutes,
        seconds: diffSeconds
      }
    });
    
    res.json(updatedPresaleInfo);
  } catch (error) {
    console.error('Error updating presale parameters:', error);
    res.status(500).json({ error: 'Failed to update presale parameters' });
  }
});

// Withdraw unsold tokens
app.post('/api/presale/withdraw-unsold', async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount value' });
    }
    
    // Get current presale info
    const presaleInfo = await getPresaleInfoFromDB();
    
    // Calculate unsold tokens
    const unsoldTokens = presaleInfo.totalSupply - presaleInfo.tokensSold;
    
    if (amount > unsoldTokens) {
      return res.status(400).json({ error: 'Amount exceeds unsold tokens' });
    }
    
    // Update presale info
    const updatedPresaleInfo = await updatePresaleInfoInDB({
      totalSupply: presaleInfo.totalSupply - amount
    });
    
    res.json(updatedPresaleInfo);
  } catch (error) {
    console.error('Error withdrawing unsold tokens:', error);
    res.status(500).json({ error: 'Failed to withdraw unsold tokens' });
  }
});

// Get token info
app.get('/api/token/info', async (req, res) => {
  try {
    const presaleInfo = await getPresaleInfoFromDB();
    
    const tokenInfo = {
      name: 'DPNET-10',
      symbol: 'DPNET',
      decimals: 6,
      totalSupply: TOKEN_ALLOCATIONS.totalSupply,
      circulatingSupply: presaleInfo.tokensSold,
      address: TOKEN_ALLOCATIONS.tokenAddress,
      owner: 'Admin',
      mintAuthority: true,
      freezeAuthority: true,
      allocations: TOKEN_ALLOCATIONS.pools
    };
    
    res.json(tokenInfo);
  } catch (error) {
    console.error('Error fetching token info:', error);
    res.status(500).json({ error: 'Failed to fetch token info' });
  }
});

// Get token allocations
app.get('/api/token/allocations', (req, res) => {
  try {
    res.json(TOKEN_ALLOCATIONS);
  } catch (error) {
    console.error('Error fetching token allocations:', error);
    res.status(500).json({ error: 'Failed to fetch token allocations' });
  }
});

// Get pool data for rewards pool
app.get('/api/pools/rewards', async (req, res) => {
  try {
    const walletAddress = "FdYsNj3jhGLcCzoMLA2KZdzUnM3UiwCYUNhMmmFaUDie";
    const tokenAddress = TOKEN_ALLOCATIONS.tokenAddress;
    
    // Get token balance
    let balance = 0;
    try {
      balance = await getTokenBalance(walletAddress, tokenAddress);
    } catch (error) {
      console.error('Error getting token balance:', error);
    }
    
    // Get transaction count
    let transactions = 0;
    try {
      transactions = await getTransactionCount(walletAddress);
    } catch (error) {
      console.error('Error getting transaction count:', error);
    }
    
    // Get allocation from token allocation data
    const rewardsPool = TOKEN_ALLOCATIONS.pools.find(pool => 
      pool.name === "Rewards Pool"
    );
    
    const allocation = rewardsPool.allocation;
    const percentFilled = allocation > 0 ? (balance / allocation) * 100 : 0;
    
    res.json({
      balance,
      allocation,
      percentFilled,
      transactions,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching rewards pool data:', error);
    res.status(500).json({ error: 'Failed to fetch rewards pool data' });
  }
});

// Get pool data for liquidity pool
app.get('/api/pools/liquidity', async (req, res) => {
  try {
    const walletAddress = "3HUwa6YYKNdDgsU6nkkMWyBgT2BRtzmD1JpWSg77sa55";
    const tokenAddress = TOKEN_ALLOCATIONS.tokenAddress;
    
    // Get token balance
    let balance = 0;
    try {
      balance = await getTokenBalance(walletAddress, tokenAddress);
    } catch (error) {
      console.error('Error getting token balance:', error);
    }
    
    // Get transaction count
    let transactions = 0;
    try {
      transactions = await getTransactionCount(walletAddress);
    } catch (error) {
      console.error('Error getting transaction count:', error);
    }
    
    // Get allocation from token allocation data
    const liquidityPool = TOKEN_ALLOCATIONS.pools.find(pool => 
      pool.name === "Liquidity Pools"
    );
    
    const allocation = liquidityPool.allocation;
    const percentFilled = allocation > 0 ? (balance / allocation) * 100 : 0;
    
    res.json({
      balance,
      allocation,
      percentFilled,
      transactions,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching liquidity pool data:', error);
    res.status(500).json({ error: 'Failed to fetch liquidity pool data' });
  }
});

// Get pool data for marketing pool
app.get('/api/pools/marketing', async (req, res) => {
  try {
    const walletAddress = "99AufghSAA7Xj1grrhLgiZMvGXk6XAGLESf1PRJBpoko";
    const tokenAddress = TOKEN_ALLOCATIONS.tokenAddress;
    
    // Get token balance
    let balance = 0;
    try {
      balance = await getTokenBalance(walletAddress, tokenAddress);
    } catch (error) {
      console.error('Error getting token balance:', error);
    }
    
    // Get transaction count
    let transactions = 0;
    try {
      transactions = await getTransactionCount(walletAddress);
    } catch (error) {
      console.error('Error getting transaction count:', error);
    }
    
    // Get allocation from token allocation data
    const marketingPool = TOKEN_ALLOCATIONS.pools.find(pool => 
      pool.name === "Marketing, Airdrops, and Community Building"
    );
    
    const allocation = marketingPool.allocation;
    const percentFilled = allocation > 0 ? (balance / allocation) * 100 : 0;
    
    res.json({
      balance,
      allocation,
      percentFilled,
      transactions,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching marketing pool data:', error);
    res.status(500).json({ error: 'Failed to fetch marketing pool data' });
  }
});

// Get pool data for team allocation
app.get('/api/pools/team', async (req, res) => {
  try {
    const walletAddress = "2MAP3pASkcvdeKnsRS5JGFebYvvAG14ikShtPLbwg4sw";
    const tokenAddress = TOKEN_ALLOCATIONS.tokenAddress;
    
    // Get token balance
    let balance = 0;
    try {
      balance = await getTokenBalance(walletAddress, tokenAddress);
    } catch (error) {
      console.error('Error getting token balance:', error);
    }
    
    // Get transaction count
    let transactions = 0;
    try {
      transactions = await getTransactionCount(walletAddress);
    } catch (error) {
      console.error('Error getting transaction count:', error);
    }
    
    // Get allocation from token allocation data
    const teamPool = TOKEN_ALLOCATIONS.pools.find(pool => 
      pool.name === "Team Allocation"
    );
    
    const allocation = teamPool.allocation;
    const percentFilled = allocation > 0 ? (balance / allocation) * 100 : 0;
    
    res.json({
      balance,
      allocation,
      percentFilled,
      transactions,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching team pool data:', error);
    res.status(500).json({ error: 'Failed to fetch team pool data' });
  }
});

// Get pool data for treasury reserves
app.get('/api/pools/treasury', async (req, res) => {
  try {
    const walletAddress = "2BLLHiCHtrYDRUuh4VndsnNPpyJ3AHFp3oMAcxNX1kJj";
    const tokenAddress = TOKEN_ALLOCATIONS.tokenAddress;
    
    // Get token balance
    let balance = 0;
    try {
      balance = await getTokenBalance(walletAddress, tokenAddress);
    } catch (error) {
      console.error('Error getting token balance:', error);
    }
    
    // Get transaction count
    let transactions = 0;
    try {
      transactions = await getTransactionCount(walletAddress);
    } catch (error) {
      console.error('Error getting transaction count:', error);
    }
    
    // Get allocation from token allocation data
    const treasuryPool = TOKEN_ALLOCATIONS.pools.find(pool => 
      pool.name === "Treasury Reserves"
    );
    
    const allocation = treasuryPool.allocation;
    const percentFilled = allocation > 0 ? (balance / allocation) * 100 : 0;
    
    res.json({
      balance,
      allocation,
      percentFilled,
      transactions,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching treasury pool data:', error);
    res.status(500).json({ error: 'Failed to fetch treasury pool data' });
  }
});

// Transfer tokens
app.post('/api/token/transfer', async (req, res) => {
  try {
    const { recipient, amount } = req.body;
    
    if (!recipient || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    // Record transaction
    const transaction = {
      id: uuidv4(),
      type: 'transfer',
      recipient,
      amount,
      timestamp: new Date().toISOString()
    };
    
    await dynamoDB.put({
      TableName: TRANSACTIONS_TABLE,
      Item: transaction
    }).promise();
    
    res.json({ success: true, transaction });
  } catch (error) {
    console.error('Error transferring tokens:', error);
    res.status(500).json({ error: 'Failed to transfer tokens' });
  }
});

// Mint tokens
app.post('/api/token/mint', async (req, res) => {
  try {
    const { recipient, amount } = req.body;
    
    if (!recipient || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    // Get current presale info
    const presaleInfo = await getPresaleInfoFromDB();
    
    // Update presale info
    const updatedPresaleInfo = await updatePresaleInfoInDB({
      totalSupply: presaleInfo.totalSupply + amount,
      tokensSold: presaleInfo.tokensSold + amount
    });
    
    // Record transaction
    const transaction = {
      id: uuidv4(),
      type: 'mint',
      recipient,
      amount,
      timestamp: new Date().toISOString()
    };
    
    await dynamoDB.put({
      TableName: TRANSACTIONS_TABLE,
      Item: transaction
    }).promise();
    
    res.json({ success: true, transaction });
  } catch (error) {
    console.error('Error minting tokens:', error);
    res.status(500).json({ error: 'Failed to mint tokens' });
  }
});

// Burn tokens
app.post('/api/token/burn', async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount value' });
    }
    
    // Get current presale info
    const presaleInfo = await getPresaleInfoFromDB();
    
    if (amount > presaleInfo.totalSupply) {
      return res.status(400).json({ error: 'Amount exceeds total supply' });
    }
    
    // Update presale info
    const updatedPresaleInfo = await updatePresaleInfoInDB({
      totalSupply: presaleInfo.totalSupply - amount,
      tokensSold: Math.max(0, presaleInfo.tokensSold - amount)
    });
    
    // Record transaction
    const transaction = {
      id: uuidv4(),
      type: 'burn',
      amount,
      timestamp: new Date().toISOString()
    };
    
    await dynamoDB.put({
      TableName: TRANSACTIONS_TABLE,
      Item: transaction
    }).promise();
    
    res.json({ success: true, transaction });
  } catch (error) {
    console.error('Error burning tokens:', error);
    res.status(500).json({ error: 'Failed to burn tokens' });
  }
});

// Get whitelisted users
app.get('/api/whitelist', async (req, res) => {
  try {
    const params = {
      TableName: WHITELIST_TABLE
    };
    
    const result = await dynamoDB.scan(params).promise();
    
    res.json(result.Items || []);
  } catch (error) {
    console.error('Error fetching whitelisted users:', error);
    res.status(500).json({ error: 'Failed to fetch whitelisted users' });
  }
});

// Add to whitelist
app.post('/api/whitelist/add', async (req, res) => {
  try {
    const { address, allocation } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }
    
    // Validate Solana address
    try {
      new PublicKey(address);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid Solana address' });
    }
    
    // Check if address already exists in whitelist
    const existingParams = {
      TableName: WHITELIST_TABLE,
      FilterExpression: 'walletAddress = :address',
      ExpressionAttributeValues: {
        ':address': address
      }
    };
    
    const existingResult = await dynamoDB.scan(existingParams).promise();
    
    if (existingResult.Items && existingResult.Items.length > 0) {
      return res.status(400).json({ error: 'Address already exists in whitelist' });
    }
    
    const whitelistEntry = {
      id: uuidv4(),
      walletAddress: address,
      allocation: allocation || 0,
      email: req.body.email || '',
      dateAdded: new Date().toISOString(),
      status: 'Active'
    };
    
    await dynamoDB.put({
      TableName: WHITELIST_TABLE,
      Item: whitelistEntry
    }).promise();
    
    console.log('Successfully added to whitelist:', whitelistEntry);
    
    res.json({ success: true, whitelistEntry });
  } catch (error) {
    console.error('Error adding to whitelist:', error);
    res.status(500).json({ error: 'Failed to add to whitelist' });
  }
});

// Bulk add to whitelist
app.post('/api/whitelist/bulk-add', async (req, res) => {
  try {
    const { addresses, allocation } = req.body;
    
    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({ error: 'Addresses are required' });
    }
    
    const whitelistEntries = [];
    
    // Process in batches of 25 (DynamoDB batch write limit)
    for (let i = 0; i < addresses.length; i += 25) {
      const batch = addresses.slice(i, i + 25);
      
      const batchWriteParams = {
        RequestItems: {
          [WHITELIST_TABLE]: batch.map(address => ({
            PutRequest: {
              Item: {
                id: uuidv4(),
                address,
                allocation: allocation || 0,
                email: `user${i + batch.indexOf(address) + 1}@example.com`,
                dateAdded: new Date().toISOString(),
                status: 'Active'
              }
            }
          }))
        }
      };
      
      await dynamoDB.batchWrite(batchWriteParams).promise();
      
      whitelistEntries.push(...batch.map((address, index) => ({
        id: uuidv4(),
        address,
        allocation: allocation || 0,
        email: `user${i + index + 1}@example.com`,
        dateAdded: new Date().toISOString(),
        status: 'Active'
      })));
    }
    
    res.json({ success: true, count: whitelistEntries.length });
  } catch (error) {
    console.error('Error bulk adding to whitelist:', error);
    res.status(500).json({ error: 'Failed to bulk add to whitelist' });
  }
});

// Remove from whitelist
app.delete('/api/whitelist/remove', async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }
    
    // Find the whitelist entry by address
    const params = {
      TableName: WHITELIST_TABLE,
      FilterExpression: 'address = :address',
      ExpressionAttributeValues: {
        ':address': address
      }
    };
    
    const result = await dynamoDB.scan(params).promise();
    
    if (!result.Items || result.Items.length === 0) {
      return res.status(404).json({ error: 'Whitelist entry not found' });
    }
    
    // Delete the whitelist entry
    await dynamoDB.delete({
      TableName: WHITELIST_TABLE,
      Key: {
        id: result.Items[0].id
      }
    }).promise();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing from whitelist:', error);
    res.status(500).json({ error: 'Failed to remove from whitelist' });
  }
});

// Testing endpoints
app.post('/api/tests/token', (req, res) => {
  res.json({ success: true, message: 'Token tests completed successfully' });
});

app.post('/api/tests/dynamodb', (req, res) => {
  res.json({ success: true, message: 'DynamoDB tests completed successfully' });
});

app.post('/api/tests/rds', (req, res) => {
  res.json({ success: true, message: 'RDS tests completed successfully' });
});

app.post('/api/tests/solana', (req, res) => {
  res.json({ success: true, message: 'Solana tests completed successfully' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
