// Backend server to handle Solana blockchain interactions
const express = require('express');
const cors = require('cors');
const { Connection, PublicKey } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const { metadataOperations } = require('../scripts/dynamodb-integration');

const app = express();
const PORT = process.env.PORT || 3002; // Use a different port to avoid conflicts

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Token and wallet addresses
const TOKEN_ADDRESS = 'F4qB6W5tUPHXRE1nfnw7MkLAu3YU7T12o6T52QKq5pQK';
const PRESALE_POOL_ADDRESS = 'bJhdXiRhddYL2wXHjx3CEsGDRDCLYrW5ZxmG4xeSahX';
const REWARDS_POOL_ADDRESS = 'FdYsNj3jhGLcCzoMLA2KZdzUnM3UiwCYUNhMmmFaUDie';
const LIQUIDITY_POOL_ADDRESS = '3HUwa6YYKNdDgsU6nkkMWyBgT2BRtzmD1JpWSg77sa55';
const MARKETING_POOL_ADDRESS = '99AufghSAA7Xj1grrhLgiZMvGXk6XAGLESf1PRJBpoko';
const TEAM_ALLOCATION_ADDRESS = '2MAP3pASkcvdeKnsRS5JGFebYvvAG14ikShtPLbwg4sw';
const TREASURY_RESERVES_ADDRESS = '2BLLHiCHtrYDRUuh4VndsnNPpyJ3AHFp3oMAcxNX1kJj';

// Initialize Solana connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
console.log('Solana connection initialized');

// Helper function to get token balance
async function getTokenBalance(walletAddress, tokenAddress = TOKEN_ADDRESS) {
  try {
    console.log(`Getting token balance for ${walletAddress}`);
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
      console.log(`Real token balance for ${walletAddress}: ${balance}`);
      return balance;
    }
    
    console.log(`No token account found for ${walletAddress}, returning 0`);
    return 0;
  } catch (error) {
    console.error('Error getting token balance:', error);
    throw error;
  }
}

// Helper function to get token supply
async function getTokenSupply(tokenAddress = TOKEN_ADDRESS) {
  try {
    console.log(`Getting token supply for ${tokenAddress}`);
    const tokenPublicKey = new PublicKey(tokenAddress);
    const tokenSupply = await connection.getTokenSupply(tokenPublicKey);
    console.log(`Real token supply: ${tokenSupply.value.uiAmount}`);
    return tokenSupply.value.uiAmount;
  } catch (error) {
    console.error('Error getting token supply:', error);
    throw error;
  }
}

// Helper function to get transaction count
async function getTransactionCount(walletAddress) {
  try {
    console.log(`Getting transaction count for ${walletAddress}`);
    const walletPublicKey = new PublicKey(walletAddress);
    const signatures = await connection.getSignaturesForAddress(walletPublicKey);
    console.log(`Real transaction count for ${walletAddress}: ${signatures.length}`);
    return signatures.length;
  } catch (error) {
    console.error('Error getting transaction count:', error);
    throw error;
  }
}

// Helper function to get transaction history
async function getTransactionHistory(walletAddress, limit = 10) {
  try {
    console.log(`Getting transaction history for ${walletAddress}, limit: ${limit}`);
    const walletPublicKey = new PublicKey(walletAddress);
    const signatures = await connection.getSignaturesForAddress(walletPublicKey, { limit });
    
    const transactions = await Promise.all(
      signatures.map(async (sig) => {
        const tx = await connection.getTransaction(sig.signature);
        return {
          signature: sig.signature,
          blockTime: tx?.blockTime ? new Date(tx.blockTime * 1000).toISOString() : null,
          slot: tx?.slot || 0,
          fee: tx?.meta?.fee || 0,
          status: tx?.meta?.err ? 'Failed' : 'Success'
        };
      })
    );
    
    console.log(`Real transaction history for ${walletAddress}: ${transactions.length} transactions`);
    return transactions;
  } catch (error) {
    console.error('Error getting transaction history:', error);
    throw error;
  }
}

