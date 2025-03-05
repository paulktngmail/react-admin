/**
 * RDS Integration for DPNET-10 Admin Dashboard
 * 
 * This script provides functions for interacting with Amazon RDS (MySQL) to store
 * relational data such as users, presale events, and token information.
 */

const mysql = require('mysql2/promise');

// Configuration
const dbConfig = {
  host: process.env.RDS_HOST,
  port: process.env.RDS_PORT || 3306,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DATABASE || 'dpnet10',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
let pool;

// Initialize database connection
const initializeDatabase = async () => {
  try {
    if (!pool) {
      pool = mysql.createPool(dbConfig);
    }
    return pool;
  } catch (error) {
    console.error('Error initializing database connection:', error);
    throw error;
  }
};

// Test database connection
const testConnection = async () => {
  try {
    const connection = await initializeDatabase();
    const [rows] = await connection.query('SELECT 1 as connection_test');
    return { connected: rows[0].connection_test === 1 };
  } catch (error) {
    console.error('Error connecting to RDS:', error);
    return { connected: false, error: error.message };
  }
};

// User functions
const createUser = async (userData) => {
  try {
    const connection = await initializeDatabase();
    const query = `
      INSERT INTO users (
        username, 
        email, 
        password_hash, 
        role, 
        wallet_address, 
        created_at
      ) VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    const [result] = await connection.execute(query, [
      userData.username,
      userData.email,
      userData.passwordHash,
      userData.role || 'user',
      userData.walletAddress
    ]);
    
    return {
      id: result.insertId,
      ...userData,
      created_at: new Date()
    };
  } catch (error) {
    console.error('Error creating user in RDS:', error);
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const connection = await initializeDatabase();
    const query = `
      SELECT 
        id, 
        username, 
        email, 
        role, 
        wallet_address as walletAddress, 
        created_at as createdAt, 
        last_login as lastLogin
      FROM users 
      WHERE id = ?
    `;
    
    const [rows] = await connection.execute(query, [userId]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0];
  } catch (error) {
    console.error('Error getting user from RDS:', error);
    throw error;
  }
};

const getUserByEmail = async (email) => {
  try {
    const connection = await initializeDatabase();
    const query = `
      SELECT 
        id, 
        username, 
        email, 
        password_hash as passwordHash, 
        role, 
        wallet_address as walletAddress, 
        created_at as createdAt, 
        last_login as lastLogin
      FROM users 
      WHERE email = ?
    `;
    
    const [rows] = await connection.execute(query, [email]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0];
  } catch (error) {
    console.error('Error getting user by email from RDS:', error);
    throw error;
  }
};

const updateUser = async (userId, userData) => {
  try {
    const connection = await initializeDatabase();
    
    // Build SET clause and values array
    const setClause = [];
    const values = [];
    
    if (userData.username) {
      setClause.push('username = ?');
      values.push(userData.username);
    }
    
    if (userData.email) {
      setClause.push('email = ?');
      values.push(userData.email);
    }
    
    if (userData.passwordHash) {
      setClause.push('password_hash = ?');
      values.push(userData.passwordHash);
    }
    
    if (userData.role) {
      setClause.push('role = ?');
      values.push(userData.role);
    }
    
    if (userData.walletAddress) {
      setClause.push('wallet_address = ?');
      values.push(userData.walletAddress);
    }
    
    if (userData.lastLogin) {
      setClause.push('last_login = ?');
      values.push(userData.lastLogin);
    }
    
    // Add userId to values array
    values.push(userId);
    
    const query = `
      UPDATE users 
      SET ${setClause.join(', ')} 
      WHERE id = ?
    `;
    
    const [result] = await connection.execute(query, values);
    
    if (result.affectedRows === 0) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return await getUserById(userId);
  } catch (error) {
    console.error('Error updating user in RDS:', error);
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    const connection = await initializeDatabase();
    const query = 'DELETE FROM users WHERE id = ?';
    
    const [result] = await connection.execute(query, [userId]);
    
    if (result.affectedRows === 0) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return { id: userId, deleted: true };
  } catch (error) {
    console.error('Error deleting user from RDS:', error);
    throw error;
  }
};

const listUsers = async (limit = 100, offset = 0) => {
  try {
    const connection = await initializeDatabase();
    const query = `
      SELECT 
        id, 
        username, 
        email, 
        role, 
        wallet_address as walletAddress, 
        created_at as createdAt, 
        last_login as lastLogin
      FROM users 
      ORDER BY id 
      LIMIT ? OFFSET ?
    `;
    
    const [rows] = await connection.execute(query, [limit, offset]);
    
    return rows;
  } catch (error) {
    console.error('Error listing users from RDS:', error);
    throw error;
  }
};

// Presale functions
const createPresale = async (presaleData) => {
  try {
    const connection = await initializeDatabase();
    const query = `
      INSERT INTO presales (
        name,
        token_address,
        start_date,
        end_date,
        total_tokens,
        tokens_sold,
        token_price,
        min_purchase,
        max_purchase,
        status,
        created_by,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const [result] = await connection.execute(query, [
      presaleData.name,
      presaleData.tokenAddress,
      presaleData.startDate,
      presaleData.endDate,
      presaleData.totalTokens,
      presaleData.tokensSold || 0,
      presaleData.tokenPrice,
      presaleData.minPurchase,
      presaleData.maxPurchase,
      presaleData.status || 'pending',
      presaleData.createdBy
    ]);
    
    return {
      id: result.insertId,
      ...presaleData,
      created_at: new Date()
    };
  } catch (error) {
    console.error('Error creating presale in RDS:', error);
    throw error;
  }
};

const getPresaleById = async (presaleId) => {
  try {
    const connection = await initializeDatabase();
    const query = `
      SELECT 
        id,
        name,
        token_address as tokenAddress,
        start_date as startDate,
        end_date as endDate,
        total_tokens as totalTokens,
        tokens_sold as tokensSold,
        token_price as tokenPrice,
        min_purchase as minPurchase,
        max_purchase as maxPurchase,
        status,
        created_by as createdBy,
        created_at as createdAt,
        updated_at as updatedAt
      FROM presales 
      WHERE id = ?
    `;
    
    const [rows] = await connection.execute(query, [presaleId]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0];
  } catch (error) {
    console.error('Error getting presale from RDS:', error);
    throw error;
  }
};

const updatePresale = async (presaleId, presaleData) => {
  try {
    const connection = await initializeDatabase();
    
    // Build SET clause and values array
    const setClause = [];
    const values = [];
    
    if (presaleData.name) {
      setClause.push('name = ?');
      values.push(presaleData.name);
    }
    
    if (presaleData.tokenAddress) {
      setClause.push('token_address = ?');
      values.push(presaleData.tokenAddress);
    }
    
    if (presaleData.startDate) {
      setClause.push('start_date = ?');
      values.push(presaleData.startDate);
    }
    
    if (presaleData.endDate) {
      setClause.push('end_date = ?');
      values.push(presaleData.endDate);
    }
    
    if (presaleData.totalTokens) {
      setClause.push('total_tokens = ?');
      values.push(presaleData.totalTokens);
    }
    
    if (presaleData.tokensSold !== undefined) {
      setClause.push('tokens_sold = ?');
      values.push(presaleData.tokensSold);
    }
    
    if (presaleData.tokenPrice) {
      setClause.push('token_price = ?');
      values.push(presaleData.tokenPrice);
    }
    
    if (presaleData.minPurchase) {
      setClause.push('min_purchase = ?');
      values.push(presaleData.minPurchase);
    }
    
    if (presaleData.maxPurchase) {
      setClause.push('max_purchase = ?');
      values.push(presaleData.maxPurchase);
    }
    
    if (presaleData.status) {
      setClause.push('status = ?');
      values.push(presaleData.status);
    }
    
    // Add updated_at timestamp
    setClause.push('updated_at = NOW()');
    
    // Add presaleId to values array
    values.push(presaleId);
    
    const query = `
      UPDATE presales 
      SET ${setClause.join(', ')} 
      WHERE id = ?
    `;
    
    const [result] = await connection.execute(query, values);
    
    if (result.affectedRows === 0) {
      throw new Error(`Presale with ID ${presaleId} not found`);
    }
    
    return await getPresaleById(presaleId);
  } catch (error) {
    console.error('Error updating presale in RDS:', error);
    throw error;
  }
};

const listPresales = async (limit = 100, offset = 0) => {
  try {
    const connection = await initializeDatabase();
    const query = `
      SELECT 
        id,
        name,
        token_address as tokenAddress,
        start_date as startDate,
        end_date as endDate,
        total_tokens as totalTokens,
        tokens_sold as tokensSold,
        token_price as tokenPrice,
        min_purchase as minPurchase,
        max_purchase as maxPurchase,
        status,
        created_by as createdBy,
        created_at as createdAt,
        updated_at as updatedAt
      FROM presales 
      ORDER BY id 
      LIMIT ? OFFSET ?
    `;
    
    const [rows] = await connection.execute(query, [limit, offset]);
    
    return rows;
  } catch (error) {
    console.error('Error listing presales from RDS:', error);
    throw error;
  }
};

// Token info functions
const updateTokenInfo = async (tokenData) => {
  try {
    const connection = await initializeDatabase();
    
    // Check if token info exists
    const [existingRows] = await connection.execute(
      'SELECT id FROM token_info WHERE token_address = ?',
      [tokenData.tokenAddress]
    );
    
    if (existingRows.length === 0) {
      // Insert new token info
      const insertQuery = `
        INSERT INTO token_info (
          token_address,
          name,
          symbol,
          decimals,
          total_supply,
          circulating_supply,
          owner_address,
          mint_authority,
          freeze_authority,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      await connection.execute(insertQuery, [
        tokenData.tokenAddress,
        tokenData.name,
        tokenData.symbol,
        tokenData.decimals,
        tokenData.totalSupply,
        tokenData.circulatingSupply,
        tokenData.ownerAddress,
        tokenData.mintAuthority,
        tokenData.freezeAuthority
      ]);
    } else {
      // Update existing token info
      const updateQuery = `
        UPDATE token_info 
        SET 
          name = ?,
          symbol = ?,
          decimals = ?,
          total_supply = ?,
          circulating_supply = ?,
          owner_address = ?,
          mint_authority = ?,
          freeze_authority = ?,
          updated_at = NOW()
        WHERE token_address = ?
      `;
      
      await connection.execute(updateQuery, [
        tokenData.name,
        tokenData.symbol,
        tokenData.decimals,
        tokenData.totalSupply,
        tokenData.circulatingSupply,
        tokenData.ownerAddress,
        tokenData.mintAuthority,
        tokenData.freezeAuthority,
        tokenData.tokenAddress
      ]);
    }
    
    return await getTokenInfo(tokenData.tokenAddress);
  } catch (error) {
    console.error('Error updating token info in RDS:', error);
    throw error;
  }
};

const getTokenInfo = async (tokenAddress) => {
  try {
    const connection = await initializeDatabase();
    const query = `
      SELECT 
        id,
        token_address as tokenAddress,
        name,
        symbol,
        decimals,
        total_supply as totalSupply,
        circulating_supply as circulatingSupply,
        owner_address as ownerAddress,
        mint_authority as mintAuthority,
        freeze_authority as freezeAuthority,
        created_at as createdAt,
        updated_at as updatedAt
      FROM token_info 
      WHERE token_address = ?
    `;
    
    const [rows] = await connection.execute(query, [tokenAddress]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0];
  } catch (error) {
    console.error('Error getting token info from RDS:', error);
    throw error;
  }
};

// Join query example: Get presale with token info
const getPresaleWithTokenInfo = async (presaleId) => {
  try {
    const connection = await initializeDatabase();
    const query = `
      SELECT 
        p.id,
        p.name,
        p.token_address as tokenAddress,
        p.start_date as startDate,
        p.end_date as endDate,
        p.total_tokens as totalTokens,
        p.tokens_sold as tokensSold,
        p.token_price as tokenPrice,
        p.min_purchase as minPurchase,
        p.max_purchase as maxPurchase,
        p.status,
        p.created_by as createdBy,
        p.created_at as createdAt,
        p.updated_at as updatedAt,
        t.name as tokenName,
        t.symbol as tokenSymbol,
        t.decimals as tokenDecimals,
        t.total_supply as tokenTotalSupply,
        t.circulating_supply as tokenCirculatingSupply,
        t.owner_address as tokenOwnerAddress
      FROM presales p
      JOIN token_info t ON p.token_address = t.token_address
      WHERE p.id = ?
    `;
    
    const [rows] = await connection.execute(query, [presaleId]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0];
  } catch (error) {
    console.error('Error getting presale with token info from RDS:', error);
    throw error;
  }
};

// Database schema creation (for testing)
const createDatabaseSchema = async () => {
  try {
    const connection = await initializeDatabase();
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
        wallet_address VARCHAR(255),
        created_at DATETIME NOT NULL,
        last_login DATETIME,
        INDEX (email),
        INDEX (wallet_address)
      )
    `);
    
    // Create token_info table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS token_info (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token_address VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        symbol VARCHAR(50) NOT NULL,
        decimals INT NOT NULL,
        total_supply VARCHAR(255) NOT NULL,
        circulating_supply VARCHAR(255) NOT NULL,
        owner_address VARCHAR(255) NOT NULL,
        mint_authority VARCHAR(255),
        freeze_authority VARCHAR(255),
        created_at DATETIME NOT NULL,
        updated_at DATETIME,
        INDEX (token_address)
      )
    `);
    
    // Create presales table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS presales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        token_address VARCHAR(255) NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        total_tokens BIGINT NOT NULL,
        tokens_sold BIGINT NOT NULL DEFAULT 0,
        token_price DECIMAL(20, 10) NOT NULL,
        min_purchase BIGINT,
        max_purchase BIGINT,
        status ENUM('pending', 'active', 'paused', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
        created_by INT NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME,
        FOREIGN KEY (token_address) REFERENCES token_info(token_address),
        FOREIGN KEY (created_by) REFERENCES users(id),
        INDEX (token_address),
        INDEX (status)
      )
    `);
    
    // Create presale_participants table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS presale_participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        presale_id INT NOT NULL,
        user_id INT NOT NULL,
        wallet_address VARCHAR(255) NOT NULL,
        amount_purchased BIGINT NOT NULL,
        amount_paid DECIMAL(20, 10) NOT NULL,
        transaction_signature VARCHAR(255) NOT NULL,
        purchase_date DATETIME NOT NULL,
        FOREIGN KEY (presale_id) REFERENCES presales(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        INDEX (presale_id),
        INDEX (user_id),
        INDEX (wallet_address)
      )
    `);
    
    return { success: true, message: 'Database schema created successfully' };
  } catch (error) {
    console.error('Error creating database schema:', error);
    throw error;
  }
};

// Run tests for RDS integration
const runTests = async () => {
  const testResults = {
    success: true,
    tests: []
  };
  
  try {
    console.log('Starting RDS integration tests...');
    
    // Test 1: Connection Test
    try {
      console.log('Running RDS Connection Test...');
      const connectionResult = await testConnection();
      
      if (connectionResult.connected) {
        testResults.tests.push({
          name: 'RDS Connection Test',
          status: 'passed',
          message: 'Successfully connected to RDS'
        });
        
        console.log('RDS Connection Test passed');
      } else {
        testResults.success = false;
        testResults.tests.push({
          name: 'RDS Connection Test',
          status: 'failed',
          message: `Failed to connect to RDS: ${connectionResult.error}`
        });
        
        console.error('RDS Connection Test failed:', connectionResult.error);
        // If connection fails, don't run other tests
        return testResults;
      }
    } catch (error) {
      testResults.success = false;
      testResults.tests.push({
        name: 'RDS Connection Test',
        status: 'failed',
        message: `Error: ${error.message}`
      });
      
      console.error('RDS Connection Test failed:', error);
      // If connection fails, don't run other tests
      return testResults;
    }
    
    // Create database schema for testing
    try {
      await createDatabaseSchema();
    } catch (error) {
      console.error('Error creating database schema:', error);
      testResults.success = false;
      testResults.tests.push({
        name: 'Database Schema Creation',
        status: 'failed',
        message: `Error: ${error.message}`
      });
      
      return testResults;
    }
    
    // Test 2: User Table Test
    try {
      console.log('Running User Table Test...');
      
      // Create a test user
      const testUser = {
        username: `test-user-${Date.now()}`,
        email: `test-user-${Date.now()}@example.com`,
        passwordHash: 'hashed_password_for_testing',
        role: 'user',
        walletAddress: `test-wallet-${Date.now()}`
      };
      
      // Create user
      const createdUser = await createUser(testUser);
      
      // Get user by ID
      const retrievedUserById = await getUserById(createdUser.id);
      
      // Get user by email
      const retrievedUserByEmail = await getUserByEmail(testUser.email);
      
      // Update user
      const updatedUser = await updateUser(createdUser.id, {
        username: `updated-${testUser.username}`
      });
      
      // Delete user
      await deleteUser(createdUser.id);
      
      // Verify operations
      const createSuccess = createdUser.email === testUser.email;
      const retrieveByIdSuccess = retrievedUserById.email === testUser.email;
      const retrieveByEmailSuccess = retrievedUserByEmail.email === testUser.email;
      const updateSuccess = updatedUser.username === `updated-${testUser.username}`;
      
      if (createSuccess && retrieveByIdSuccess && retrieveByEmailSuccess && updateSuccess) {
        testResults.tests.push({
          name: 'User Table Test',
          status: 'passed',
          message: 'User table operations working correctly'
        });
        
        console.log('User Table Test passed');
      } else {
        testResults.success = false;
        testResults.tests.push({
          name: 'User Table Test',
          status: 'failed',
          message: 'User table operations failed',
          details: {
            createSuccess,
            retrieveByIdSuccess,
            retrieveByEmailSuccess,
            updateSuccess
          }
        });
        
        console.error('User Table Test failed');
      }
    } catch (error) {
      testResults.success = false;
      testResults.tests.push({
        name: 'User Table Test',
        status: 'failed',
        message: `Error: ${error.message}`
      });
      
      console.error('User Table Test failed:', error);
    }
    
    // Test 3: Token Info Table Test
    try {
      console.log('Running Token Info Table Test...');
      
      // Create test token info
      const testTokenInfo = {
        tokenAddress: `test-token-${Date.now()}`,
        name: 'DPNET-10',
        symbol: 'DPNET',
        decimals: 9,
        totalSupply: '1000000000000000000',
        circulatingSupply: '250000000000000000',
        ownerAddress: `test-owner-${Date.now()}`,
        mintAuthority: `test-mint-authority-${Date.now()}`,
        freezeAuthority: `test-freeze-authority-${Date.now()}`
      };
      
      // Update token info (creates new record)
      const updatedTokenInfo = await updateTokenInfo(testTokenInfo);
      
      // Get token info
      const retrievedTokenInfo = await getTokenInfo(testTokenInfo.tokenAddress);
      
      // Verify operations
      const updateSuccess = updatedTokenInfo.name === testTokenInfo.name &&
                           updatedTokenInfo.symbol === testTokenInfo.symbol;
      const retrieveSuccess = retrievedTokenInfo.tokenAddress === testTokenInfo.tokenAddress;
      
      if (updateSuccess && retrieveSuccess) {
        testResults.tests.push({
          name: 'Token Info Table Test',
          status: 'passed',
          message: 'Token info table operations working correctly'
        });
        
        console.log('Token Info Table Test passed');
      } else {
        testResults.success = false;
        testResults.tests.push({
          name: 'Token Info Table Test',
          status: 'failed',
          message: 'Token info table operations failed',
          details: {
            updateSuccess,
            retrieveSuccess
          }
        });
        
        console.error('Token Info Table Test failed');
      }
    } catch (error) {
      testResults.success = false;
      testResults.tests.push({
        name: 'Token Info Table Test',
        status: 'failed',
        message: `Error: ${error.message}`
      });
      
      console.error('Token Info Table Test failed:', error);
    }
    
    // Test 4: Presale Table Test
    try {
      console.log('Running Presale Table Test...');
      
      // Create a test user for foreign key constraint
      const testUser = {
        username: `presale-test-user-${Date.now()}`,
        email: `presale-test-user-${Date.now()}@example.com`,
        passwordHash: 'hashed_password_for_testing',
        role: 'admin',
        walletAddress: `presale-test-wallet-${Date.now()}`
      };
      
      const createdUser = await createUser(testUser);
      
      // Create test presale
      const testPresale = {
        name: `Test Presale ${Date.now()}`,
        tokenAddress: retrievedTokenInfo.tokenAddress, // Use token from previous test
        startDate: new Date(Date.now() + 86400000), // Tomorrow
        endDate: new Date(Date.now() + 2 * 86400000), // Day after tomorrow
        totalTokens: 1000000,
        tokenPrice: 0.00001,
        minPurchase: 100,
        maxPurchase: 10000,
        status: 'pending',
        createdBy: createdUser.id
      };
      
      // Create presale
      const createdPresale = await createPresale(testPresale);
      
      // Get presale
      const retrievedPresale = await getPresaleById(createdPresale.id);
      
      // Update presale
      const updatedPresale = await updatePresale(createdPresale.id, {
        status: 'active',
        tokensSold: 500
      });
      
      // Verify operations
      const createSuccess = createdPresale.name === testPresale.name;
      const retrieveSuccess = retrievedPresale.id === createdPresale.id;
      const updateSuccess = updatedPresale.status === 'active' && 
                           updatedPresale.tokensSold === 500;
      
      if (createSuccess && retrieveSuccess && updateSuccess) {
        testResults.tests.push({
          name: 'Presale Table Test',
          status: 'passed',
          message: 'Presale table operations working correctly'
        });
        
        console.log('Presale Table Test passed');
      } else {
        testResults.success = false;
        testResults.tests.push({
          name: 'Presale Table Test',
          status: 'failed',
          message: 'Presale table operations failed',
          details: {
            createSuccess,
            retrieveSuccess,
            updateSuccess
          }
        });
        
        console.error('Presale Table Test failed');
      }
      
      // Clean up test user
      await deleteUser(createdUser.id);
    } catch (error) {
      testResults.success = false;
      testResults.tests.push({
        name: 'Presale Table Test',
        status: 'failed',
        message: `Error: ${error.message}`
      });
      
      console.error('Presale Table Test failed:', error);
    }
    
    // Test 5: Join Query Test
    try {
      console.log('Running Join Query Test...');
      
      // Get presale with token info (using presale from previous test)
      const presaleWithTokenInfo = await getPresaleWithTokenInfo(createdPresale.id);
      
      // Verify operation
      const joinQuerySuccess = presaleWithTokenInfo !== null &&
                              presaleWithTokenInfo.id === createdPresale.id &&
                              presaleWithTokenInfo.tokenSymbol === 'DPNET';
      
      if (joinQuerySuccess) {
        testResults.tests.push({
          name: 'Join Query Test',
          status: 'passed',
          message: 'Join queries working correctly'
        });
        
        console.log('Join Query Test passed');
      } else {
        testResults.success = false;
        testResults.tests.push({
          name: 'Join Query Test',
          status: 'failed',
          message: 'Join query failed',
          details: {
            joinQuerySuccess,
            presaleWithTokenInfo
          }
        });
        
        console.error('Join Query Test failed');
      }
    } catch (error) {
      testResults.success = false;
      testResults.tests.push({
        name: 'Join Query Test',
        status: 'failed',
        message: `Error: ${error.message}`
      });
      
      console.error('Join Query Test failed:', error);
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
        path.resolve(__dirname, 'rds-test-results.json'),
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
  // Database functions
  initializeDatabase,
  testConnection,
  createDatabaseSchema,
  
  // User functions
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
  listUsers,
  
  // Presale functions
  createPresale,
  getPresaleById,
  updatePresale,
  listPresales,
  
  // Token info functions
  updateTokenInfo,
  getTokenInfo,
  
  // Join query functions
  getPresaleWithTokenInfo,
  
  // Test function
  runTests
};
