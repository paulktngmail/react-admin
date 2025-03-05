import React, { useState } from 'react';

const WhitelistManagement = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [whitelistedUsers, setWhitelistedUsers] = useState([
    { id: 1, address: '7XSvJnS19TodrQJSbjUR3NLSZoK3mHvfGqVhxJQRPvTb', dateAdded: '2025-03-01', status: 'Active' },
    { id: 2, address: '9XyQMkZG8Ro7BKYYPCe9Xvjrv8uLZMGZwGhVJZFwBvU9', dateAdded: '2025-03-02', status: 'Active' },
    { id: 3, address: 'Gk5g7jH6Rt5yLp3s2gT7Hj7k9dF2Rt6y1hJ9', dateAdded: '2025-03-03', status: 'Active' },
    { id: 4, address: 'Lp3s2gT7Hj7k9dF2Rt6y1hJ9Gk5g7jH6', dateAdded: '2025-03-04', status: 'Active' },
  ]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const handleAddUser = (e) => {
    e.preventDefault();
    // Add user logic would go here
    alert('User added to whitelist!');
  };

  const handleBulkAdd = (e) => {
    e.preventDefault();
    // Bulk add logic would go here
    alert('Users added to whitelist!');
  };

  const handleDeleteUser = (id) => {
    setAddressToDelete(id);
    setShowConfirmation(true);
  };

  const confirmDelete = () => {
    setWhitelistedUsers(whitelistedUsers.filter(user => user.id !== addressToDelete));
    setShowConfirmation(false);
    setAddressToDelete(null);
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setAddressToDelete(null);
  };

  return (
    <div>
      <h2>Whitelist Management</h2>
      
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
                  <label htmlFor="allocation">Token Allocation</label>
                  <input type="number" id="allocation" className="form-control" placeholder="Enter token allocation" />
                </div>
                <button type="submit" className="btn btn-primary">Add to Whitelist</button>
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
                <div className="form-group">
                  <label htmlFor="bulkAllocation">Token Allocation (per wallet)</label>
                  <input type="number" id="bulkAllocation" className="form-control" placeholder="Enter token allocation" />
                </div>
                <button type="submit" className="btn btn-primary">Add All to Whitelist</button>
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
              <table className="table">
                <thead>
                  <tr>
                    <th>Wallet Address</th>
                    <th>Date Added</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {whitelistedUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.address}</td>
                      <td>{user.dateAdded}</td>
                      <td>{user.status}</td>
                      <td>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <button className="btn btn-secondary" onClick={cancelDelete}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhitelistManagement;
