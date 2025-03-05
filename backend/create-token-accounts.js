/**
 * Create Token Accounts for DPNET-10 Allocation Wallets
 * 
 * This script creates token accounts for each of the allocation wallets
 * defined in the token-allocation-data.js file. It uses the Solana Web3.js
 * library to create the token accounts on the Solana blockchain.
 * 
 * Usage:
 * node create-token-accounts.js
 */

const { Connection, PublicKey, Keypair, Transaction } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID, Token, AccountLayout } = require('@solana/spl-token');
const TOKEN_ALLOCATIONS = require('./token-allocation-data');
require('dotenv').config();

// Solana connection
const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com', 'confirmed');

// Token address
const TOKEN_ADDRESS = TOKEN_ALLOCATIONS.tokenAddress;

// Admin keypair (this would be loaded from a file in a real scenario)
// For this example, we'll generate a new keypair
const adminKeypair = Keypair.generate();

async function createTokenAccount(walletAddress, tokenAddress) {
  try {
    console.log(`Creating token account for wallet: ${walletAddress}`);
    
    // Convert string addresses to PublicKey objects
    const walletPublicKey = new PublicKey(walletAddress);
    const tokenPublicKey = new PublicKey(tokenAddress);
    
    // Check if token account already exists
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPublicKey,
      { mint: tokenPublicKey }
    );
    
    if (tokenAccounts.value.length > 0) {
      console.log(`Token account already exists for wallet: ${walletAddress}`);
      return tokenAccounts.value[0].pubkey.toString();
    }
    
    // Create token account
    const token = new Token(
      connection,
      tokenPublicKey,
      TOKEN_PROGRAM_ID,
      adminKeypair
    );
    
    const tokenAccount = await token.createAssociatedTokenAccount(walletPublicKey);
    
    console.log(`Token account created: ${tokenAccount.toString()}`);
    return tokenAccount.toString();
  } catch (error) {
    console.error(`Error creating token account for wallet ${walletAddress}:`, error);
    throw error;
  }
}

async function createAllTokenAccounts() {
  console.log('Creating token accounts for all allocation wallets...');
  
  // Create token accounts for each allocation wallet
  for (const pool of TOKEN_ALLOCATIONS.pools) {
    try {
      const tokenAccount = await createTokenAccount(pool.publicKey, TOKEN_ADDRESS);
      console.log(`Created token account for ${pool.name}: ${tokenAccount}`);
    } catch (error) {
      console.error(`Failed to create token account for ${pool.name}:`, error);
    }
  }
  
  console.log('Token account creation complete!');
}

// Run the script
createAllTokenAccounts().catch(console.error);
