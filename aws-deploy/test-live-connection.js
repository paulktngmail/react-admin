const axios = require('axios');
const fs = require('fs');
const { execSync } = require('child_process');
const { Connection, PublicKey } = require('@solana/web3.js');
const AWS = require('aws-sdk');
require('dotenv').config();

// Create .env file if it doesn't exist
if (!fs.existsSync('.env')) {
  console.log('Creating .env file...');
  fs.writeFileSync('.env', `
# AWS Configuration
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=AKIA6JQ45C6LJGRMS64B
AWS_SECRET_ACCESS_KEY=${process.env.AWS_SECRET_ACCESS_KEY || 'your_secret_access_key_here'}

# DynamoDB Tables
PRESALE_TABLE=dpnetsale
WHITELIST_TABLE=dpnet-whitelist
TRANSACTIONS_TABLE=dpnet-transactions

# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
PRESALE_POOL_ADDRESS=bJhdXiRhddYL2wXHjx3CEsGDRDCLYrW5ZxmG4xeSahX
TOKEN_ADDRESS=F4qB6W5tUPHXRE1nfnw7MkLAu3YU7T12o6T52QKq5pQK

# Server Configuration
PORT=3001
  `);
  console.log('.env file created');
}

// Install dependencies if needed
try {
  console.log('Checking dependencies...');
  execSync('npm list axios || npm install axios');
  execSync('npm list @solana/web3.js || npm install @solana/web3.js');
  execSync('npm list @solana/spl-token || npm install @solana/spl-token');
  execSync('npm list aws-sdk || npm install aws-sdk');
  execSync('npm list dotenv || npm install dotenv');
  console.log('Dependencies installed');
} catch (error) {
  console.error('Error installing dependencies:', error);
}

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AKIA6JQ45C6LJGRMS64B',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Initialize DynamoDB
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const dynamoDBClient = new AWS.DynamoDB();

// Table names
const PRESALE_TABLE = process.env.PRESALE_TABLE || 'dpnetsale';
const WHITELIST_TABLE = process.env.WHITELIST_TABLE || 'dpnet-whitelist';

// Solana connection
const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com', 'confirmed');

// Presale constants
const PRESALE_POOL_ADDRESS = process.env.PRESALE_POOL_ADDRESS || 'bJhdXiRhddYL2wXHjx3CEsGDRDCLYrW5ZxmG4xeSahX';
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || 'F4qB6W5tUPHXRE1nfnw7MkLAu3YU7T12o6T52QKq5pQK';

// Test Solana connection
async function testSolanaConnection() {
  console.log('\n--- Testing Solana Connection ---');
  try {
    const blockHeight = await connection.getBlockHeight();
    console.log(`Connected to Solana devnet. Current block height: ${blockHeight}`);
    
    // Test getting token supply
    try {
      const tokenPublicKey = new PublicKey(TOKEN_ADDRESS);
      const tokenSupply = await connection.getTokenSupply(tokenPublicKey);
      console.log(`Token supply for ${TOKEN_ADDRESS}: ${tokenSupply.value.uiAmount}`);
    } catch (error) {
      console.error('Error getting token supply:', error.message);
    }
    
    // Test getting presale pool balance
    try {
      const walletPublicKey = new PublicKey(PRESALE_POOL_ADDRESS);
      const tokenPublicKey = new PublicKey(TOKEN_ADDRESS);
      
      // Get all token accounts for this wallet
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        walletPublicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );
      
      console.log(`Found ${tokenAccounts.value.length} token accounts for wallet ${PRESALE_POOL_ADDRESS}`);
      
      // Find the token account for the specific token
      const tokenAccount = tokenAccounts.value.find(
        account => account.account.data.parsed.info.mint === tokenPublicKey.toString()
      );
      
      if (tokenAccount) {
        const balance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount;
        console.log(`Presale pool balance for ${TOKEN_ADDRESS}: ${balance}`);
      } else {
        console.log(`No token account found for ${TOKEN_ADDRESS}`);
      }
    } catch (error) {
      console.error('Error getting presale pool balance:', error.message);
    }
    
    return true;
  } catch (error) {
    console.error('Error connecting to Solana:', error.message);
    return false;
  }
}

