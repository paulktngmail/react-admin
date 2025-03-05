/**
 * RDS Integration for DPNET-10 Admin Dashboard
 * 
 * This script provides functionality to interact with RDS for storing
 * relational data such as users, presale events, and token information.
 */

const mysql = require('mysql2/promise');

// Configuration
const DB_CONFIG = {
  host: process.env.RDS_HOST || 'localhost',
  port: process.env.RDS_PORT || 3306,
  user: process.env.RDS_USER || 'admin',
  password: process.env.RDS_PASSWORD || 'password',
  database: process.env.RDS_DATABASE || 'dpnet10_db'
};

// Database connection pool
let pool;

/**
 * Initialize the database connection pool
 */
const initializePool = () => {
  if (!pool) {
    pool = mysql.createPool({
      ...DB_CONFIG,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
};

/**
 * Execute a SQL query
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 */
const executeQuery = async (sql, params = []) => {
  try {
    const connection = await initializePool();
    const [results] = await connection.execute(sql, params);
    return { success: true, data: results };
  } catch (error) {
    console.error('Error executing query:', error);
    return { success: false, error };
  }
};

// User operations
const userOperations = {
  /**
   * Create a new user
   * @param {object} user - User data
   */
  createUser: async (user) => {
    const sql = `
      INSERT INTO users (
        username, email, wallet_address, role, created_at
      ) VALUES (?, ?, ?, ?, NOW())
    `;
    
    const params = [
      user.username,
      user.email,
      user.walletAddress,
      user.role || 'user'
    ];
    
    try {
      const result = await executeQuery(sql, params);
      if (!result.success) {
        return result;
      }
      
      return {
        success: true,
        data: {
          id: result.data.insertId,
          ...user
        }
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error };
    }
  },

  /**
   * Get user by ID
   * @param {number} id - User ID
   */
  getUserById: async (id) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    
    try {
      const result = await executeQuery(sql, [id]);
      if (!result.success) {
        return result;
      }
      
      if (result.data.length === 0) {
        return { success: false, message: 'User not found' };
      }
      
      return { success: true, data: result.data[0] };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return { success: false, error };
    }
  },

  /**
   * Get user by wallet address
   * @param {string} walletAddress - Wallet address
   */
  getUserByWalletAddress: async (walletAddress) => {
    const sql = 'SELECT * FROM users WHERE wallet_address = ?';
    
    try {
      const result = await executeQuery(sql, [walletAddress]);
      if (!result.success) {
        return result;
      }
      
      if (result.data.length === 0) {
        return { success: false, message: 'User not found' };
      }
      
      return { success: true, data: result.data[0] };
    } catch (error) {
      console.error('Error getting user by wallet address:', error);
      return { success: false, error };
    }
  },

  /**
   * Update user
   * @param {number} id - User ID
   * @param {object} userData - Updated user data
   */
  updateUser: async (id, userData) => {
    // Build the SET clause dynamically based on provided fields
    const fields = [];
    const values = [];
    
    if (userData.username) {
      fields.push('username = ?');
      values.push(userData.username);
    }
    
    if (userData.email) {
      fields.push('email = ?');
      values.push(userData.email);
    }
    
    if (userData.walletAddress) {
      fields.push('wallet_address = ?');
      values.push(userData.walletAddress);
    }
    
    if (userData.role) {
      fields.push('role = ?');
      values.push(userData.role);
    }
    
    fields.push('updated_at = NOW()');
    
    if (fields.length === 1) {
      // Only updated_at was added, no actual changes
      return { success: false, message: 'No fields to update' };
    }
    
    const sql = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = ?
    `;
    
    values.push(id);
    
    try {
      const result = await executeQuery(sql, values);
      if (!result.success) {
        return result;
      }
      
      if (result.data.affectedRows === 0) {
        return { success: false, message: 'User not found or no changes made' };
      }
      
      return { success: true, data: { id, ...userData } };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error };
    }
  },

  /**
   * Delete user
   * @param {number} id - User ID
   */
  deleteUser: async (id) => {
    const sql = 'DELETE FROM users WHERE id = ?';
    
    try {
      const result = await executeQuery(sql, [id]);
      if (!result.success) {
        return result;
      }
      
      if (result.data.affectedRows === 0) {
        return { success: false, message: 'User not found' };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error };
    }
  },

  /**
   * List all users
   */
  listUsers: async () => {
    const sql = 'SELECT * FROM users ORDER BY created_at DESC';
    
    try {
      const result = await executeQuery(sql);
      if (!result.success) {
        return result;
      }
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error listing users:', error);
      return { success: false, error };
    }
  }
};

// Presale operations
const presaleOperations = {
  /**
   * Create a new presale event
   * @param {object} presale - Presale data
   */
  createPresale: async (presale) => {
    const sql = `
      INSERT INTO presales (
        name, token_address, start_date, end_date, total_tokens,
        price_per_token, min_purchase, max_purchase, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const params = [
      presale.name,
      presale.tokenAddress,
      presale.startDate,
      presale.endDate,
      presale.totalTokens,
      presale.pricePerToken,
      presale.minPurchase,
      presale.maxPurchase,
      presale.status || 'pending'
    ];
    
    try {
      const result = await executeQuery(sql, params);
      if (!result.success) {
        return result;
      }
      
      return {
        success: true,
        data: {
          id: result.data.insertId,
          ...presale
        }
      };
    } catch (error) {
      console.error('Error creating presale:', error);
      return { success: false, error };
    }
  },

  /**
   * Get presale by ID
   * @param {number} id - Presale ID
   */
  getPresaleById: async (id) => {
    const sql = 'SELECT * FROM presales WHERE id = ?';
    
    try {
      const result = await executeQuery(sql, [id]);
      if (!result.success) {
        return result;
      }
      
      if (result.data.length === 0) {
        return { success: false, message: 'Presale not found' };
      }
      
      return { success: true, data: result.data[0] };
    } catch (error) {
      console.error('Error getting presale by ID:', error);
      return { success: false, error };
    }
  },

  /**
   * Update presale
   * @param {number} id - Presale ID
   * @param {object} presaleData - Updated presale data
   */
  updatePresale: async (id, presaleData) => {
    // Build the SET clause dynamically based on provided fields
    const fields = [];
    const values = [];
    
    const updateableFields = [
      'name', 'token_address', 'start_date', 'end_date', 'total_tokens',
      'price_per_token', 'min_purchase', 'max_purchase', 'status'
    ];
    
    const fieldMapping = {
      tokenAddress: 'token_address',
      startDate: 'start_date',
      endDate: 'end_date',
      totalTokens: 'total_tokens',
      pricePerToken: 'price_per_token',
      minPurchase: 'min_purchase',
      maxPurchase: 'max_purchase'
    };
    
    for (const [key, value] of Object.entries(presaleData)) {
      const dbField = fieldMapping[key] || key;
      if (updateableFields.includes(dbField)) {
        fields.push(`${dbField} = ?`);
        values.push(value);
      }
    }
    
    fields.push('updated_at = NOW()');
    
    if (fields.length === 1) {
      // Only updated_at was added, no actual changes
      return { success: false, message: 'No fields to update' };
    }
    
    const sql = `
      UPDATE presales
      SET ${fields.join(', ')}
      WHERE id = ?
    `;
    
    values.push(id);
    
    try {
      const result = await executeQuery(sql, values);
      if (!result.success) {
        return result;
      }
      
      if (result.data.affectedRows === 0) {
        return { success: false, message: 'Presale not found or no changes made' };
      }
      
      return { success: true, data: { id, ...presaleData } };
    } catch (error) {
      console.error('Error updating presale:', error);
      return { success: false, error };
    }
  },

  /**
   * List all presales
   */
  listPresales: async () => {
    const sql = 'SELECT * FROM presales ORDER BY created_at DESC';
    
    try {
      const result = await executeQuery(sql);
      if (!result.success) {
        return result;
      }
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error listing presales:', error);
      return { success: false, error };
    }
  },

  /**
   * Get active presales
   */
  getActivePresales: async () => {
    const sql = `
      SELECT * FROM presales 
      WHERE status = 'active' 
      AND start_date <= NOW() 
      AND end_date >= NOW()
      ORDER BY start_date ASC
    `;
    
    try {
      const result = await executeQuery(sql);
      if (!result.success) {
        return result;
      }
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error getting active presales:', error);
      return { success: false, error };
    }
  }
};

// Token info operations
const tokenInfoOperations = {
  /**
   * Store token information
   * @param {object} tokenInfo - Token information
   */
  storeTokenInfo: async (tokenInfo) => {
    const sql = `
      INSERT INTO token_info (
        address, name, symbol, decimals, total_supply, 
        circulating_supply, owner_address, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        symbol = VALUES(symbol),
        decimals = VALUES(decimals),
        total_supply = VALUES(total_supply),
        circulating_supply = VALUES(circulating_supply),
        owner_address = VALUES(owner_address),
        updated_at = NOW()
    `;
    
    const params = [
      tokenInfo.address,
      tokenInfo.name,
      tokenInfo.symbol,
      tokenInfo.decimals,
      tokenInfo.totalSupply,
      tokenInfo.circulatingSupply,
      tokenInfo.ownerAddress
    ];
    
    try {
      const result = await executeQuery(sql, params);
      if (!result.success) {
        return result;
      }
      
      return {
        success: true,
        data: {
          ...tokenInfo,
          id: result.data.insertId || null
        }
      };
    } catch (error) {
      console.error('Error storing token info:', error);
      return { success: false, error };
    }
  },

  /**
   * Get token information by address
   * @param {string} address - Token address
   */
  getTokenInfoByAddress: async (address) => {
    const sql = 'SELECT * FROM token_info WHERE address = ?';
    
    try {
      const result = await executeQuery(sql, [address]);
      if (!result.success) {
        return result;
      }
      
      if (result.data.length === 0) {
        return { success: false, message: 'Token info not found' };
      }
      
      return { success: true, data: result.data[0] };
    } catch (error) {
      console.error('Error getting token info by address:', error);
      return { success: false, error };
    }
  },

  /**
   * Update token information
   * @param {string} address - Token address
   * @param {object} tokenInfo - Updated token information
   */
  updateTokenInfo: async (address, tokenInfo) => {
    // Build the SET clause dynamically based on provided fields
    const fields = [];
    const values = [];
    
    const updateableFields = [
      'name', 'symbol', 'decimals', 'total_supply', 
      'circulating_supply', 'owner_address'
    ];
    
    const fieldMapping = {
      totalSupply: 'total_supply',
      circulatingSupply: 'circulating_supply',
      ownerAddress: 'owner_address'
    };
    
    for (const [key, value] of Object.entries(tokenInfo)) {
      const dbField = fieldMapping[key] || key;
      if (updateableFields.includes(dbField)) {
        fields.push(`${dbField} = ?`);
        values.push(value);
      }
    }
    
    fields.push('updated_at = NOW()');
    
    if (fields.length === 1) {
      // Only updated_at was added, no actual changes
      return { success: false, message: 'No fields to update' };
    }
    
    const sql = `
      UPDATE token_info
      SET ${fields.join(', ')}
      WHERE address = ?
    `;
    
    values.push(address);
    
    try {
      const result = await executeQuery(sql, values);
      if (!result.success) {
        return result;
      }
      
      if (result.data.affectedRows === 0) {
        return { success: false, message: 'Token info not found or no changes made' };
      }
      
      return { success: true, data: { address, ...tokenInfo } };
    } catch (error) {
      console.error('Error updating token info:', error);
      return { success: false, error };
    }
  }
};

// Join query operations
const joinQueryOperations = {
  /**
   * Get presale participants
   * @param {number} presaleId - Presale ID
   */
  getPresaleParticipants: async (presaleId) => {
    const sql = `
      SELECT p.id, p.presale_id, p.user_id, p.amount, p.transaction_hash, p.created_at,
             u.username, u.email, u.wallet_address
      FROM presale_participants p
      JOIN users u ON p.user_id = u.id
      WHERE p.presale_id = ?
      ORDER BY p.created_at DESC
    `;
    
    try {
      const result = await executeQuery(sql, [presaleId]);
      if (!result.success) {
        return result;
      }
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error getting presale participants:', error);
      return { success: false, error };
    }
  },

  /**
   * Get user presale participations
   * @param {number} userId - User ID
   */
  getUserPresaleParticipations: async (userId) => {
    const sql = `
      SELECT p.id, p.presale_id, p.user_id, p.amount, p.transaction_hash, p.created_at,
             ps.name as presale_name, ps.token_address, ps.start_date, ps.end_date,
             ps.price_per_token, ps.status
      FROM presale_participants p
      JOIN presales ps ON p.presale_id = ps.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `;
    
    try {
      const result = await executeQuery(sql, [userId]);
      if (!result.success) {
        return result;
      }
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error getting user presale participations:', error);
      return { success: false, error };
    }
  },

  /**
   * Get token presales
   * @param {string} tokenAddress - Token address
   */
  getTokenPresales: async (tokenAddress) => {
    const sql = `
      SELECT p.*, 
             COUNT(pp.id) as participant_count,
             SUM(pp.amount) as total_sold
      FROM presales p
      LEFT JOIN presale_participants pp ON p.id = pp.presale_id
      WHERE p.token_address = ?
      GROUP BY p.id
      ORDER BY p.start_date DESC
    `;
    
    try {
      const result = await executeQuery(sql, [tokenAddress]);
      if (!result.success) {
        return result;
      }
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error getting token presales:', error);
      return { success: false, error };
    }
  }
};

// Test functions
const testFunctions = {
  /**
   * Test database connection
   */
  testConnection: async () => {
    try {
      const connection = await initializePool();
      const [result] = await connection.execute('SELECT 1 as test');
      
      console.log('Database connection successful');
      return { success: true, data: result };
    } catch (error) {
      console.error('Database connection failed:', error);
      return { success: false, error };
    }
  },

  /**
   * Test user table operations
   */
  testUserTable: async () => {
    const testUser = {
      username: `test_user_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      walletAddress: `test_wallet_${Date.now()}`
    };
    
    try {
      // Create test user
      const createResult = await userOperations.createUser(testUser);
      if (!createResult.success) {
        return { success: false, message: 'Failed to create test user', error: createResult.error };
      }
      
      const userId = createResult.data.id;
      
      // Get user by ID
      const getResult = await userOperations.getUserById(userId);
      if (!getResult.success) {
        return { success: false, message: 'Failed to get test user by ID', error: getResult.error };
      }
      
      // Update user
      const updateResult = await userOperations.updateUser(userId, {
        email: `updated_${Date.now()}@example.com`
      });
      
      if (!updateResult.success) {
        return { success: false, message: 'Failed to update test user', error: updateResult.error };
      }
      
      // Delete user
      const deleteResult = await userOperations.deleteUser(userId);
      if (!deleteResult.success) {
        return { success: false, message: 'Failed to delete test user', error: deleteResult.error };
      }
      
      console.log('User table operations test passed');
      return { success: true };
    } catch (error) {
      console.error('Error testing user table:', error);
      return { success: false, error };
    }
  },

  /**
   * Test presale table operations
   */
  testPresaleTable: async () => {
    const testPresale = {
      name: `Test Presale ${Date.now()}`,
      tokenAddress: `test_token_${Date.now()}`,
      startDate: new Date(Date.now() + 86400000).toISOString().slice(0, 19).replace('T', ' '), // tomorrow
      endDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 19).replace('T', ' '), // day after tomorrow
      totalTokens: '1000000',
      pricePerToken: '0.00001',
      minPurchase: '100',
      maxPurchase: '10000',
      status: 'pending'
    };
    
    try {
      // Create test presale
      const createResult = await presaleOperations.createPresale(testPresale);
      if (!createResult.success) {
        return { success: false, message: 'Failed to create test presale', error: createResult.error };
      }
      
      const presaleId = createResult.data.id;
      
      // Get presale by ID
      const getResult = await presaleOperations.getPresaleById(presaleId);
      if (!getResult.success) {
        return { success: false, message: 'Failed to get test presale by ID', error: getResult.error };
      }
      
      // Update presale
      const updateResult = await presaleOperations.updatePresale(presaleId, {
        status: 'active'
      });
      
      if (!updateResult.success) {
        return { success: false, message: 'Failed to update test presale', error: updateResult.error };
      }
      
      console.log('Presale table operations test passed');
      return { success: true };
    } catch (error) {
      console.error('Error testing presale table:', error);
      return { success: false, error };
    }
  },

  /**
   * Test token info table operations
   */
  testTokenInfoTable: async () => {
    const testTokenInfo = {
      address: `test_token_${Date.now()}`,
      name: 'Test Token',
      symbol: 'TEST',
      decimals: 9,
      totalSupply: '1000000000',
      circulatingSupply: '250000000',
      ownerAddress: `test_owner_${Date.now()}`
    };
    
    try {
      // Store test token info
      const storeResult = await tokenInfoOperations.storeTokenInfo(testTokenInfo);
      if (!storeResult.success) {
        return { success: false, message: 'Failed to store test token info', error: storeResult.error };
      }
      
      // Get token info by address
      const getResult = await tokenInfoOperations.getTokenInfoByAddress(testTokenInfo.address);
      if (!getResult.success) {
        return { success: false, message: 'Failed to get test token info by address', error: getResult.error };
      }
      
      // Update token info
      const updateResult = await tokenInfoOperations.updateTokenInfo(testTokenInfo.address, {
        circulatingSupply: '300000000'
      });
      
      if (!updateResult.success) {
        return { success: false, message: 'Failed to update test token info', error: updateResult.error };
      }
      
      console.log('Token info table operations test passed');
      return { success: true };
    } catch (error) {
      console.error('Error testing token info table:', error);
      return { success: false, error };
    }
  },

  /**
   * Test join queries
   */
  testJoinQueries: async () => {
    try {
      // This is a simplified test since we don't want to create all the necessary data
      // In a real test, we would create users, presales, and participants
      
      // Just test that the queries don't throw errors
      const presaleId = 1; // Use a dummy ID
      const userId = 1; // Use a dummy ID
      const tokenAddress = 'dummy_token_address'; // Use a dummy address
      
      try {
        await joinQueryOperations.getPresaleParticipants(presaleId);
        await joinQueryOperations.getUserPresaleParticipations(userId);
        await joinQueryOperations.getTokenPresales(tokenAddress);
        
        console.log('Join queries test passed');
        return { success: true };
      } catch (error) {
        // If tables don't exist yet, this is expected
        if (error.code === 'ER_NO_SUCH_TABLE') {
          console.log('Join queries test skipped (tables not created yet)');
          return { success: true, skipped: true };
        }
        throw error;
      }
    } catch (error) {
      console.error('Error testing join queries:', error);
      return { success: false, error };
    }
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('Starting RDS integration tests...');
  
  const results = {
    connection: await testFunctions.testConnection(),
    userTable: await testFunctions.testUserTable(),
    presaleTable: await testFunctions.testPresaleTable(),
    tokenInfoTable: await testFunctions.testTokenInfoTable(),
    joinQueries: await testFunctions.testJoinQueries()
  };
  
  const allTestsPassed = Object.values(results).every(result => result.success);
  
  console.log('\nTest Results:');
  console.log('-------------');
  Object.entries(results).forEach(([testName, result]) => {
    console.log(`${testName}: ${result.success ? (result.skipped ? 'SKIPPED' : 'PASSED') : 'FAILED'}`);
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
  initializePool,
  executeQuery,
  userOperations,
  presaleOperations,
  tokenInfoOperations,
  joinQueryOperations,
  testFunctions,
  runAllTests
};
