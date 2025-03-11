const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-2',
  maxRetries: 3,
  httpOptions: {
    timeout: 5000,
    connectTimeout: 3000
  }
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TableNames = {
  PRESALE: process.env.PRESALE_TABLE || 'dpnetsale',
  WHITELIST: process.env.WHITELIST_TABLE || 'dpnet-whitelist',
  TRANSACTIONS: process.env.TRANSACTIONS_TABLE || 'dpnet-transactions'
};

// Add logging for debugging
const logDynamoDBOperation = async (operation, params) => {
  try {
    console.log(`DynamoDB ${operation} operation:`, params);
    const result = await dynamoDB[operation](params).promise();
    console.log(`DynamoDB ${operation} success:`, result);
    return result;
  } catch (error) {
    console.error(`DynamoDB ${operation} failed:`, error);
    throw error;
  }
};

module.exports = {
  async getItem(tableName, key) {
    return logDynamoDBOperation('get', {
      TableName: TableNames[tableName],
      Key: key
    });
  },
  
  async putItem(tableName, item) {
    return logDynamoDBOperation('put', {
      TableName: TableNames[tableName],
      Item: item
    });
  },
  
  async queryItems(tableName, params) {
    return logDynamoDBOperation('query', {
      TableName: TableNames[tableName],
      ...params
    });
  }
};