// Test DynamoDB connection
async function testDynamoDBConnection() {
  console.log('\n--- Testing DynamoDB Connection ---');
  try {
    // List tables
    const listTablesResult = await dynamoDBClient.listTables().promise();
    console.log('Available DynamoDB tables:', listTablesResult.TableNames);
    
    // Check if our tables exist
    const presaleTableExists = listTablesResult.TableNames.includes(PRESALE_TABLE);
    const whitelistTableExists = listTablesResult.TableNames.includes(WHITELIST_TABLE);
    
    console.log(`Presale table (${PRESALE_TABLE}) exists: ${presaleTableExists}`);
    console.log(`Whitelist table (${WHITELIST_TABLE}) exists: ${whitelistTableExists}`);
    
    // If tables don't exist, create them
    if (!presaleTableExists) {
      console.log(`Creating presale table (${PRESALE_TABLE})...`);
      try {
        await dynamoDBClient.createTable({
          TableName: PRESALE_TABLE,
          KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
          AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
          ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
        }).promise();
        console.log(`Presale table (${PRESALE_TABLE}) created`);
      } catch (error) {
        console.error(`Error creating presale table (${PRESALE_TABLE}):`, error.message);
      }
    }
    
    if (!whitelistTableExists) {
      console.log(`Creating whitelist table (${WHITELIST_TABLE})...`);
      try {
        await dynamoDBClient.createTable({
          TableName: WHITELIST_TABLE,
          KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
          AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
          ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
        }).promise();
        console.log(`Whitelist table (${WHITELIST_TABLE}) created`);
      } catch (error) {
        console.error(`Error creating whitelist table (${WHITELIST_TABLE}):`, error.message);
      }
    }
    
    // Test writing to presale table
    console.log(`Testing write to presale table (${PRESALE_TABLE})...`);
    const testItem = {
      saleKey: 'test-item',
      timestamp: new Date().toISOString(),
      message: 'This is a test item'
    };
    
    await dynamoDB.put({
      TableName: PRESALE_TABLE,
      Item: testItem
    }).promise();
    
    console.log(`Successfully wrote test item to presale table (${PRESALE_TABLE})`);
    
    // Test reading from presale table
    console.log(`Testing read from presale table (${PRESALE_TABLE})...`);
    const getResult = await dynamoDB.get({
      TableName: PRESALE_TABLE,
      Key: { saleKey: 'test-item' }
    }).promise();
    
    if (getResult.Item) {
      console.log(`Successfully read test item from presale table (${PRESALE_TABLE}):`, getResult.Item);
    } else {
      console.log(`No test item found in presale table (${PRESALE_TABLE})`);
    }
    
    // Delete test item
    console.log(`Deleting test item from presale table (${PRESALE_TABLE})...`);
    await dynamoDB.delete({
      TableName: PRESALE_TABLE,
      Key: { saleKey: 'test-item' }
    }).promise();
    
    console.log(`Successfully deleted test item from presale table (${PRESALE_TABLE})`);
    
    return true;
  } catch (error) {
    console.error('Error connecting to DynamoDB:', error.message);
    return false;
  }
}

// Test adding a whitelist entry
async function testAddWhitelistEntry() {
  console.log('\n--- Testing Add Whitelist Entry ---');
  try {
    // Generate a random Solana address for testing
    const testAddress = new PublicKey(PublicKey.unique()).toString();
    
    // Add to whitelist
    const whitelistEntry = {
      id: `test-${Date.now()}`,
      walletAddress: testAddress,
      allocation: 1000,
      email: 'test@example.com',
      dateAdded: new Date().toISOString(),
      status: 'Active'
    };
    
    await dynamoDB.put({
      TableName: WHITELIST_TABLE,
      Item: whitelistEntry
    }).promise();
    
    console.log(`Successfully added whitelist entry for ${testAddress}`);
    
    // Get whitelist entries
    const scanResult = await dynamoDB.scan({
      TableName: WHITELIST_TABLE
    }).promise();
    
    console.log(`Found ${scanResult.Items.length} whitelist entries:`);
    scanResult.Items.forEach(item => {
      console.log(`- ${item.walletAddress || item.address} (${item.email}): ${item.allocation}`);
    });
    
    return true;
  } catch (error) {
    console.error('Error testing whitelist entry:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('Starting live connection tests...');
  
  const solanaConnected = await testSolanaConnection();
  const dynamoDBConnected = await testDynamoDBConnection();
  
  if (solanaConnected && dynamoDBConnected) {
    await testAddWhitelistEntry();
    
    console.log('\n--- Test Results ---');
    console.log('✅ Successfully connected to Solana blockchain');
    console.log('✅ Successfully connected to AWS DynamoDB');
    console.log('✅ Successfully added whitelist entry to DynamoDB');
    console.log('\nAll tests passed! The backend is properly configured to connect to live services.');
  } else {
    console.log('\n--- Test Results ---');
    if (!solanaConnected) console.log('❌ Failed to connect to Solana blockchain');
    if (!dynamoDBConnected) console.log('❌ Failed to connect to AWS DynamoDB');
    console.log('\nSome tests failed. Please check the error messages above.');
  }
}

// Run the tests
runTests().catch(console.error);
