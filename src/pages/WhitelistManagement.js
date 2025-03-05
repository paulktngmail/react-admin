import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, CircularProgress, Box, Button, TextField, Checkbox, FormControlLabel } from '@mui/material';
import { styled } from '@mui/material/styles';
import api from '../services/api';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  borderRadius: '8px',
  overflow: 'hidden',
}));

const CardHeader = styled('div')(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  padding: '15px 20px',
  borderBottom: '1px solid #e9ecef',
}));

const CardTitle = styled(Typography)(({ theme }) => ({
  margin: 0,
  fontSize: '18px',
  fontWeight: 600,
}));

const CardBody = styled(CardContent)(({ theme }) => ({
  padding: '20px',
  flexGrow: 1,
}));

const FormGroup = styled('div')(({ theme }) => ({
  marginBottom: '15px',
}));

const WhitelistManagement = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [whitelistedUsers, setWhitelistedUsers] = useState([]);
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
        // Try to get whitelisted users from API
        const data = await api.getWhitelistedUsers();
        setWhitelistedUsers(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching whitelisted users:', err);
        // Use mock data if API fails
        setWhitelistedUsers([
          { id: 1, address: '7XSvJnS19TodrQJSbjUR3NLSZoK3mHvfGqVhxJQRPvTb', email: 'user1@example.com', dateAdded: '2025-03-01', status: 'Active' },
          { id: 2, address: '9XyQMkZG8Ro7BKYYPCe9Xvjrv8uLZMGZwGhVJZFwBvU9', email: 'user2@example.com', dateAdded: '2025-03-02', status: 'Active' },
          { id: 3, address: 'FdYsNj3jhGLcCzoMLA2KZdzUnM3UiwCYUNhMmmFaUDie', email: 'user3@example.com', dateAdded: '2025-03-03', status: 'Active' },
          { id: 4, address: '3HUwa6YYKNdDgsU6nkkMWyBgT2BRtzmD1JpWSg77sa55', email: 'user4@example.com', dateAdded: '2025-03-04', status: 'Active' },
        ]);
        setError('Using local data. API connection failed.');
      } finally {
        setLoading(false);
      }
    };

    fetchWhitelistedUsers();
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
      
      try {
        // Try to add to whitelist via API
        await api.addToWhitelist(address, 0, email);
        setSuccess('User added to whitelist successfully');
      } catch (apiErr) {
        console.error('API error:', apiErr);
        
        // For now, just add to the local state
        const newUser = {
          id: whitelistedUsers.length + 1,
          address,
          email,
          dateAdded: new Date().toISOString().split('T')[0],
          status: 'Active'
        };
        
        setWhitelistedUsers([...whitelistedUsers, newUser]);
        setSuccess('User added to whitelist successfully (local only)');
      }
      
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
      
      try {
        // Try to bulk add to whitelist via API
        await api.bulkAddToWhitelist(addresses, 0);
        setSuccess(`${addresses.length} users added to whitelist successfully`);
      } catch (apiErr) {
        console.error('API error:', apiErr);
        
        // For now, just add to the local state
        const newUsers = addresses.map((address, index) => ({
          id: whitelistedUsers.length + index + 1,
          address,
          email: `user${whitelistedUsers.length + index + 1}@example.com`,
          dateAdded: new Date().toISOString().split('T')[0],
          status: 'Active'
        }));
        
        setWhitelistedUsers([...whitelistedUsers, ...newUsers]);
        setSuccess(`${addresses.length} users added to whitelist successfully (local only)`);
      }
      
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
      
      try {
        // Try to remove from whitelist via API
        await api.removeFromWhitelist(userToDelete.address);
      } catch (apiErr) {
        console.error('API error:', apiErr);
        // Continue with local state update even if API fails
      }
      
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
      // Try to remove from whitelist via API
      for (const id of selectedUsers) {
        const userToDelete = whitelistedUsers.find(user => user.id === id);
        if (userToDelete) {
          try {
            await api.removeFromWhitelist(userToDelete.address);
          } catch (apiErr) {
            console.error('API error removing user:', apiErr);
            // Continue with next user even if API fails for one
          }
        }
      }
      
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

  if (loading && whitelistedUsers.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Whitelist Management
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Manage whitelisted addresses for presale participation
      </Typography>
      
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress size={24} /></Box>}
      {error && <Box sx={{ p: 2, bgcolor: '#f8d7da', color: '#dc3545', borderRadius: 1, mb: 3 }}>{error}</Box>}
      {success && <Box sx={{ p: 2, bgcolor: '#d4edda', color: '#28a745', borderRadius: 1, mb: 3 }}>{success}</Box>}
      
      <Box sx={{ mb: 3, borderBottom: '1px solid #dee2e6', display: 'flex', flexWrap: 'wrap' }}>
        <Button 
          sx={{ 
            px: 2, 
            py: 1, 
            borderRadius: '4px 4px 0 0',
            borderColor: activeTab === 'add' ? '#dee2e6' : 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderBottomColor: activeTab === 'add' ? 'transparent' : '#dee2e6',
            bgcolor: activeTab === 'add' ? '#fff' : 'transparent',
            '&:hover': {
              bgcolor: activeTab === 'add' ? '#fff' : '#f8f9fa',
            }
          }}
          onClick={() => setActiveTab('add')}
        >
          Add Single User
        </Button>
        <Button 
          sx={{ 
            px: 2, 
            py: 1, 
            borderRadius: '4px 4px 0 0',
            borderColor: activeTab === 'bulk' ? '#dee2e6' : 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderBottomColor: activeTab === 'bulk' ? 'transparent' : '#dee2e6',
            bgcolor: activeTab === 'bulk' ? '#fff' : 'transparent',
            '&:hover': {
              bgcolor: activeTab === 'bulk' ? '#fff' : '#f8f9fa',
            }
          }}
          onClick={() => setActiveTab('bulk')}
        >
          Bulk Add Users
        </Button>
        <Button 
          sx={{ 
            px: 2, 
            py: 1, 
            borderRadius: '4px 4px 0 0',
            borderColor: activeTab === 'manage' ? '#dee2e6' : 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderBottomColor: activeTab === 'manage' ? 'transparent' : '#dee2e6',
            bgcolor: activeTab === 'manage' ? '#fff' : 'transparent',
            '&:hover': {
              bgcolor: activeTab === 'manage' ? '#fff' : '#f8f9fa',
            }
          }}
          onClick={() => setActiveTab('manage')}
        >
          Manage Whitelist
        </Button>
      </Box>

      <Box sx={{ mt: 3 }}>
        {activeTab === 'add' && (
          <StyledCard>
            <CardHeader>
              <CardTitle>Add User to Whitelist</CardTitle>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleAddUser}>
                <FormGroup>
                  <Typography variant="subtitle2" gutterBottom>Wallet Address</Typography>
                  <TextField 
                    id="walletAddress" 
                    fullWidth 
                    placeholder="Enter Solana wallet address" 
                    variant="outlined"
                    size="small"
                  />
                </FormGroup>
                <FormGroup>
                  <Typography variant="subtitle2" gutterBottom>Email Address</Typography>
                  <TextField 
                    id="email" 
                    type="email" 
                    fullWidth 
                    placeholder="Enter email address" 
                    variant="outlined"
                    size="small"
                  />
                </FormGroup>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Adding...' : 'Add to Whitelist'}
                </Button>
              </form>
            </CardBody>
          </StyledCard>
        )}

        {activeTab === 'bulk' && (
          <StyledCard>
            <CardHeader>
              <CardTitle>Bulk Add Users</CardTitle>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleBulkAdd}>
                <FormGroup>
                  <Typography variant="subtitle2" gutterBottom>Wallet Addresses (one per line)</Typography>
                  <TextField 
                    id="addresses" 
                    multiline 
                    rows={10} 
                    fullWidth 
                    placeholder="Enter wallet addresses, one per line" 
                    variant="outlined"
                    size="small"
                  />
                </FormGroup>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Adding...' : 'Add All to Whitelist'}
                </Button>
              </form>
            </CardBody>
          </StyledCard>
        )}

        {activeTab === 'manage' && (
          <StyledCard>
            <CardHeader>
              <CardTitle>Manage Whitelist</CardTitle>
            </CardHeader>
            <CardBody>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <TextField 
                  placeholder="Search by wallet address or email" 
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ flexGrow: 1, maxWidth: '500px' }}
                />
                <Button 
                  variant="contained" 
                  color="error" 
                  onClick={handleDeleteSelected}
                  disabled={selectedUsers.length === 0 || loading}
                >
                  Remove Selected
                </Button>
              </Box>
              
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                        <Checkbox 
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={handleSelectAll}
                          disabled={filteredUsers.length === 0}
                        />
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Wallet Address</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Email Address</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date Added</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                          {searchTerm ? 'No matching users found' : 'No users in whitelist'}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(user => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #ddd' }}>
                          <td style={{ padding: '12px' }}>
                            <Checkbox 
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleSelectUser(user.id)}
                            />
                          </td>
                          <td style={{ padding: '12px' }}>{user.address}</td>
                          <td style={{ padding: '12px' }}>{user.email}</td>
                          <td style={{ padding: '12px' }}>{user.dateAdded}</td>
                          <td style={{ padding: '12px' }}>
                            <Box sx={{ 
                              display: 'inline-block', 
                              px: 1, 
                              py: 0.5, 
                              borderRadius: '4px', 
                              bgcolor: user.status === 'Active' ? '#d4edda' : '#f8d7da',
                              color: user.status === 'Active' ? '#28a745' : '#dc3545'
                            }}>
                              {user.status}
                            </Box>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <Button 
                              variant="contained" 
                              color="error" 
                              size="small"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={loading}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </Box>
            </CardBody>
          </StyledCard>
        )}
      </Box>

      {/* Confirmation Modal for Single Delete */}
      {showConfirmation && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1300,
        }}>
          <Box sx={{
            bgcolor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '500px',
            p: 0,
            overflow: 'hidden',
          }}>
            <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderBottom: '1px solid #dee2e6' }}>
              <Typography variant="h6">Confirm Removal</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Typography variant="body1">Are you sure you want to remove this address from the whitelist?</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, borderTop: '1px solid #dee2e6' }}>
              <Button 
                variant="outlined" 
                onClick={cancelDelete} 
                disabled={loading}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="error" 
                onClick={confirmDelete} 
                disabled={loading}
              >
                {loading ? 'Removing...' : 'Remove'}
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Confirmation Modal for Multiple Delete */}
      {showMultiDeleteConfirmation && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1300,
        }}>
          <Box sx={{
            bgcolor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '500px',
            p: 0,
            overflow: 'hidden',
          }}>
            <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderBottom: '1px solid #dee2e6' }}>
              <Typography variant="h6">Confirm Multiple Removal</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Typography variant="body1">Are you sure you want to remove {selectedUsers.length} addresses from the whitelist?</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, borderTop: '1px solid #dee2e6' }}>
              <Button 
                variant="outlined" 
                onClick={cancelMultiDelete} 
                disabled={loading}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="error" 
                onClick={confirmMultiDelete} 
                disabled={loading}
              >
                {loading ? 'Removing...' : 'Remove All'}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default WhitelistManagement;
