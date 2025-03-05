/**
 * DynamoDB Integration for DPNET-10 Admin Dashboard
 * 
 * This script provides functions for interacting with DynamoDB to store and retrieve
 * wallet addresses, transactions, and token metadata.
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configure AWS SDK
const configureAWS = () => {
  AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });
  
  return new AWS.DynamoDB.DocumentClient();
};

// Initialize DynamoDB client
const dynamoDB = configureAWS();

// Table names
const WALLETS_TABLE = process.env.DYNAMODB_WALLETS_TABLE || 'dpnet10-wallets';
const TRANSACTIONS_TABLE = process.env.DYNAMODB_TRANSACTIONS_TABLE || 'dpnet10-transactions';
const METADATA_TABLE = process.env.DYNAMODB_METADATA_TABLE || 'dpnet10-metadata';

// Wallet functions
const createWallet = async (walletData) => {
  const params = {
    TableName: WALLETS_TABLE,
    Item: {
      id: walletData.address,
      address: walletData.address,
      balance: walletData.balance || 0,
      isWhitelisted: walletData.isWhitelisted || false,
      dateAdded: walletData.dateAdded || new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }
  };
  
  try {
    await dynamoDB.put(params).promise();
    return params.Item;
  } catch (error) {
    console.error('Error creating wallet in DynamoDB:', error);
    throw error;
  }
};

const getWallet = async (address) => {
  const params = {
    TableName: WALLETS_TABLE,
    Key: {
      id: address
    }
  };
  
  try {
    const result = await dynamoDB.get(params).promise();
    return result.Item;
  } catch (error) {
    console.error('Error getting wallet from DynamoDB:', error);
    throw error;
  }
};

const updateWallet = async (address, updateData) => {
  // Build update expression and attribute values
  let updateExpression = 'set';
  const expressionAttributeValues = {};
  const expressionAttributeNames = {};
  
  Object.keys(updateData).forEach((key, index) => {
    const attributeName = `#attr${index}`;
    const attributeValue = `:val${index}`;
    
    updateExpression += `${index === 0 ? ' ' : ', '}${attributeName} = ${attributeValue}`;
    expressionAttributeNames[attributeName] = key;
    expressionAttributeValues[attributeValue] = updateData[key];
  });
  
  // Always update lastUpdated
  updateExpression += ', #lastUpdated = :lastUpdated';
  expressionAttributeNames['#lastUpdated'] = 'lastUpdated';
  expressionAttributeValues[':lastUpdated'] = new Date().toISOString();
  
  const params = {
    TableName: WALLETS_TABLE,
    Key: {
      id: address
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };
  
  try {
    const result = await dynamoDB.update(params).promise();
    return result.Attributes;
  } catch (error) {
    console.error('Error updating wallet in DynamoDB:', error);
    throw error;
  }
};

const deleteWallet = async (address) => {
  const params = {
    TableName: WALLETS_TABLE,
    Key: {
      id: address
    }
  };
  
  try {
    await dynamoDB.delete(params).promise();
    return { address, deleted: true };
  } catch (error) {
    console.error('Error deleting wallet from DynamoDB:', error);
    throw error;
  }
};

const listWallets = async (limit = 100, lastEvaluatedKey = null) => {
  const params = {
    TableName: WALLETS_TABLE,
    Limit: limit
  };
  
  if (lastEvaluatedKey) {
    params.ExclusiveStartKey = lastEvaluatedKey;
  }
  
  try {
    const result = await dynamoDB.scan(params).promise();
    return {
      wallets: result.Items,
      lastEvaluatedKey: result.LastEvaluatedKey
    };
  } catch (error) {
    console.error('Error listing wallets from DynamoDB:', error);
    throw error;
  }
};

// Transaction functions
const createTransaction = async (transactionData) => {
  const params = {
    TableName: TRANSACTIONS_TABLE,
    Item: {
      id: uuidv4(),
      type: transactionData.type,
      fromAddress: transactionData.fromAddress,
      toAddress: transactionData.toAddress,
      amount: transactionData.amount,
      signature: transactionData.signature,
      timestamp: transactionData.timestamp || new Date().toISOString(),
      status: transactionData.status || 'completed',
      blockHeight: transactionData.blockHeight,
      slot: transactionData.slot
    }
  };
  
  try {
    await dynamoDB.put(params).promise();
    return params.Item;
  } catch (error) {
    console.error('Error creating transaction in DynamoDB:', error);
    throw error;
  }
};

const getTransaction = async (id) => {
  const params = {
    TableName: TRANSACTIONS_TABLE,
    Key: {
      id: id
    }
  };
  
  try {
    const result = await dynamoDB.get(params).promise();
    return result.Item;
  } catch (error) {
    console.error('Error getting transaction from DynamoDB:', error);
    throw error;
  }
};

const listTransactions = async (limit = 100, lastEvaluatedKey = null) => {
  const params = {
    TableName: TRANSACTIONS_TABLE,
    Limit: limit
  };
  
  if (lastEvaluatedKey) {
    params.ExclusiveStartKey = lastEvaluatedKey;
  }
  
  try {
    const result = await dynamoDB.scan(params).promise();
    return {
      transactions: result.Items,
      lastEvaluatedKey: result.LastEvaluatedKey
    };
  } catch (error) {
    console.error('Error listing transactions from DynamoDB:', error);
    throw error;
  }
};

const getTransactionsByWallet = async (address, limit = 100, lastEvaluatedKey = null) => {
  // Query for transactions where the wallet is either the sender or receiver
  const params = {
    TableName: TRANSACTIONS_TABLE,
    FilterExpression: 'fromAddress = :address OR toAddress = :address',
    ExpressionAttributeValues: {
      ':address': address
    },
    Limit: limit
  };
  
  if (lastEvaluatedKey) {
    params.ExclusiveStartKey = lastEvaluatedKey;
  }
  
  try {
    const result = await dynamoDB.scan(params).promise();
    return {
      transactions: result.Items,
      lastEvaluatedKey: result.LastEvaluatedKey
    };
  } catch (error) {
    console.error('Error getting transactions by wallet from DynamoDB:', error);
    throw error;
  }
};

// Metadata functions
const updateTokenMetadata = async (metadata) => {
  const params = {
    TableName: METADATA_TABLE,
    Item: {
      id: 'dpnet10-token',
      name: metadata.name || 'DPNET-10',
      symbol: metadata.symbol || 'DPNET',
      decimals: metadata.decimals || 9,
      totalSupply: metadata.totalSupply,
      circulatingSupply: metadata.circulatingSupply,
      tokenAddress: metadata.tokenAddress,
      ownerAddress: metadata.ownerAddress,
      mintAuthority: metadata.mintAuthority,
      freezeAuthority: metadata.freezeAuthority,
      lastUpdated: new Date().toISOString()
    }
  };
  
  try {
    await dynamoDB.put(params).promise();
    return params.Item;
  } catch (error) {
    console.error('Error updating token metadata in DynamoDB:', error);
    throw error;
  }
};

const getTokenMetadata = async () => {
  const params = {
    TableName: METADATA_TABLE,
    Key: {
      id: 'dpnet10-token'
    }
  };
  
  try {
    const result = await dynamoDB.get(params).promise();
    return result.Item;
  } catch (error) {
    console.error('Error getting token metadata from DynamoDB:', error);
    throw error;
  }
};

// Test DynamoDB connection
const testConnection = async () => {
  try {
    // Try to list tables to test connection
    const dynamoDB = new AWS.DynamoDB();
    await dynamoDB.listTables({}).promise();
    return { connected: true };
  } catch (error) {
    console.error('Error connecting to DynamoDB:', error);
    return { connected: false, error: error.message };
  }
};

// Run tests for DynamoDB integration
const runTests = async () => {
  const testResults = {
    success: true,
    tests: []
  };
  
  try {
    console.log('Starting DynamoDB integration tests...');
    
    // Test 1: Connection Test
    try {
      console.log('Running DynamoDB Connection Test...');
      const connectionResult = await testConnection();
      
      if (connectionResult.connected) {
        testResults.tests.push({
          name: 'DynamoDB Connection Test',
          status: 'passed',
          message: 'Successfully connected to DynamoDB'
        });
        
        console.log('DynamoDB Connection Test passed');
      } else {
        testResults.success = false;
        testResults.tests.push({
          name: 'DynamoDB Connection Test',
          status: 'failed',
          message: `Failed to connect to DynamoDB: ${connectionResult.error}`
        });
        
        console.error('DynamoDB Connection Test failed:', connectionResult.error);
        // If connection fails, don't run other tests
        return testResults;
      }
    } catch (error) {
      testResults.success = false;
      testResults.tests.push({
        name: 'DynamoDB Connection Test',
        status: 'failed',
        message: `Error: ${error.message}`
      });
      
      console.error('DynamoDB Connection Test failed:', error);
      // If connection fails, don't run other tests
      return testResults;
    }
    
    // Test 2: Wallet Table Test
    try {
      console.log('Running Wallet Table Test...');
      
      // Create a test wallet
      const testWallet = {
        address: `test-wallet-${Date.now()}`,
        balance: 1000,
        isWhitelisted: true
      };
      
      // Create wallet
      const createdWallet = await createWallet(testWallet);
      
      // Get wallet
      const retrievedWallet = await getWallet(testWallet.address);
      
      // Update wallet
      const updatedWallet = await updateWallet(testWallet.address, {
        balance: 2000,
        isWhitelisted: false
      });
      
      // Delete wallet
      await deleteWallet(testWallet.address);
      
      // Verify operations
      const createSuccess = createdWallet.address === testWallet.address;
      const retrieveSuccess = retrievedWallet.address === testWallet.address;
      const updateSuccess = updatedWallet.balance === 2000 && updatedWallet.isWhitelisted === false;
      
      if (createSuccess && retrieveSuccess && updateSuccess) {
        testResults.tests.push({
          name: 'Wallet Table Test',
          status: 'passed',
          message: 'Wallet table operations working correctly'
        });
        
        console.log('Wallet Table Test passed');
      } else {
        testResults.success = false;
        testResults.tests.push({
          name: 'Wallet Table Test',
          status: 'failed',
          message: 'Wallet table operations failed',
          details: {
            createSuccess,
            retrieveSuccess,
            updateSuccess
          }
        });
        
        console.error('Wallet Table Test failed');
      }
    } catch (error) {
      testResults.success = false;
      testResults.tests.push({
        name: 'Wallet Table Test',
        status: 'failed',
        message: `Error: ${error.message}`
      });
      
      console.error('Wallet Table Test failed:', error);
    }
    
    // Test 3: Transaction Table Test
    try {
      console.log('Running Transaction Table Test...');
      
      // Create a test transaction
      const testTransaction = {
        type: 'transfer',
        fromAddress: 'test-sender',
        toAddress: 'test-receiver',
        amount: 500,
        signature: 'test-signature',
        blockHeight: 12345,
        slot: 67890
      };
      
      // Create transaction
      const createdTransaction = await createTransaction(testTransaction);
      
      // Get transaction
      const retrievedTransaction = await getTransaction(createdTransaction.id);
      
      // Verify operations
      const createSuccess = createdTransaction.fromAddress === testTransaction.fromAddress &&
                           createdTransaction.toAddress === testTransaction.toAddress;
      const retrieveSuccess = retrievedTransaction.id === createdTransaction.id;
      
      if (createSuccess && retrieveSuccess) {
        testResults.tests.push({
          name: 'Transaction Table Test',
          status: 'passed',
          message: 'Transaction table operations working correctly'
        });
        
        console.log('Transaction Table Test passed');
      } else {
        testResults.success = false;
        testResults.tests.push({
          name: 'Transaction Table Test',
          status: 'failed',
          message: 'Transaction table operations failed',
          details: {
            createSuccess,
            retrieveSuccess
          }
        });
        
        console.error('Transaction Table Test failed');
      }
    } catch (error) {
      testResults.success = false;
      testResults.tests.push({
        name: 'Transaction Table Test',
        status: 'failed',
        message: `Error: ${error.message}`
      });
      
      console.error('Transaction Table Test failed:', error);
    }
    
    // Test 4: Metadata Table Test
    try {
      console.log('Running Metadata Table Test...');
      
      // Create test metadata
      const testMetadata = {
        name: 'DPNET-10',
        symbol: 'DPNET',
        decimals: 9,
        totalSupply: '1000000000000000000',
        circulatingSupply: '250000000000000000',
        tokenAddress: '7XSvJnS19TodrQJSbjUR3NLSZoK3mHvfGqVhxJQRPvTb',
        ownerAddress: '9XyQMkZG8Ro7BKYYPCe9Xvjrv8uLZMGZwGhVJZFwBvU9',
        mintAuthority: '9XyQMkZG8Ro7BKYYPCe9Xvjrv8uLZMGZwGhVJZFwBvU9',
        freezeAuthority: '9XyQMkZG8Ro7BKYYPCe9Xvjrv8uLZMGZwGhVJZFwBvU9'
      };
      
      // Update metadata
      const updatedMetadata = await updateTokenMetadata(testMetadata);
      
      // Get metadata
      const retrievedMetadata = await getTokenMetadata();
      
      // Verify operations
      const updateSuccess = updatedMetadata.name === testMetadata.name &&
                           updatedMetadata.symbol === testMetadata.symbol;
      const retrieveSuccess = retrievedMetadata.id === 'dpnet10-token';
      
      if (updateSuccess && retrieveSuccess) {
        testResults.tests.push({
          name: 'Metadata Table Test',
          status: 'passed',
          message: 'Metadata table operations working correctly'
        });
        
        console.log('Metadata Table Test passed');
      } else {
        testResults.success = false;
        testResults.tests.push({
          name: 'Metadata Table Test',
          status: 'failed',
          message: 'Metadata table operations failed',
          details: {
            updateSuccess,
            retrieveSuccess
          }
        });
        
        console.error('Metadata Table Test failed');
      }
    } catch (error) {
      testResults.success = false;
      testResults.tests.push({
        name: 'Metadata Table Test',
        status: 'failed',
        message: `Error: ${error.message}`
      });
      
      console.error('Metadata Table Test failed:', error);
    }
    
    // Test 5: Query Performance Test
    try {
      console.log('Running Query Performance Test...');
      
      // Create multiple test wallets
      const testWallets = [];
      for (let i = 0; i < 10; i++) {
        testWallets.push({
          address: `perf-test-wallet-${i}-${Date.now()}`,
          balance: i * 1000,
          isWhitelisted: i % 2 === 0
        });
      }
      
      // Create wallets
      for (const wallet of testWallets) {
        await createWallet(wallet);
      }
      
      // Create multiple test transactions
      const testTransactions = [];
      for (let i = 0; i < 10; i++) {
        testTransactions.push({
          type: 'transfer',
          fromAddress: testWallets[i % testWallets.length].address,
          toAddress: testWallets[(i + 1) % testWallets.length].address,
          amount: i * 100,
          signature: `perf-test-signature-${i}`,
          blockHeight: 12345 + i,
          slot: 67890 + i
        });
      }
      
      // Create transactions
      for (const transaction of testTransactions) {
        await createTransaction(transaction);
      }
      
      // Measure performance of listing wallets
      const startWalletList = Date.now();
      await listWallets(100);
      const walletListTime = Date.now() - startWalletList;
      
      // Measure performance of listing transactions
      const startTransactionList = Date.now();
      await listTransactions(100);
      const transactionListTime = Date.now() - startTransactionList;
      
      // Measure performance of getting transactions by wallet
      const startWalletTransactions = Date.now();
      await getTransactionsByWallet(testWallets[0].address);
      const walletTransactionsTime = Date.now() - startWalletTransactions;
      
      // Clean up test data
      for (const wallet of testWallets) {
        await deleteWallet(wallet.address);
      }
      
      // Evaluate performance
      const performanceThreshold = 500; // 500ms
      const walletListPerformance = walletListTime < performanceThreshold;
      const transactionListPerformance = transactionListTime < performanceThreshold;
      const walletTransactionsPerformance = walletTransactionsTime < performanceThreshold;
      
      const overallPerformance = walletListPerformance && 
                               transactionListPerformance && 
                               walletTransactionsPerformance;
      
      if (overallPerformance) {
        testResults.tests.push({
          name: 'Query Performance Test',
          status: 'passed',
          message: 'Query performance is acceptable',
          details: {
            walletListTime,
            transactionListTime,
            walletTransactionsTime
          }
        });
        
        console.log('Query Performance Test passed');
      } else {
        testResults.tests.push({
          name: 'Query Performance Test',
          status: 'warning',
          message: 'Query performance could be improved',
          details: {
            walletListTime,
            transactionListTime,
            walletTransactionsTime,
            threshold: performanceThreshold
          }
        });
        
        console.warn('Query Performance Test warning: Performance could be improved');
      }
    } catch (error) {
      testResults.success = false;
      testResults.tests.push({
        name: 'Query Performance Test',
        status: 'failed',
        message: `Error: ${error.message}`
      });
      
      console.error('Query Performance Test failed:', error);
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
};

// Run tests if executed directly
if (require.main === module) {
  runTests()
    .then(results => {
      // Write results to file
      const fs = require('fs');
      const path = require('path');
      
      fs.writeFileSync(
        path.resolve(__dirname, 'dynamodb-test-results.json'),
        JSON.stringify(results, null, 2)
      );
      
      process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

module.exports = {
  // Wallet functions
  createWallet,
  getWallet,
  updateWallet,
  deleteWallet,
  listWallets,
  
  // Transaction functions
  createTransaction,
  getTransaction,
  listTransactions,
  getTransactionsByWallet,
  
  // Metadata functions
  updateTokenMetadata,
  getTokenMetadata,
  
  // Test functions
  testConnection,
  runTests
};
