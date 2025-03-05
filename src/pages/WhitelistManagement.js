import React, { useState, useEffect } from 'react';
import { getWhitelistedUsers, addToWhitelist, bulkAddToWhitelist, removeFromWhitelist } from '../services/api';

const WhitelistManagement = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [whitelistedUsers, setWhitelistedUsers] = useState([
    { id: 1, address: '7XSvJnS19TodrQJSbjUR3NLSZoK3mHvfGqVhxJQRPvTb', email: 'user1@example.com', dateAdded: '2025-03-01', status: 'Active' },
    { id: 2, address: '9XyQMkZG8Ro7BKYYPCe9Xvjrv8uLZMGZwGhVJZFwBvU9', email: 'user2@example.com', dateAdded: '2025-03-02', status: 'Active' },
    { id: 3, address: 'Gk5g7jH6Rt5yLp3s2gT7Hj7k9dF2Rt6y1hJ9', email: 'user3@example.com', dateAdded: '2025-03-03', status: 'Active' },
    { id: 4, address: 'Lp3s2gT7Hj7k9dF2Rt6y1hJ9Gk5g7jH6', email: 'user4@example.com', dateAdded: '2025-03-04', status: 'Active' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showMultiDeleteConfirmation, setShowMultiDeleteConfirmation] = useState(false);

  // Fetch whitelisted users from the API
  useEffect(() => {
    const fetchWhitelistedUsers = async () => {
      setLoading(true);
      try {
        // Uncomment this when the API is ready
        // const data = await getWhitelistedUsers();
        // setWhitelistedUsers(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching whitelisted users:', err);
        setError('Failed to load whitelisted users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Uncomment this when the API is ready
    // fetchWhitelistedUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(whitelistedUsers);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = whitelistedUsers.filter(user => 
        user.address.toLowerCase().includes(lowercasedSearch) || 
        user.email.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, whitelistedUsers]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const address = e.target.walletAddress.value;
      const email = e.target.email.value;
      
      if (!address) {
        throw new Error('Wallet address is required');
      }
      
      // Uncomment this when the API is ready
      // await addToWhitelist(address);
      
      // For now, just add to the local state
      const newUser = {
        id: whitelistedUsers.length + 1,
        address,
        email,
        dateAdded: new Date().toISOString().split('T')[0],
        status: 'Active'
      };
      
      setWhitelistedUsers([...whitelistedUsers, newUser]);
      setSuccess('User added to whitelist successfully');
      e.target.reset();
    } catch (err) {
      console.error('Error adding user to whitelist:', err);
      setError(err.message || 'Failed to add user to whitelist');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const addressesText = e.target.addresses.value;
      
      if (!addressesText) {
        throw new Error('Wallet addresses are required');
      }
      
      const addresses = addressesText.split('\n').filter(address => address.trim() !== '');
      
      if (addresses.length === 0) {
        throw new Error('No valid wallet addresses found');
      }
      
      // Uncomment this when the API is ready
      // await bulkAddToWhitelist(addresses);
      
      // For now, just add to the local state
      const newUsers = addresses.map((address, index) => ({
        id: whitelistedUsers.length + index + 1,
        address,
        email: `user${whitelistedUsers.length + index + 1}@example.com`,
        dateAdded: new Date().toISOString().split('T')[0],
        status: 'Active'
      }));
      
      setWhitelistedUsers([...whitelistedUsers, ...newUsers]);
      setSuccess(`${addresses.length} users added to whitelist successfully`);
      e.target.reset();
    } catch (err) {
      console.error('Error bulk adding users to whitelist:', err);
      setError(err.message || 'Failed to bulk add users to whitelist');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (id) => {
    setAddressToDelete(id);
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const userToDelete = whitelistedUsers.find(user => user.id === addressToDelete);
      
      if (!userToDelete) {
        throw new Error('User not found');
      }
      
      // Uncomment this when the API is ready
      // await removeFromWhitelist(userToDelete.address);
      
      setWhitelistedUsers(whitelistedUsers.filter(user => user.id !== addressToDelete));
      setSuccess('User removed from whitelist successfully');
    } catch (err) {
      console.error('Error removing user from whitelist:', err);
      setError(err.message || 'Failed to remove user from whitelist');
    } finally {
      setShowConfirmation(false);
      setAddressToDelete(null);
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setAddressToDelete(null);
  };

  const handleSelectUser = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(userId => userId !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedUsers.length === 0) {
      setError('No users selected');
      return;
    }
    
    setShowMultiDeleteConfirmation(true);
  };

  const confirmMultiDelete = async () => {
    setLoading(true);
    try {
      // Uncomment this when the API is ready
      // for (const id of selectedUsers) {
      //   const userToDelete = whitelistedUsers.find(user => user.id === id);
      //   await removeFromWhitelist(userToDelete.address);
      // }
      
      setWhitelistedUsers(whitelistedUsers.filter(user => !selectedUsers.includes(user.id)));
      setSuccess(`${selectedUsers.length} users removed from whitelist successfully`);
      setSelectedUsers([]);
    } catch (err) {
      console.error('Error removing users from whitelist:', err);
      setError(err.message || 'Failed to remove users from whitelist');
    } finally {
      setShowMultiDeleteConfirmation(false);
      setLoading(false);
    }
  };

  const cancelMultiDelete = () => {
    setShowMultiDeleteConfirmation(false);
  };

  return (
    <div>
      <h2>Whitelist Management</h2>
      
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          Add Single User
        </div>
        <div 
          className={`tab ${activeTab === 'bulk' ? 'active' : ''}`}
          onClick={() => setActiveTab('bulk')}
        >
          Bulk Add Users
        </div>
        <div 
          className={`tab ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          Manage Whitelist
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'add' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Add User to Whitelist</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleAddUser}>
                <div className="form-group">
                  <label htmlFor="walletAddress">Wallet Address</label>
                  <input type="text" id="walletAddress" className="form-control" placeholder="Enter Solana wallet address" />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input type="email" id="email" className="form-control" placeholder="Enter email address" />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Adding...' : 'Add to Whitelist'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'bulk' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Bulk Add Users</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleBulkAdd}>
                <div className="form-group">
                  <label htmlFor="addresses">Wallet Addresses (one per line)</label>
                  <textarea 
                    id="addresses" 
                    className="form-control" 
                    rows="10"
                    placeholder="Enter wallet addresses, one per line"
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Adding...' : 'Add All to Whitelist'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Manage Whitelist</h3>
            </div>
            <div className="card-body">
              <div className="search-and-actions">
                <div className="search-container">
                  <input 
                    type="text" 
                    className="form-control search-input" 
                    placeholder="Search by wallet address or email" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="actions-container">
                  <button 
                    className="btn btn-danger"
                    onClick={handleDeleteSelected}
                    disabled={selectedUsers.length === 0 || loading}
                  >
                    Remove Selected
                  </button>
                </div>
              </div>
              
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>
                        <input 
                          type="checkbox" 
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th>Wallet Address</th>
                      <th>Email Address</th>
                      <th>Date Added</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center">
                          {searchTerm ? 'No matching users found' : 'No users in whitelist'}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(user => (
                        <tr key={user.id}>
                          <td>
                            <input 
                              type="checkbox" 
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleSelectUser(user.id)}
                            />
                          </td>
                          <td>{user.address}</td>
                          <td>{user.email}</td>
                          <td>{user.dateAdded}</td>
                          <td>{user.status}</td>
                          <td>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={loading}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {showConfirmation && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h4>Confirm Removal</h4>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to remove this address from the whitelist?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={cancelDelete} disabled={loading}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete} disabled={loading}>
                {loading ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showMultiDeleteConfirmation && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h4>Confirm Multiple Removal</h4>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to remove {selectedUsers.length} addresses from the whitelist?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={cancelMultiDelete} disabled={loading}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmMultiDelete} disabled={loading}>
                {loading ? 'Removing...' : 'Remove All'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .search-and-actions {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        .search-container {
          flex: 1;
          max-width: 400px;
        }
        
        .search-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
        }
        
        .table-container {
          overflow-x: auto;
        }
        
        .text-center {
          text-align: center;
        }
        
        .loading {
          text-align: center;
          padding: 10px;
          font-weight: 500;
          color: #007bff;
        }
        
        .error {
          text-align: center;
          padding: 10px;
          font-weight: 500;
          color: #dc3545;
          background-color: #f8d7da;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .success {
          text-align: center;
          padding: 10px;
          font-weight: 500;
          color: #28a745;
          background-color: #d4edda;
          border-radius: 4px;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
};

export default WhitelistManagement;
