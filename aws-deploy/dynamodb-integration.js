/**
 * DynamoDB Integration for DPNET-10 Admin Dashboard
 * 
 * This script provides functionality to interact with DynamoDB for storing
 * wallet addresses, transactions, and token metadata.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
  BatchWriteCommand
} = require('@aws-sdk/lib-dynamodb');

// Configuration
const REGION = process.env.AWS_REGION || 'us-east-1';
const WALLET_TABLE = process.env.WALLET_TABLE || 'DPNET10_Wallets';
const TRANSACTION_TABLE = process.env.TRANSACTION_TABLE || 'DPNET10_Transactions';
const METADATA_TABLE = process.env.METADATA_TABLE || 'DPNET10_Metadata';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

// Wallet operations
const walletOperations = {
  /**
   * Add a wallet to the database
   * @param {string} address - Wallet address
   * @param {object} data - Additional wallet data
   */
  addWallet: async (address, data = {}) => {
    const item = {
      walletAddress: address,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };

    const command = new PutCommand({
      TableName: WALLET_TABLE,
      Item: item
    });

    try {
      await docClient.send(command);
      console.log(`Wallet ${address} added successfully`);
      return { success: true, data: item };
    } catch (error) {
      console.error('Error adding wallet:', error);
      return { success: false, error };
    }
  },

  /**
   * Get wallet information
   * @param {string} address - Wallet address
   */
  getWallet: async (address) => {
    const command = new GetCommand({
      TableName: WALLET_TABLE,
      Key: { walletAddress: address }
    });

    try {
      const response = await docClient.send(command);
      if (!response.Item) {
        return { success: false, message: 'Wallet not found' };
      }
      return { success: true, data: response.Item };
    } catch (error) {
      console.error('Error getting wallet:', error);
      return { success: false, error };
    }
  },

  /**
   * Update wallet information
   * @param {string} address - Wallet address
   * @param {object} data - Updated wallet data
   */
  updateWallet: async (address, data) => {
    // First, get the existing wallet data
    const getResult = await walletOperations.getWallet(address);
    if (!getResult.success) {
      return getResult;
    }

    const updatedItem = {
      ...getResult.data,
      ...data,
      updatedAt: new Date().toISOString()
    };

    const command = new PutCommand({
      TableName: WALLET_TABLE,
      Item: updatedItem
    });

    try {
      await docClient.send(command);
      console.log(`Wallet ${address} updated successfully`);
      return { success: true, data: updatedItem };
    } catch (error) {
      console.error('Error updating wallet:', error);
      return { success: false, error };
    }
  },

  /**
   * Delete a wallet
   * @param {string} address - Wallet address
   */
  deleteWallet: async (address) => {
    const command = new DeleteCommand({
      TableName: WALLET_TABLE,
      Key: { walletAddress: address }
    });

    try {
      await docClient.send(command);
      console.log(`Wallet ${address} deleted successfully`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting wallet:', error);
      return { success: false, error };
    }
  },

  /**
   * List all wallets
   */
  listWallets: async () => {
    const command = new ScanCommand({
      TableName: WALLET_TABLE
    });

    try {
      const response = await docClient.send(command);
      return { success: true, data: response.Items };
    } catch (error) {
      console.error('Error listing wallets:', error);
      return { success: false, error };
    }
  }
};

