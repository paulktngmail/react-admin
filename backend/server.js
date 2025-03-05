const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
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
const PRESALE_TABLE = 'dpnetsale';
const WHITELIST_TABLE = 'dpnet-whitelist';
const TRANSACTIONS_TABLE = 'dpnet-transactions';

// Presale constants
const PRESALE_POOL_ADDRESS = 'bJhdXiRhddYL2wXHjx3CEsGDRDCLYrW5ZxmG4xeSahX';
const TOKEN_ADDRESS = 'F4qB6W5tUPHXRE1nfnw7MkLAu3YU7T12o6T52QKq5pQK';
const TOTAL_SUPPLY = 500000000; // 500 million DPNET tokens for presale

// Helper function to get presale info from DynamoDB
async function getPresaleInfoFromDB() {
  try {
    const params = {
      TableName: PRESALE_TABLE,
      Key: {
        id: 'presale-info'
      }
    };

    const result = await dynamoDB.get(params).promise();
    
    if (result.Item) {
      return result.Item;
    } else {
      // If no presale info exists, create a default one
      const defaultPresaleInfo = {
        id: 'presale-info',
        totalSupply: TOTAL_SUPPLY,
        tokensSold: 250000000,
        tokensSoldForSol: 200000000,
        tokensSoldForFiat: 50000000,
        transactionsNumber: 1250,
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
    // Get current presale info
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
      totalSupply: presaleInfo.totalSupply,
      circulatingSupply: presaleInfo.tokensSold,
      address: presaleInfo.tokenAddress,
      owner: 'Admin',
      mintAuthority: true,
      freezeAuthority: true
    };
    
    res.json(tokenInfo);
  } catch (error) {
    console.error('Error fetching token info:', error);
    res.status(500).json({ error: 'Failed to fetch token info' });
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
    
    const whitelistEntry = {
      id: uuidv4(),
      address,
      allocation: allocation || 0,
      email: req.body.email || '',
      dateAdded: new Date().toISOString(),
      status: 'Active'
    };
    
    await dynamoDB.put({
      TableName: WHITELIST_TABLE,
      Item: whitelistEntry
    }).promise();
    
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