// API Routes

// Get token balance
app.get('/api/token-balance/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { tokenAddress } = req.query;
    
    const balance = await getTokenBalance(walletAddress, tokenAddress || TOKEN_ADDRESS);
    res.json({ balance });
  } catch (error) {
    console.error('Error in /api/token-balance:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get token supply
app.get('/api/token-supply', async (req, res) => {
  try {
    const { tokenAddress } = req.query;
    
    const supply = await getTokenSupply(tokenAddress || TOKEN_ADDRESS);
    res.json({ supply });
  } catch (error) {
    console.error('Error in /api/token-supply:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get transaction count
app.get('/api/transaction-count/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    const count = await getTransactionCount(walletAddress);
    res.json({ count });
  } catch (error) {
    console.error('Error in /api/transaction-count:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get transaction history
app.get('/api/transaction-history/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const limit = parseInt(req.query.limit || '10', 10);
    
    const transactions = await getTransactionHistory(walletAddress, limit);
    res.json({ transactions });
  } catch (error) {
    console.error('Error in /api/transaction-history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get presale info from DynamoDB
app.get('/api/presale/info', async (req, res) => {
  try {
    // Try to get presale metadata from DynamoDB
    const metadataResult = await metadataOperations.getMetadata(TOKEN_ADDRESS);
    
    if (metadataResult.success) {
      console.log('Retrieved presale info from DynamoDB:', metadataResult.data);
      res.json(metadataResult.data);
    } else {
      // If no metadata found, return default values
      console.log('No presale info found in DynamoDB, returning default values');
      res.json({
        timeLeft: {
          days: 30,
          hours: 12,
          minutes: 45,
          seconds: 20
        },
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        status: 'active'
      });
    }
  } catch (error) {
    console.error('Error in /api/presale/info:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get presale pool data
app.get('/api/presale-pool-data', async (req, res) => {
  try {
    // Get token supply
    const totalSupply = await getTokenSupply(TOKEN_ADDRESS);
    
    // Get tokens in presale pool (unsold tokens)
    let presalePoolBalance = await getTokenBalance(PRESALE_POOL_ADDRESS, TOKEN_ADDRESS);
    
    // If no token account is found, it means all tokens are still in the presale pool
    // This is because the account hasn't been created yet
    if (presalePoolBalance === 0) {
      console.log('No token account found for presale pool, assuming all tokens are unsold');
      presalePoolBalance = totalSupply;
    }
    
    // Calculate tokens sold (this should be 0 if no tokens have been sold)
    const tokensSold = Math.max(0, totalSupply - presalePoolBalance);
    
    // Get transaction count
    const transactionsNumber = await getTransactionCount(PRESALE_POOL_ADDRESS);
    
    // Assuming 80% sold for SOL and 20% for Fiat
    const tokensSoldForSol = Math.floor(tokensSold * 0.8);
    const tokensSoldForFiat = Math.floor(tokensSold * 0.2);
    
    // Try to get timeLeft from DynamoDB
    let timeLeft = {
      days: 30,
      hours: 12,
      minutes: 45,
      seconds: 20
    };
    
    try {
      const metadataResult = await metadataOperations.getMetadata(TOKEN_ADDRESS);
      if (metadataResult.success && metadataResult.data.timeLeft) {
        timeLeft = metadataResult.data.timeLeft;
        console.log('Retrieved timeLeft from DynamoDB:', timeLeft);
      }
    } catch (dbError) {
      console.error('Error getting timeLeft from DynamoDB:', dbError);
      // Continue with default timeLeft
    }
    
    res.json({
      totalSupply,
      tokensSold,
      tokensSoldForSol,
      tokensSoldForFiat,
      transactionsNumber,
      presalePoolAddress: PRESALE_POOL_ADDRESS,
      tokenAddress: TOKEN_ADDRESS,
      timeLeft,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/presale-pool-data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get rewards pool data
app.get('/api/rewards-pool-data', async (req, res) => {
  try {
    // Get token balance
    const balance = await getTokenBalance(REWARDS_POOL_ADDRESS, TOKEN_ADDRESS);
    
    // Get allocation from token allocation data
    const allocation = 615000000; // 615 million tokens
    
    // Calculate percent filled
    const percentFilled = allocation > 0 ? (balance / allocation) * 100 : 0;
    
    // Get transaction count
    const transactions = await getTransactionCount(REWARDS_POOL_ADDRESS);
    
    res.json({
      balance,
      allocation,
      percentFilled,
      transactions,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/rewards-pool-data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get liquidity pool data
app.get('/api/liquidity-pool-data', async (req, res) => {
  try {
    // Get token balance
    const balance = await getTokenBalance(LIQUIDITY_POOL_ADDRESS, TOKEN_ADDRESS);
    
    // Get allocation from token allocation data
    const allocation = 270000000; // 270 million tokens
    
    // Calculate percent filled
    const percentFilled = allocation > 0 ? (balance / allocation) * 100 : 0;
    
    // Get transaction count
    const transactions = await getTransactionCount(LIQUIDITY_POOL_ADDRESS);
    
    res.json({
      balance,
      allocation,
      percentFilled,
      transactions,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/liquidity-pool-data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get marketing pool data
app.get('/api/marketing-pool-data', async (req, res) => {
  try {
    // Get token balance
    const balance = await getTokenBalance(MARKETING_POOL_ADDRESS, TOKEN_ADDRESS);
    
    // Get allocation from token allocation data
    const allocation = 180000000; // 180 million tokens
    
    // Calculate percent filled
    const percentFilled = allocation > 0 ? (balance / allocation) * 100 : 0;
    
    // Get transaction count
    const transactions = await getTransactionCount(MARKETING_POOL_ADDRESS);
    
    res.json({
      balance,
      allocation,
      percentFilled,
      transactions,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/marketing-pool-data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get team allocation data
app.get('/api/team-allocation-data', async (req, res) => {
  try {
    // Get token balance
    const balance = await getTokenBalance(TEAM_ALLOCATION_ADDRESS, TOKEN_ADDRESS);
    
    // Get allocation from token allocation data
    const allocation = 120000000; // 120 million tokens
    
    // Calculate percent filled
    const percentFilled = allocation > 0 ? (balance / allocation) * 100 : 0;
    
    // Get transaction count
    const transactions = await getTransactionCount(TEAM_ALLOCATION_ADDRESS);
    
    res.json({
      balance,
      allocation,
      percentFilled,
      transactions,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/team-allocation-data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get treasury reserves data
app.get('/api/treasury-reserves-data', async (req, res) => {
  try {
    // Get token balance
    const balance = await getTokenBalance(TREASURY_RESERVES_ADDRESS, TOKEN_ADDRESS);
    
    // Get allocation from token allocation data
    const allocation = 45000000; // 45 million tokens
    
    // Calculate percent filled
    const percentFilled = allocation > 0 ? (balance / allocation) * 100 : 0;
    
    // Get transaction count
    const transactions = await getTransactionCount(TREASURY_RESERVES_ADDRESS);
    
    res.json({
      balance,
      allocation,
      percentFilled,
      transactions,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/treasury-reserves-data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get token information
app.get('/api/token-info', async (req, res) => {
  try {
    // Get token supply
    const totalSupply = await getTokenSupply(TOKEN_ADDRESS);
    
    // Get tokens in presale pool (unsold tokens)
    const presalePoolBalance = await getTokenBalance(PRESALE_POOL_ADDRESS, TOKEN_ADDRESS);
    
    // Calculate tokens sold
    const circulatingSupply = totalSupply - presalePoolBalance;
    
    res.json({
      name: 'DPNET-10',
      symbol: 'DPNET',
      decimals: 6,
      totalSupply,
      circulatingSupply,
      address: TOKEN_ADDRESS,
      owner: 'Admin',
      mintAuthority: true,
      freezeAuthority: true
    });
  } catch (error) {
    console.error('Error in /api/token-info:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Solana API server running on port ${PORT}`);
});
