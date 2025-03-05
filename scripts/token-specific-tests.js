/**
 * DPNET-10 Token Specific Tests
 * 
 * This script contains comprehensive tests for the DPNET-10 token on the Solana blockchain.
 * It tests token metadata, supply, transfer, mint, and burn functionality.
 */

const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { Token, TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');

// Configuration
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const DPNET_TOKEN_ADDRESS = process.env.DPNET_TOKEN_ADDRESS || '7XSvJnS19TodrQJSbjUR3NLSZoK3mHvfGqVhxJQRPvTb';
const ADMIN_KEYPAIR_PATH = process.env.ADMIN_KEYPAIR_PATH || path.resolve(__dirname, '../../keypairs/test-admin-keypair.json');

// Test results
const testResults = {
  success: true,
  tests: []
};

// Connect to Solana
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Load admin keypair
const loadKeypair = (path) => {
  try {
    const keypairData = JSON.parse(fs.readFileSync(path, 'utf-8'));
    return Keypair.fromSecretKey(new Uint8Array(keypairData));
  } catch (error) {
    console.error('Error loading keypair:', error);
    throw error;
  }
};

// Run tests
async function runTests() {
  try {
    console.log('Starting DPNET-10 token tests...');
    
    // Load admin keypair
    const adminKeypair = loadKeypair(ADMIN_KEYPAIR_PATH);
    console.log('Admin public key:', adminKeypair.publicKey.toString());
    
    // Get token
    const tokenPublicKey = new PublicKey(DPNET_TOKEN_ADDRESS);
    const token = new Token(
      connection,
      tokenPublicKey,
      TOKEN_PROGRAM_ID,
      adminKeypair
    );
    
    // Test 1: Token Metadata Test
    try {
      console.log('Running Token Metadata Test...');
      const tokenInfo = await token.getMintInfo();
      
      testResults.tests.push({
        name: 'Token Metadata Test',
        status: 'passed',
        message: 'Token metadata is valid',
        details: {
          decimals: tokenInfo.decimals,
          freezeAuthority: tokenInfo.freezeAuthority?.toString() || 'None',
          mintAuthority: tokenInfo.mintAuthority?.toString() || 'None',
          isInitialized: tokenInfo.isInitialized,
          supply: tokenInfo.supply.toString()
        }
      });
      
      console.log('Token Metadata Test passed');
    } catch (error) {
      testResults.success = false;
      testResults.tests.push({
        name: 'Token Metadata Test',
        status: 'failed',
        message: `Error: ${error.message}`,
        details: error.stack
      });
      
      console.error('Token Metadata Test failed:', error);
    }
    
    // Test 2: Token Supply Test
    try {
      console.log('Running Token Supply Test...');
      const tokenInfo = await token.getMintInfo();
      const supply = tokenInfo.supply.toString();
      
      // Check if supply is as expected (this is a placeholder, adjust as needed)
      const expectedSupply = '1000000000000000000'; // 1 billion with 9 decimals
      const supplyIsValid = supply === expectedSupply;
      
      if (supplyIsValid) {
        testResults.tests.push({
          name: 'Token Supply Test',
          status: 'passed',
          message: 'Token supply matches expected value',
          details: {
            actualSupply: supply,
            expectedSupply: expectedSupply
          }
        });
        
        console.log('Token Supply Test passed');
      } else {
        testResults.success = false;
        testResults.tests.push({
          name: 'Token Supply Test',
          status: 'failed',
          message: 'Token supply does not match expected value',
          details: {
            actualSupply: supply,
            expectedSupply: expectedSupply
          }
        });
        
        console.error('Token Supply Test failed: Supply mismatch');
      }
    } catch (error) {
      testResults.success = false;
      testResults.tests.push({
        name: 'Token Supply Test',
        status: 'failed',
        message: `Error: ${error.message}`,
        details: error.stack
      });
      
      console.error('Token Supply Test failed:', error);
    }
    
    // Test 3: Token Transfer Test
    try {
      console.log('Running Token Transfer Test...');
      
      // Create a test account
      const testAccount = Keypair.generate();
      
      // Get admin token account
      const adminTokenAccount = await token.getOrCreateAssociatedAccountInfo(
        adminKeypair.publicKey
      );
      
      // Create token account for test account
      const testTokenAccount = await token.getOrCreateAssociatedAccountInfo(
        testAccount.publicKey
      );
      
      // Transfer a small amount of tokens
      const transferAmount = 1000;
      await token.transfer(
        adminTokenAccount.address,
        testTokenAccount.address,
        adminKeypair,
        [],
        transferAmount
      );
      
      // Verify transfer
      const testAccountInfo = await token.getAccountInfo(testTokenAccount.address);
      const transferSuccessful = testAccountInfo.amount.toNumber() === transferAmount;
      
      if (transferSuccessful) {
        testResults.tests.push({
          name: 'Token Transfer Test',
          status: 'passed',
          message: 'Token transfer functionality works correctly',
          details: {
            fromAccount: adminTokenAccount.address.toString(),
            toAccount: testTokenAccount.address.toString(),
            amount: transferAmount
          }
        });
        
        console.log('Token Transfer Test passed');
        
        // Transfer back to admin account for cleanup
        await token.transfer(
          testTokenAccount.address,
          adminTokenAccount.address,
          testAccount,
          [],
          transferAmount
        );
      } else {
        testResults.success = false;
        testResults.tests.push({
          name: 'Token Transfer Test',
          status: 'failed',
          message: 'Token transfer failed',
          details: {
            fromAccount: adminTokenAccount.address.toString(),
            toAccount: testTokenAccount.address.toString(),
            expectedAmount: transferAmount,
            actualAmount: testAccountInfo.amount.toNumber()
          }
        });
        
        console.error('Token Transfer Test failed: Transfer unsuccessful');
      }
    } catch (error) {
      testResults.success = false;
      testResults.tests.push({
        name: 'Token Transfer Test',
        status: 'failed',
        message: `Error: ${error.message}`,
        details: error.stack
      });
      
      console.error('Token Transfer Test failed:', error);
    }
    
    // Test 4: Token Mint Test
    try {
      console.log('Running Token Mint Test...');
      
      // Get admin token account
      const adminTokenAccount = await token.getOrCreateAssociatedAccountInfo(
        adminKeypair.publicKey
      );
      
      // Get initial balance
      const initialBalance = (await token.getAccountInfo(adminTokenAccount.address)).amount;
      
      // Mint tokens
      const mintAmount = 1000;
      await token.mintTo(
        adminTokenAccount.address,
        adminKeypair,
        [],
        mintAmount
      );
      
      // Verify mint
      const newBalance = (await token.getAccountInfo(adminTokenAccount.address)).amount;
      const mintSuccessful = newBalance.sub(initialBalance).toNumber() === mintAmount;
      
      if (mintSuccessful) {
        testResults.tests.push({
          name: 'Token Mint Test',
          status: 'passed',
          message: 'Token minting functionality works correctly',
          details: {
            toAccount: adminTokenAccount.address.toString(),
            initialBalance: initialBalance.toString(),
            mintAmount: mintAmount,
            newBalance: newBalance.toString()
          }
        });
        
        console.log('Token Mint Test passed');
      } else {
        testResults.success = false;
        testResults.tests.push({
          name: 'Token Mint Test',
          status: 'failed',
          message: 'Token minting failed',
          details: {
            toAccount: adminTokenAccount.address.toString(),
            initialBalance: initialBalance.toString(),
            mintAmount: mintAmount,
            newBalance: newBalance.toString(),
            expectedBalance: initialBalance.add(mintAmount).toString()
          }
        });
        
        console.error('Token Mint Test failed: Mint unsuccessful');
      }
    } catch (error) {
      testResults.success = false;
      testResults.tests.push({
        name: 'Token Mint Test',
        status: 'failed',
        message: `Error: ${error.message}`,
        details: error.stack
      });
      
      console.error('Token Mint Test failed:', error);
    }
    
    // Test 5: Token Burn Test
    try {
      console.log('Running Token Burn Test...');
      
      // Get admin token account
      const adminTokenAccount = await token.getOrCreateAssociatedAccountInfo(
        adminKeypair.publicKey
      );
      
      // Get initial balance
      const initialBalance = (await token.getAccountInfo(adminTokenAccount.address)).amount;
      
      // Burn tokens (same amount as minted in previous test)
      const burnAmount = 1000;
      await token.burn(
        adminTokenAccount.address,
        adminKeypair,
        [],
        burnAmount
      );
      
      // Verify burn
      const newBalance = (await token.getAccountInfo(adminTokenAccount.address)).amount;
      const burnSuccessful = initialBalance.sub(newBalance).toNumber() === burnAmount;
      
      if (burnSuccessful) {
        testResults.tests.push({
          name: 'Token Burn Test',
          status: 'passed',
          message: 'Token burning functionality works correctly',
          details: {
            fromAccount: adminTokenAccount.address.toString(),
            initialBalance: initialBalance.toString(),
            burnAmount: burnAmount,
            newBalance: newBalance.toString()
          }
        });
        
        console.log('Token Burn Test passed');
      } else {
        testResults.success = false;
        testResults.tests.push({
          name: 'Token Burn Test',
          status: 'failed',
          message: 'Token burning failed',
          details: {
            fromAccount: adminTokenAccount.address.toString(),
            initialBalance: initialBalance.toString(),
            burnAmount: burnAmount,
            newBalance: newBalance.toString(),
            expectedBalance: initialBalance.sub(burnAmount).toString()
          }
        });
        
        console.error('Token Burn Test failed: Burn unsuccessful');
      }
    } catch (error) {
      testResults.success = false;
      testResults.tests.push({
        name: 'Token Burn Test',
        status: 'failed',
        message: `Error: ${error.message}`,
        details: error.stack
      });
      
      console.error('Token Burn Test failed:', error);
    }
    
    // Print test results
    console.log('\nTest Results:');
    console.log(`Overall Success: ${testResults.success}`);
    console.log('Individual Tests:');
    testResults.tests.forEach(test => {
      console.log(`- ${test.name}: ${test.status} - ${test.message}`);
    });
    
    return testResults;
  } catch (error) {
    console.error('Error running tests:', error);
    
    testResults.success = false;
    testResults.error = {
      message: error.message,
      stack: error.stack
    };
    
    return testResults;
  }
}

// Run tests if executed directly
if (require.main === module) {
  runTests()
    .then(results => {
      // Write results to file
      fs.writeFileSync(
        path.resolve(__dirname, 'token-test-results.json'),
        JSON.stringify(results, null, 2)
      );
      
      process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

module.exports = { runTests };