// Transaction operations
const transactionOperations = {
  /**
   * Add a transaction to the database
   * @param {object} transaction - Transaction data
   */
  addTransaction: async (transaction) => {
    const item = {
      transactionId: transaction.id || `tx_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...transaction
    };

    const command = new PutCommand({
      TableName: TRANSACTION_TABLE,
      Item: item
    });

    try {
      await docClient.send(command);
      console.log(`Transaction ${item.transactionId} added successfully`);
      return { success: true, data: item };
    } catch (error) {
      console.error('Error adding transaction:', error);
      return { success: false, error };
    }
  },

  /**
   * Get transaction by ID
   * @param {string} id - Transaction ID
   */
  getTransaction: async (id) => {
    const command = new GetCommand({
      TableName: TRANSACTION_TABLE,
      Key: { transactionId: id }
    });

    try {
      const response = await docClient.send(command);
      if (!response.Item) {
        return { success: false, message: 'Transaction not found' };
      }
      return { success: true, data: response.Item };
    } catch (error) {
      console.error('Error getting transaction:', error);
      return { success: false, error };
    }
  },

  /**
   * Get transactions for a wallet
   * @param {string} walletAddress - Wallet address
   */
  getWalletTransactions: async (walletAddress) => {
    // This assumes we have a GSI on walletAddress
    const command = new QueryCommand({
      TableName: TRANSACTION_TABLE,
      IndexName: 'WalletAddressIndex',
      KeyConditionExpression: 'walletAddress = :address',
      ExpressionAttributeValues: {
        ':address': walletAddress
      }
    });

    try {
      const response = await docClient.send(command);
      return { success: true, data: response.Items };
    } catch (error) {
      console.error('Error getting wallet transactions:', error);
      return { success: false, error };
    }
  },

  /**
   * List recent transactions
   * @param {number} limit - Number of transactions to return
   */
  listRecentTransactions: async (limit = 10) => {
    // This assumes we have a GSI on timestamp
    const command = new QueryCommand({
      TableName: TRANSACTION_TABLE,
      IndexName: 'TimestampIndex',
      KeyConditionExpression: 'dummy = :dummy',
      ExpressionAttributeValues: {
        ':dummy': 'dummy' // This is a workaround for scanning with sorting
      },
      ScanIndexForward: false, // descending order
      Limit: limit
    });

    try {
      const response = await docClient.send(command);
      return { success: true, data: response.Items };
    } catch (error) {
      console.error('Error listing recent transactions:', error);
      
      // Fallback to scan if the GSI doesn't exist
      try {
        const scanCommand = new ScanCommand({
          TableName: TRANSACTION_TABLE,
          Limit: limit
        });
        
        const scanResponse = await docClient.send(scanCommand);
        // Sort by timestamp descending
        const sortedItems = scanResponse.Items.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        ).slice(0, limit);
        
        return { success: true, data: sortedItems };
      } catch (scanError) {
        console.error('Error scanning transactions:', scanError);
        return { success: false, error: scanError };
      }
    }
  }
};

// Metadata operations
const metadataOperations = {
  /**
   * Store token metadata
   * @param {object} metadata - Token metadata
   */
  storeMetadata: async (metadata) => {
    const item = {
      tokenAddress: metadata.tokenAddress,
      updatedAt: new Date().toISOString(),
      ...metadata
    };

    const command = new PutCommand({
      TableName: METADATA_TABLE,
      Item: item
    });

    try {
      await docClient.send(command);
      console.log(`Metadata for ${metadata.tokenAddress} stored successfully`);
      return { success: true, data: item };
    } catch (error) {
      console.error('Error storing metadata:', error);
      return { success: false, error };
    }
  },

  /**
   * Get token metadata
   * @param {string} tokenAddress - Token address
   */
  getMetadata: async (tokenAddress) => {
    const command = new GetCommand({
      TableName: METADATA_TABLE,
      Key: { tokenAddress }
    });

    try {
      const response = await docClient.send(command);
      if (!response.Item) {
        return { success: false, message: 'Metadata not found' };
      }
      return { success: true, data: response.Item };
    } catch (error) {
      console.error('Error getting metadata:', error);
      return { success: false, error };
    }
  },

  /**
   * Update token metadata
   * @param {string} tokenAddress - Token address
   * @param {object} metadata - Updated metadata
   */
  updateMetadata: async (tokenAddress, metadata) => {
    // First, get the existing metadata
    const getResult = await metadataOperations.getMetadata(tokenAddress);
    if (!getResult.success) {
      return getResult;
    }

    const updatedItem = {
      ...getResult.data,
      ...metadata,
      updatedAt: new Date().toISOString()
    };

    const command = new PutCommand({
      TableName: METADATA_TABLE,
      Item: updatedItem
    });

    try {
      await docClient.send(command);
      console.log(`Metadata for ${tokenAddress} updated successfully`);
      return { success: true, data: updatedItem };
    } catch (error) {
      console.error('Error updating metadata:', error);
      return { success: false, error };
    }
  }
};

// Test functions
const testFunctions = {
  /**
   * Test DynamoDB connection
   */
  testConnection: async () => {
    try {
      // Try to list tables as a simple connection test
      const response = await client.listTables({});
      console.log('DynamoDB connection successful');
      console.log('Available tables:', response.TableNames);
      return { success: true, tables: response.TableNames };
    } catch (error) {
      console.error('DynamoDB connection failed:', error);
      return { success: false, error };
    }
  },

  /**
   * Test wallet table operations
   */
  testWalletTable: async () => {
    const testWalletAddress = `test_wallet_${Date.now()}`;
    
    try {
      // Add a test wallet
      const addResult = await walletOperations.addWallet(testWalletAddress, {
        balance: 1000,
        isWhitelisted: true
      });
      
      if (!addResult.success) {
        return { success: false, message: 'Failed to add test wallet', error: addResult.error };
      }
      
      // Get the wallet
      const getResult = await walletOperations.getWallet(testWalletAddress);
      if (!getResult.success) {
        return { success: false, message: 'Failed to get test wallet', error: getResult.error };
      }
      
      // Update the wallet
      const updateResult = await walletOperations.updateWallet(testWalletAddress, {
        balance: 2000
      });
      
      if (!updateResult.success) {
        return { success: false, message: 'Failed to update test wallet', error: updateResult.error };
      }
      
      // Delete the wallet
      const deleteResult = await walletOperations.deleteWallet(testWalletAddress);
      if (!deleteResult.success) {
        return { success: false, message: 'Failed to delete test wallet', error: deleteResult.error };
      }
      
      console.log('Wallet table operations test passed');
      return { success: true };
    } catch (error) {
      console.error('Error testing wallet table:', error);
      return { success: false, error };
    }
  },

  /**
   * Test transaction table operations
   */
  testTransactionTable: async () => {
    const testTransactionId = `test_tx_${Date.now()}`;
    const testWalletAddress = `test_wallet_${Date.now()}`;
    
    try {
      // Add a test transaction
      const addResult = await transactionOperations.addTransaction({
        id: testTransactionId,
        walletAddress: testWalletAddress,
        amount: 1000,
        type: 'transfer'
      });
      
      if (!addResult.success) {
        return { success: false, message: 'Failed to add test transaction', error: addResult.error };
      }
      
      // Get the transaction
      const getResult = await transactionOperations.getTransaction(testTransactionId);
      if (!getResult.success) {
        return { success: false, message: 'Failed to get test transaction', error: getResult.error };
      }
      
      console.log('Transaction table operations test passed');
      return { success: true };
    } catch (error) {
      console.error('Error testing transaction table:', error);
      return { success: false, error };
    }
  },

  /**
   * Test metadata table operations
   */
  testMetadataTable: async () => {
    const testTokenAddress = `test_token_${Date.now()}`;
    
    try {
      // Store test metadata
      const storeResult = await metadataOperations.storeMetadata({
        tokenAddress: testTokenAddress,
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 9,
        totalSupply: '1000000000'
      });
      
      if (!storeResult.success) {
        return { success: false, message: 'Failed to store test metadata', error: storeResult.error };
      }
      
      // Get the metadata
      const getResult = await metadataOperations.getMetadata(testTokenAddress);
      if (!getResult.success) {
        return { success: false, message: 'Failed to get test metadata', error: getResult.error };
      }
      
      // Update the metadata
      const updateResult = await metadataOperations.updateMetadata(testTokenAddress, {
        totalSupply: '2000000000'
      });
      
      if (!updateResult.success) {
        return { success: false, message: 'Failed to update test metadata', error: updateResult.error };
      }
      
      console.log('Metadata table operations test passed');
      return { success: true };
    } catch (error) {
      console.error('Error testing metadata table:', error);
      return { success: false, error };
    }
  },

  /**
   * Test query performance
   */
  testQueryPerformance: async () => {
    try {
      console.log('Testing query performance...');
      
      // Measure time to list wallets
      const walletStart = Date.now();
      await walletOperations.listWallets();
      const walletTime = Date.now() - walletStart;
      
      // Measure time to list recent transactions
      const txStart = Date.now();
      await transactionOperations.listRecentTransactions(100);
      const txTime = Date.now() - txStart;
      
      console.log(`Wallet list query time: ${walletTime}ms`);
      console.log(`Transaction list query time: ${txTime}ms`);
      
      // Simple performance assessment
      const isPerformanceGood = walletTime < 1000 && txTime < 1000;
      
      return { 
        success: true, 
        performanceGood: isPerformanceGood,
        metrics: {
          walletQueryTime: walletTime,
          transactionQueryTime: txTime
        }
      };
    } catch (error) {
      console.error('Error testing query performance:', error);
      return { success: false, error };
    }
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('Starting DynamoDB integration tests...');
  
  const results = {
    connection: await testFunctions.testConnection(),
    walletTable: await testFunctions.testWalletTable(),
    transactionTable: await testFunctions.testTransactionTable(),
    metadataTable: await testFunctions.testMetadataTable(),
    queryPerformance: await testFunctions.testQueryPerformance()
  };
  
  const allTestsPassed = Object.values(results).every(result => result.success);
  
  console.log('\nTest Results:');
  console.log('-------------');
  Object.entries(results).forEach(([testName, result]) => {
    console.log(`${testName}: ${result.success ? 'PASSED' : 'FAILED'}`);
  });
  
  console.log(`\nOverall: ${allTestsPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  
  return {
    success: allTestsPassed,
    results
  };
};

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests()
    .then(results => {
      process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Error running tests:', error);
      process.exit(1);
    });
}

module.exports = {
  walletOperations,
  transactionOperations,
  metadataOperations,
  testFunctions,
  runAllTests
};
