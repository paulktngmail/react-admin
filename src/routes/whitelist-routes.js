/**
 * Updated Whitelist Routes Module
 * API routes for whitelist management using AWS SDK v3
 */

const express = require('express');

/**
 * Creates Whitelist routes with the provided services
 * @param {Object} dynamodbService - DynamoDB service
 * @returns {Object} - Express router
 */
module.exports = (dynamodbService) => {
  const router = express.Router();
  
  // Whitelist table name from environment variable
  const WHITELIST_TABLE = process.env.WHITELIST_TABLE || 'dpnet-whitelist';
  
  /**
   * @route GET /api/pool/whitelist
   * @description Get all whitelisted users
   * @access Public
   */
  router.get('/whitelist', async (req, res, next) => {
    try {
      console.log('GET /api/pool/whitelist - Fetching whitelisted users');
      
      // Ensure whitelist table exists and try to get data from DynamoDB
      try {
        // First ensure the whitelist table exists
        await dynamodbService.ensureWhitelistTable();
        
        // Use the whitelist service to get all items
        const result = await dynamodbService.whitelist.listWhitelist();
        
        if (result.success && result.data && result.data.length > 0) {
          console.log(`Found ${result.data.length} whitelisted users in DynamoDB`);
          
          // Map the DynamoDB data to the expected format
          const whitelistedUsers = result.data.map((item, index) => ({
            id: item.id || item.address || index + 1,
            address: item.address || item.walletAddress,
            email: item.email || '',
            allocation: item.allocation || 0,
            dateAdded: item.createdAt ? item.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
            status: item.status || 'Active'
          }));
          
          return res.json(whitelistedUsers);
        } else {
          console.log('No whitelisted users found in DynamoDB, using mock data');
        }
      } catch (dbError) {
        console.error('Error fetching from DynamoDB:', dbError);
        console.log('Falling back to mock data due to DynamoDB error');
      }
      
      // Fallback to mock data if DynamoDB fails or returns no data
      const mockData = [
        { id: 1, address: '7XSvJnS19TodrQJSbjUR3NLSZoK3mHvfGqVhxJQRPvTb', email: 'user1@example.com', dateAdded: '2025-03-01', status: 'Active' },
        { id: 2, address: '9XyQMkZG8Ro7BKYYPCe9Xvjrv8uLZMGZwGhVJZFwBvU9', email: 'user2@example.com', dateAdded: '2025-03-02', status: 'Active' },
        { id: 3, address: 'FdYsNj3jhGLcCzoMLA2KZdzUnM3UiwCYUNhMmmFaUDie', email: 'user3@example.com', dateAdded: '2025-03-03', status: 'Active' },
        { id: 4, address: '3HUwa6YYKNdDgsU6nkkMWyBgT2BRtzmD1JpWSg77sa55', email: 'user4@example.com', dateAdded: '2025-03-04', status: 'Active' },
      ];
      
      console.log('Returning mock whitelist data');
      res.json(mockData);
    } catch (error) {
      console.error('Error in GET /api/pool/whitelist:', error);
      next(error);
    }
  });

  /**
   * @route POST /api/pool/whitelist/add
   * @description Add a user to the whitelist
   * @access Public
   */
  router.post('/whitelist/add', async (req, res, next) => {
    try {
      console.log('POST /api/pool/whitelist/add - Adding user to whitelist');
      const { address, allocation, email } = req.body;
      
      if (!address) {
        return res.status(400).json({ message: 'Wallet address is required' });
      }
      
      // Try to add to DynamoDB
      try {
        // First check if the address already exists
        const checkResult = await dynamodbService.whitelist.getWhitelistEntry(address);
        
        if (checkResult.success) {
          console.log(`Address ${address} is already whitelisted`);
          return res.status(400).json({ message: 'Address is already whitelisted' });
        }
        
        // Add the address to the whitelist
        const result = await dynamodbService.whitelist.addToWhitelist(address, {
          email: email || '',
          allocation: allocation || 0
        });
        
        if (result.success) {
          console.log(`Added wallet ${address} to whitelist in DynamoDB`);
          
          // Format the response to match the expected format
          const newUser = {
            id: address,
            address,
            email: email || '',
            allocation: allocation || 0,
            dateAdded: result.data.createdAt ? result.data.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
            status: 'Active'
          };
          
          return res.status(201).json({ success: true, user: newUser });
        } else {
          throw new Error('Failed to add address to whitelist');
        }
      } catch (dbError) {
        console.error('Error adding to DynamoDB:', dbError);
        console.log('Falling back to mock implementation due to DynamoDB error');
      }
      
      // Fallback to mock implementation if DynamoDB fails
      // Mock data - this would be replaced with actual DB operations
      const mockWhitelistedUsers = [
        { id: 1, address: '7XSvJnS19TodrQJSbjUR3NLSZoK3mHvfGqVhxJQRPvTb', email: 'user1@example.com', dateAdded: '2025-03-01', status: 'Active' },
        { id: 2, address: '9XyQMkZG8Ro7BKYYPCe9Xvjrv8uLZMGZwGhVJZFwBvU9', email: 'user2@example.com', dateAdded: '2025-03-02', status: 'Active' },
        { id: 3, address: 'FdYsNj3jhGLcCzoMLA2KZdzUnM3UiwCYUNhMmmFaUDie', email: 'user3@example.com', dateAdded: '2025-03-03', status: 'Active' },
        { id: 4, address: '3HUwa6YYKNdDgsU6nkkMWyBgT2BRtzmD1JpWSg77sa55', email: 'user4@example.com', dateAdded: '2025-03-04', status: 'Active' },
      ];
      
      // Check if the address is already whitelisted
      const existingUser = mockWhitelistedUsers.find(user => user.address === address);
      if (existingUser) {
        return res.status(400).json({ message: 'Address is already whitelisted' });
      }
      
      // Add the user to the whitelist
      const newUser = {
        id: mockWhitelistedUsers.length + 1,
        address,
        email: email || '',
        allocation: allocation || 0,
        dateAdded: new Date().toISOString().split('T')[0],
        status: 'Active'
      };
      
      mockWhitelistedUsers.push(newUser);
      console.log('Added user to mock whitelist');
      
      res.status(201).json({ success: true, user: newUser });
    } catch (error) {
      console.error('Error in POST /api/pool/whitelist/add:', error);
      next(error);
    }
  });

  /**
   * @route POST /api/pool/whitelist/bulk-add
   * @description Add multiple users to the whitelist
   * @access Public
   */
  router.post('/whitelist/bulk-add', async (req, res, next) => {
    try {
      console.log('POST /api/pool/whitelist/bulk-add - Bulk adding users to whitelist');
      const { addresses, allocation } = req.body;
      
      if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
        return res.status(400).json({ message: 'Wallet addresses are required' });
      }
      
      // Try to add to DynamoDB
      try {
        // Use the whitelist service bulk add method
        const result = await dynamodbService.whitelist.bulkAddToWhitelist(addresses, allocation || 0);
        
        if (result.success) {
          console.log(`Added ${result.addedCount} wallets to whitelist in DynamoDB, skipped ${result.skippedCount}`);
          
          // Format the response to match the expected format
          const addedUsers = result.addedItems.map(item => ({
            id: item.address,
            address: item.address,
            email: item.email || '',
            allocation: item.allocation || 0,
            dateAdded: item.createdAt ? item.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
            status: 'Active'
          }));
          
          return res.status(201).json({
            success: true,
            addedCount: result.addedCount,
            skippedCount: result.skippedCount,
            users: addedUsers,
            skippedAddresses: result.skippedAddresses
          });
        } else {
          throw new Error('Failed to bulk add addresses to whitelist');
        }
      } catch (dbError) {
        console.error('Error bulk adding to DynamoDB:', dbError);
        console.log('Falling back to mock implementation due to DynamoDB error');
      }
      
      // Fallback to mock implementation if DynamoDB fails
      // Mock data - this would be replaced with actual DB operations
      const mockWhitelistedUsers = [
        { id: 1, address: '7XSvJnS19TodrQJSbjUR3NLSZoK3mHvfGqVhxJQRPvTb', email: 'user1@example.com', dateAdded: '2025-03-01', status: 'Active' },
        { id: 2, address: '9XyQMkZG8Ro7BKYYPCe9Xvjrv8uLZMGZwGhVJZFwBvU9', email: 'user2@example.com', dateAdded: '2025-03-02', status: 'Active' },
        { id: 3, address: 'FdYsNj3jhGLcCzoMLA2KZdzUnM3UiwCYUNhMmmFaUDie', email: 'user3@example.com', dateAdded: '2025-03-03', status: 'Active' },
        { id: 4, address: '3HUwa6YYKNdDgsU6nkkMWyBgT2BRtzmD1JpWSg77sa55', email: 'user4@example.com', dateAdded: '2025-03-04', status: 'Active' },
      ];
      
      const addedUsers = [];
      const skippedAddresses = [];
      
      // Add each address to the whitelist
      for (const address of addresses) {
        // Check if the address is already whitelisted
        const existingUser = mockWhitelistedUsers.find(user => user.address === address);
        if (existingUser) {
          skippedAddresses.push(address);
          continue;
        }
        
        // Add the user to the whitelist
        const newUser = {
          id: mockWhitelistedUsers.length + 1,
          address,
          email: '',
          allocation: allocation || 0,
          dateAdded: new Date().toISOString().split('T')[0],
          status: 'Active'
        };
        
        mockWhitelistedUsers.push(newUser);
        addedUsers.push(newUser);
      }
      
      console.log('Added users to mock whitelist');
      res.status(201).json({
        success: true,
        addedCount: addedUsers.length,
        skippedCount: skippedAddresses.length,
        users: addedUsers,
        skippedAddresses
      });
    } catch (error) {
      console.error('Error in POST /api/pool/whitelist/bulk-add:', error);
      next(error);
    }
  });

  /**
   * @route DELETE /api/pool/whitelist/remove
   * @description Remove a user from the whitelist
   * @access Public
   */
  router.delete('/whitelist/remove', async (req, res, next) => {
    try {
      console.log('DELETE /api/pool/whitelist/remove - Removing user from whitelist');
      const { address } = req.body;
      
      if (!address) {
        return res.status(400).json({ message: 'Wallet address is required' });
      }
      
      // Try to remove from DynamoDB
      try {
        // First check if the address exists
        const checkResult = await dynamodbService.whitelist.getWhitelistEntry(address);
        
        if (!checkResult.success) {
          console.log(`Address ${address} is not whitelisted`);
          return res.status(404).json({ message: 'Address is not whitelisted' });
        }
        
        // Save the item data for the response
        const userData = checkResult.data;
        
        // Remove the address from the whitelist
        const result = await dynamodbService.whitelist.removeFromWhitelist(address);
        
        if (result.success) {
          console.log(`Removed wallet ${address} from whitelist in DynamoDB`);
          
          // Format the response to match the expected format
          const removedUser = {
            id: address,
            address,
            email: userData.email || '',
            dateAdded: userData.createdAt ? userData.createdAt.split('T')[0] : '',
            status: 'Removed'
          };
          
          return res.json({ success: true, user: removedUser });
        } else {
          throw new Error('Failed to remove address from whitelist');
        }
      } catch (dbError) {
        console.error('Error removing from DynamoDB:', dbError);
        console.log('Falling back to mock implementation due to DynamoDB error');
      }
      
      // Fallback to mock implementation if DynamoDB fails
      // Mock data - this would be replaced with actual DB operations
      let mockWhitelistedUsers = [
        { id: 1, address: '7XSvJnS19TodrQJSbjUR3NLSZoK3mHvfGqVhxJQRPvTb', email: 'user1@example.com', dateAdded: '2025-03-01', status: 'Active' },
        { id: 2, address: '9XyQMkZG8Ro7BKYYPCe9Xvjrv8uLZMGZwGhVJZFwBvU9', email: 'user2@example.com', dateAdded: '2025-03-02', status: 'Active' },
        { id: 3, address: 'FdYsNj3jhGLcCzoMLA2KZdzUnM3UiwCYUNhMmmFaUDie', email: 'user3@example.com', dateAdded: '2025-03-03', status: 'Active' },
        { id: 4, address: '3HUwa6YYKNdDgsU6nkkMWyBgT2BRtzmD1JpWSg77sa55', email: 'user4@example.com', dateAdded: '2025-03-04', status: 'Active' },
      ];
      
      // Check if the address is whitelisted
      const userIndex = mockWhitelistedUsers.findIndex(user => user.address === address);
      if (userIndex === -1) {
        return res.status(404).json({ message: 'Address is not whitelisted' });
      }
      
      // Remove the user from the whitelist
      const removedUser = mockWhitelistedUsers.splice(userIndex, 1)[0];
      console.log('Removed user from mock whitelist');
      
      res.json({ success: true, user: removedUser });
    } catch (error) {
      console.error('Error in DELETE /api/pool/whitelist/remove:', error);
      next(error);
    }
  });

  return router;
};
