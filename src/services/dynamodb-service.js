/**
 * Updated DynamoDB Service Module
 * Provides functions to interact with DynamoDB tables
 * Uses AWS SDK v3 style throughout for consistency
 */

const {
  DynamoDBClient,
  ListTablesCommand,
  CreateTableCommand,
  DescribeTableCommand
} = require('@aws-sdk/client-dynamodb');

const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand,
  BatchWriteCommand
} = require('@aws-sdk/lib-dynamodb');

/**
 * Creates a DynamoDB service with the provided client and table names
 * @param {Object} dynamoClient - DynamoDB Client
 * @param {Object} docClient - DynamoDB Document Client
 * @param {Object} tables - Object containing table names
 * @returns {Object} - DynamoDB service functions
 */
module.exports = (dynamoClient, docClient, tables) => {
  const { WALLET_TABLE, TRANSACTION_TABLE, METADATA_TABLE, WHITELIST_TABLE } = tables;

  // Ensure the whitelist table exists with the correct schema
  const ensureWhitelistTable = async () => {
    try {
      // Check if the table exists
      const describeCommand = new DescribeTableCommand({ TableName: WHITELIST_TABLE });
      try {
        await dynamoClient.send(describeCommand);
        console.log(`Table ${WHITELIST_TABLE} exists`);
        return true;
      } catch (error) {
        if (error.name === 'ResourceNotFoundException') {
          console.log(`Table ${WHITELIST_TABLE} does not exist, creating...`);
          
          // Create the table with the correct schema
          const createTableCommand = new CreateTableCommand({
            TableName: WHITELIST_TABLE,
            KeySchema: [
              { AttributeName: 'address', KeyType: 'HASH' }
            ],
            AttributeDefinitions: [
              { AttributeName: 'address', AttributeType: 'S' }
            ],
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5
            }
          });
          
          await dynamoClient.send(createTableCommand);
          console.log(`Table ${WHITELIST_TABLE} creation initiated`);
          
          // Wait for the table to be created
          let tableExists = false;
          while (!tableExists) {
            try {
              await dynamoClient.send(describeCommand);
              tableExists = true;
            } catch (e) {
              console.log('Waiting for table to be created...');
              await new Promise(resolve => setTimeout(resolve, 5000));
            }
          }
          
          console.log(`Table ${WHITELIST_TABLE} created successfully`);
          return true;
        }
        throw error;
      }
    } catch (error) {
      console.error(`Error ensuring whitelist table: ${error}`);
      return false;
    }
  };

  // Initialize by ensuring tables exist
  (async () => {
    try {
      await ensureWhitelistTable();
    } catch (error) {
      console.error('Error initializing DynamoDB service:', error);
    }
  })();

  return {
    /**
     * Get the raw DynamoDB client
     * This is needed for operations not supported by the document client
     */
    getClient: () => dynamoClient,
    
    /**
     * Get the DynamoDB Document client
     */
    getDocClient: () => docClient,

    /**
     * Ensure the whitelist table exists with the correct schema
     */
    ensureWhitelistTable,

    /**
     * Wallet Operations
     */
    wallet: {
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
          throw error;
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
          throw error;
        }
      },

      /**
       * Update wallet information
       * @param {string} address - Wallet address
       * @param {object} data - Updated wallet data
       */
      updateWallet: async (address, data) => {
        // First, get the existing wallet data
        const getCommand = new GetCommand({
          TableName: WALLET_TABLE,
          Key: { walletAddress: address }
        });
        
        try {
          const getResponse = await docClient.send(getCommand);
          if (!getResponse.Item) {
            return { success: false, message: 'Wallet not found' };
          }
          
          const updatedItem = {
            ...getResponse.Item,
            ...data,
            updatedAt: new Date().toISOString()
          };

          const putCommand = new PutCommand({
            TableName: WALLET_TABLE,
            Item: updatedItem
          });

          await docClient.send(putCommand);
          console.log(`Wallet ${address} updated successfully`);
          return { success: true, data: updatedItem };
        } catch (error) {
          console.error('Error updating wallet:', error);
          throw error;
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
          throw error;
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
          return { success: true, data: response.Items || [] };
        } catch (error) {
          console.error('Error listing wallets:', error);
          throw error;
        }
      }
    },

    /**
     * Transaction Operations
     */
    transaction: {
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
          throw error;
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
          throw error;
        }
      },

      /**
       * Get transactions for a wallet
       * @param {string} walletAddress - Wallet address
       */
      getWalletTransactions: async (walletAddress) => {
        // This assumes we have a GSI on walletAddress
        const command = new ScanCommand({
          TableName: TRANSACTION_TABLE,
          FilterExpression: 'walletAddress = :address',
          ExpressionAttributeValues: {
            ':address': walletAddress
          }
        });

        try {
          const response = await docClient.send(command);
          return { success: true, data: response.Items || [] };
        } catch (error) {
          console.error('Error getting wallet transactions:', error);
          throw error;
        }
      },

      /**
       * List recent transactions
       * @param {number} limit - Number of transactions to return
       */
      listRecentTransactions: async (limit = 10) => {
        const command = new ScanCommand({
          TableName: TRANSACTION_TABLE,
          Limit: limit
        });

        try {
          const response = await docClient.send(command);
          // Sort by timestamp descending
          const sortedItems = (response.Items || []).sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
          ).slice(0, limit);
          
          return { success: true, data: sortedItems };
        } catch (error) {
          console.error('Error listing recent transactions:', error);
          throw error;
        }
      }
    },

    /**
     * Metadata Operations
     */
    metadata: {
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
          throw error;
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
          throw error;
        }
      },

      /**
       * Update token metadata
       * @param {string} tokenAddress - Token address
       * @param {object} metadata - Updated metadata
       */
      updateMetadata: async (tokenAddress, metadata) => {
        // First, get the existing metadata
        const getCommand = new GetCommand({
          TableName: METADATA_TABLE,
          Key: { tokenAddress }
        });
        
        try {
          const getResponse = await docClient.send(getCommand);
          
          let updatedItem;
          if (getResponse.Item) {
            updatedItem = {
              ...getResponse.Item,
              ...metadata,
              updatedAt: new Date().toISOString()
            };
          } else {
            // If metadata doesn't exist, create it
            updatedItem = {
              tokenAddress,
              ...metadata,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          }

          const putCommand = new PutCommand({
            TableName: METADATA_TABLE,
            Item: updatedItem
          });

          await docClient.send(putCommand);
          console.log(`Metadata for ${tokenAddress} updated successfully`);
          return { success: true, data: updatedItem };
        } catch (error) {
          console.error('Error updating metadata:', error);
          throw error;
        }
      },

      /**
       * List all metadata
       */
      listMetadata: async () => {
        const command = new ScanCommand({
          TableName: METADATA_TABLE
        });

        try {
          const response = await docClient.send(command);
          return { success: true, data: response.Items || [] };
        } catch (error) {
          console.error('Error listing metadata:', error);
          throw error;
        }
      }
    },

    /**
     * Whitelist Operations
     */
    whitelist: {
      /**
       * Add an address to the whitelist
       * @param {string} address - Wallet address
       * @param {object} data - Additional data
       */
      addToWhitelist: async (address, data = {}) => {
        // Ensure the whitelist table exists
        await ensureWhitelistTable();
        
        const item = {
          address, // Primary key
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'Active',
          ...data
        };

        const command = new PutCommand({
          TableName: WHITELIST_TABLE,
          Item: item
        });

        try {
          await docClient.send(command);
          console.log(`Address ${address} added to whitelist successfully`);
          return { success: true, data: item };
        } catch (error) {
          console.error('Error adding to whitelist:', error);
          throw error;
        }
      },

      /**
       * Get whitelist entry
       * @param {string} address - Wallet address
       */
      getWhitelistEntry: async (address) => {
        // Ensure the whitelist table exists
        await ensureWhitelistTable();
        
        const command = new GetCommand({
          TableName: WHITELIST_TABLE,
          Key: { address }
        });

        try {
          const response = await docClient.send(command);
          if (!response.Item) {
            return { success: false, message: 'Address not found in whitelist' };
          }
          return { success: true, data: response.Item };
        } catch (error) {
          console.error('Error getting whitelist entry:', error);
          throw error;
        }
      },

      /**
       * Remove address from whitelist
       * @param {string} address - Wallet address
       */
      removeFromWhitelist: async (address) => {
        // Ensure the whitelist table exists
        await ensureWhitelistTable();
        
        const command = new DeleteCommand({
          TableName: WHITELIST_TABLE,
          Key: { address }
        });

        try {
          await docClient.send(command);
          console.log(`Address ${address} removed from whitelist successfully`);
          return { success: true };
        } catch (error) {
          console.error('Error removing from whitelist:', error);
          throw error;
        }
      },

      /**
       * List all whitelisted addresses
       */
      listWhitelist: async () => {
        // Ensure the whitelist table exists
        await ensureWhitelistTable();
        
        const command = new ScanCommand({
          TableName: WHITELIST_TABLE
        });

        try {
          const response = await docClient.send(command);
          const items = response.Items || [];
          console.log(`Retrieved ${items.length} whitelist entries from DynamoDB`);
          return { success: true, data: items };
        } catch (error) {
          console.error('Error listing whitelist:', error);
          throw error;
        }
      },
      
      /**
       * Bulk add addresses to whitelist
       * @param {string[]} addresses - Array of wallet addresses
       * @param {number} allocation - Allocation amount for all addresses
       */
      bulkAddToWhitelist: async (addresses, allocation = 0) => {
        // Ensure the whitelist table exists
        await ensureWhitelistTable();
        
        if (!Array.isArray(addresses) || addresses.length === 0) {
          return { success: false, message: 'No addresses provided' };
        }
        
        const timestamp = new Date().toISOString();
        const maxBatchSize = 25; // DynamoDB batch write limit
        const addedItems = [];
        const skippedAddresses = [];
        
        // Process addresses in batches
        for (let i = 0; i < addresses.length; i += maxBatchSize) {
          const batch = addresses.slice(i, i + maxBatchSize);
          
          // First check which addresses already exist
          for (const address of batch) {
            try {
              const getCommand = new GetCommand({
                TableName: WHITELIST_TABLE,
                Key: { address }
              });
              
              const response = await docClient.send(getCommand);
              if (response.Item) {
                skippedAddresses.push(address);
              } else {
                const item = {
                  address,
                  createdAt: timestamp,
                  updatedAt: timestamp,
                  allocation,
                  status: 'Active'
                };
                
                const putCommand = new PutCommand({
                  TableName: WHITELIST_TABLE,
                  Item: item
                });
                
                await docClient.send(putCommand);
                addedItems.push(item);
              }
            } catch (error) {
              console.error(`Error processing address ${address}:`, error);
              skippedAddresses.push(address);
            }
          }
        }
        
        console.log(`Successfully added ${addedItems.length} addresses to whitelist, skipped ${skippedAddresses.length}`);
        return {
          success: true,
          addedCount: addedItems.length,
          skippedCount: skippedAddresses.length,
          addedItems,
          skippedAddresses
        };
      }
    },

    /**
     * Test DynamoDB connection
     */
    testConnection: async () => {
      try {
        // List tables as a simple connection test
        const command = new ListTablesCommand({});
        const response = await dynamoClient.send(command);
        
        console.log('DynamoDB connection successful, tables:', response.TableNames);
        return response.TableNames;
      } catch (error) {
        console.error('DynamoDB connection failed:', error);
        throw error;
      }
    }
  };
};
