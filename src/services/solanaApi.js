// Solana API service for direct blockchain interactions
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Solana connection
const SOLANA_RPC_URL = process.env.REACT_APP_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

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
    return 0;
  }
};

// Helper function to get token supply
export const getTokenSupply = async (tokenAddress = TOKEN_ADDRESS) => {
  try {
    const tokenPublicKey = new PublicKey(tokenAddress);
    const tokenSupply = await connection.getTokenSupply(tokenPublicKey);
    return tokenSupply.value.uiAmount;
  } catch (error) {
    console.error('Error getting token supply:', error);
    return 0;
  }
};

// Helper function to get transaction count
export const getTransactionCount = async (walletAddress) => {
  try {
    const walletPublicKey = new PublicKey(walletAddress);
    const signatures = await connection.getSignaturesForAddress(walletPublicKey);
    return signatures.length;
  } catch (error) {
    console.error('Error getting transaction count:', error);
    return 0;
  }
};

// Helper function to get transaction history
export const getTransactionHistory = async (walletAddress, limit = 10) => {
  try {
    const walletPublicKey = new PublicKey(walletAddress);
    const signatures = await connection.getSignaturesForAddress(walletPublicKey, { limit });
    
    const transactions = [];
    for (const sig of signatures) {
      const tx = await connection.getTransaction(sig.signature);
      if (tx) {
        transactions.push({
          signature: sig.signature,
          blockTime: tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : null,
          slot: tx.slot,
          fee: tx.meta?.fee || 0,
          status: tx.meta?.err ? 'Failed' : 'Success'
        });
      }
    }
    
    return transactions;
  } catch (error) {
    console.error('Error getting transaction history:', error);
    return [];
  }
};

// Get presale pool data directly from blockchain
export const getPresalePoolData = async () => {
  try {
    // Get token supply
    const totalSupply = await getTokenSupply();
    
    // Get tokens in presale pool (unsold tokens)
    const presalePoolBalance = await getTokenBalance(PRESALE_POOL_ADDRESS);
    
    // Calculate tokens sold
    const tokensSold = totalSupply - presalePoolBalance;
    
    // Get transaction count
    const transactionsNumber = await getTransactionCount(PRESALE_POOL_ADDRESS);
    
    // Assuming 80% sold for SOL and 20% for Fiat (this would ideally come from a database)
    const tokensSoldForSol = Math.floor(tokensSold * 0.8);
    const tokensSoldForFiat = Math.floor(tokensSold * 0.2);
    
    return {
      totalSupply,
      tokensSold,
      tokensSoldForSol,
      tokensSoldForFiat,
      transactionsNumber,
      presalePoolAddress: PRESALE_POOL_ADDRESS,
      tokenAddress: TOKEN_ADDRESS,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting presale pool data:', error);
    throw error;
  }
};

// Get rewards pool data directly from blockchain
export const getRewardsPoolData = async () => {
  try {
    // Get token balance
    const balance = await getTokenBalance(REWARDS_POOL_ADDRESS);
    
    // Get transaction count
    const transactions = await getTransactionCount(REWARDS_POOL_ADDRESS);
    
    // Allocation would ideally come from a database or contract
    const allocation = 615000000; // 615 million tokens
    const percentFilled = allocation > 0 ? (balance / allocation) * 100 : 0;
    
    return {
      balance,
      allocation,
      percentFilled,
      transactions,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting rewards pool data:', error);
    throw error;
  }
};

// Get liquidity pool data directly from blockchain
export const getLiquidityPoolData = async () => {
  try {
    // Get token balance
    const balance = await getTokenBalance(LIQUIDITY_POOL_ADDRESS);
    
    // Get transaction count
    const transactions = await getTransactionCount(LIQUIDITY_POOL_ADDRESS);
    
    // Allocation would ideally come from a database or contract
    const allocation = 270000000; // 270 million tokens
    const percentFilled = allocation > 0 ? (balance / allocation) * 100 : 0;
    
    return {
      balance,
      allocation,
      percentFilled,
      transactions,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting liquidity pool data:', error);
    throw error;
  }
};

// Get marketing pool data directly from blockchain
export const getMarketingPoolData = async () => {
  try {
    // Get token balance
    const balance = await getTokenBalance(MARKETING_POOL_ADDRESS);
    
    // Get transaction count
    const transactions = await getTransactionCount(MARKETING_POOL_ADDRESS);
    
    // Allocation would ideally come from a database or contract
    const allocation = 180000000; // 180 million tokens
    const percentFilled = allocation > 0 ? (balance / allocation) * 100 : 0;
    
    return {
      balance,
      allocation,
      percentFilled,
      transactions,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting marketing pool data:', error);
    throw error;
  }
};

// Get team allocation data directly from blockchain
export const getTeamAllocationData = async () => {
  try {
    // Get token balance
    const balance = await getTokenBalance(TEAM_ALLOCATION_ADDRESS);
    
    // Get transaction count
    const transactions = await getTransactionCount(TEAM_ALLOCATION_ADDRESS);
    
    // Allocation would ideally come from a database or contract
    const allocation = 120000000; // 120 million tokens
    const percentFilled = allocation > 0 ? (balance / allocation) * 100 : 0;
    
    return {
      balance,
      allocation,
      percentFilled,
      transactions,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting team allocation data:', error);
    throw error;
  }
};

// Get treasury reserves data directly from blockchain
export const getTreasuryReservesData = async () => {
  try {
    // Get token balance
    const balance = await getTokenBalance(TREASURY_RESERVES_ADDRESS);
    
    // Get transaction count
    const transactions = await getTransactionCount(TREASURY_RESERVES_ADDRESS);
    
    // Allocation would ideally come from a database or contract
    const allocation = 45000000; // 45 million tokens
    const percentFilled = allocation > 0 ? (balance / allocation) * 100 : 0;
    
    return {
      balance,
      allocation,
      percentFilled,
      transactions,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting treasury reserves data:', error);
    throw error;
  }
};

// Get token information directly from blockchain
export const getTokenInfo = async () => {
  try {
    // Get token supply
    const totalSupply = await getTokenSupply();
    
    // Get presale pool data to calculate circulating supply
    const presaleData = await getPresalePoolData();
    
    return {
      name: 'DPNET-10',
      symbol: 'DPNET',
      decimals: 6,
      totalSupply,
      circulatingSupply: presaleData.tokensSold,
      address: TOKEN_ADDRESS,
      owner: 'Admin',
      mintAuthority: true,
      freezeAuthority: true
    };
  } catch (error) {
    console.error('Error getting token info:', error);
    throw error;
  }
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
