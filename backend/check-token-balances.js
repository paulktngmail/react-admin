/**
 * Check Token Balances for DPNET-10 Allocation Wallets
 * 
 * This script checks the token balances for each of the allocation wallets
 * defined in the token-allocation-data.js file. It uses the Solana Web3.js
 * library to query the Solana blockchain for token account balances.
 * 
 * Usage:
 * node check-token-balances.js
 */

const { Connection, PublicKey } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const TOKEN_ALLOCATIONS = require('./token-allocation-data');
require('dotenv').config();

// Solana connection
const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com', 'confirmed');

// Token address
const TOKEN_ADDRESS = TOKEN_ALLOCATIONS.tokenAddress;

async function getTokenBalance(walletAddress, tokenAddress) {
  try {
    console.log(`Checking token balance for wallet: ${walletAddress}`);
    
    // Convert string addresses to PublicKey objects
    const walletPublicKey = new PublicKey(walletAddress);
    const tokenPublicKey = new PublicKey(tokenAddress);
    
    // Get all token accounts for this wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPublicKey,
      { mint: tokenPublicKey }
    );
    
    if (tokenAccounts.value.length === 0) {
      console.log(`No token account found for wallet: ${walletAddress}`);
      return 0;
    }
    
    // Get the balance from the token account
    const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
    console.log(`Token balance for wallet ${walletAddress}: ${balance}`);
    return balance;
  } catch (error) {
    console.error(`Error checking token balance for wallet ${walletAddress}:`, error);
    return 0;
  }
}

async function checkAllTokenBalances() {
  console.log('Checking token balances for all allocation wallets...');
  console.log(`Token address: ${TOKEN_ADDRESS}`);
  console.log('---------------------------------------------------');
  
  let totalBalance = 0;
  const results = [];
  
  // Check token balances for each allocation wallet
  for (const pool of TOKEN_ALLOCATIONS.pools) {
    try {
      const balance = await getTokenBalance(pool.publicKey, TOKEN_ADDRESS);
      const percentFilled = balance > 0 ? (balance / pool.allocation) * 100 : 0;
      
      results.push({
        name: pool.name,
        publicKey: pool.publicKey,
        expectedAllocation: pool.allocation,
        currentBalance: balance,
        percentFilled: percentFilled.toFixed(2) + '%',
        difference: pool.allocation - balance
      });
      
      totalBalance += balance;
    } catch (error) {
      console.error(`Failed to check token balance for ${pool.name}:`, error);
    }
  }
  
  // Print results in a table
  console.log('\nToken Balance Summary:');
  console.log('---------------------------------------------------');
  console.table(results);
  
  // Print total balance
  console.log(`\nTotal balance across all wallets: ${totalBalance}`);
  console.log(`Total expected allocation: ${TOKEN_ALLOCATIONS.totalSupply}`);
  console.log(`Percentage of total supply allocated: ${((totalBalance / TOKEN_ALLOCATIONS.totalSupply) * 100).toFixed(2)}%`);
  
  return results;
}

// Run the script
checkAllTokenBalances().catch(console.error);
