import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, CircularProgress, Box, Button, TextField, Checkbox, FormControlLabel } from '@mui/material';
import { styled } from '@mui/material/styles';
import api from '../services/api';
import solanaApi from '../services/solanaApi';

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

const PresaleManagement = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [presaleParams, setPresaleParams] = useState({
    startTime: new Date().toISOString().split('T')[0],
    endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    minPurchaseAmount: 100,
    maxPurchaseAmount: 100000,
    whitelistEnabled: true,
    paused: false
  });

  // Fetch token info on component mount
  useEffect(() => {
    const fetchTokenInfo = async () => {
      setLoading(true);
      try {
        // Try to get token info from Solana blockchain
        const info = await solanaApi.getTokenInfo();
        setTokenInfo(info);
        setError(null);
      } catch (err) {
        console.error('Error fetching token info:', err);
        
        // Try to get token info from backend
        try {
          const backendInfo = await api.getTokenInfo();
          setTokenInfo(backendInfo);
          setError(null);
        } catch (backendErr) {
          console.error('Error fetching token info from backend:', backendErr);
          setError('Failed to load token information. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTokenInfo();
  }, []);

  const handleTransferTokens = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const recipient = e.target.recipient.value;
      const amount = parseFloat(e.target.amount.value);
      
      if (!recipient || !amount) {
        throw new Error('Recipient address and amount are required');
      }
      
      await api.transferTokens(recipient, amount);
      setSuccess('Tokens transferred successfully');
      e.target.reset();
    } catch (err) {
      console.error('Error transferring tokens:', err);
      setError(err.message || 'Failed to transfer tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleMintTokens = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const recipient = e.target.mintTo.value;
      const amount = parseFloat(e.target.mintAmount.value);
      
      if (!recipient || !amount) {
        throw new Error('Recipient address and amount are required');
      }
      
      await api.mintTokens(recipient, amount);
      setSuccess('Tokens minted successfully');
      e.target.reset();
    } catch (err) {
      console.error('Error minting tokens:', err);
      setError(err.message || 'Failed to mint tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleBurnTokens = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const amount = parseFloat(e.target.burnAmount.value);
      
      if (!amount) {
        throw new Error('Amount is required');
      }
      
      await api.burnTokens(amount);
      setSuccess('Tokens burned successfully');
      e.target.reset();
    } catch (err) {
      console.error('Error burning tokens:', err);
      setError(err.message || 'Failed to burn tokens');
    } finally {
      setLoading(false);
    }
  };

  const handlePausePresale = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await api.pausePresale();
      setPresaleParams({...presaleParams, paused: true});
      setSuccess('Presale paused successfully');
    } catch (err) {
      console.error('Error pausing presale:', err);
      setError(err.message || 'Failed to pause presale');
    } finally {
      setLoading(false);
    }
  };

  const handleResumePresale = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await api.resumePresale();
      setPresaleParams({...presaleParams, paused: false});
      setSuccess('Presale resumed successfully');
    } catch (err) {
      console.error('Error resuming presale:', err);
      setError(err.message || 'Failed to resume presale');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePresaleParams = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const startTime = e.target.startTime.value;
      const endTime = e.target.endTime.value;
      const minPurchaseAmount = parseFloat(e.target.minPurchaseAmount.value);
      const maxPurchaseAmount = parseFloat(e.target.maxPurchaseAmount.value);
      const whitelistEnabled = e.target.whitelistEnabled.checked;
      
      if (!startTime || !endTime || !minPurchaseAmount || !maxPurchaseAmount) {
        throw new Error('All fields are required');
      }
      
      if (new Date(startTime) >= new Date(endTime)) {
        throw new Error('End time must be after start time');
      }
      
      if (minPurchaseAmount >= maxPurchaseAmount) {
        throw new Error('Maximum purchase amount must be greater than minimum purchase amount');
      }
      
      const updatedParams = {
        startTime,
        endTime,
        minPurchaseAmount,
        maxPurchaseAmount,
        whitelistEnabled
      };
      
      await api.updatePresaleParams(updatedParams);
      setPresaleParams({...presaleParams, ...updatedParams});
      setSuccess('Presale parameters updated successfully');
    } catch (err) {
      console.error('Error updating presale parameters:', err);
      setError(err.message || 'Failed to update presale parameters');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawUnsoldTokens = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const amount = parseFloat(e.target.withdrawAmount.value);
      
      if (!amount) {
        throw new Error('Amount is required');
      }
      
      await api.withdrawUnsoldTokens(amount);
      setSuccess('Unsold tokens withdrawn successfully');
      e.target.reset();
    } catch (err) {
      console.error('Error withdrawing unsold tokens:', err);
      setError(err.message || 'Failed to withdraw unsold tokens');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A';
  };

  if (loading && !tokenInfo) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Presale Management
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Manage presale parameters and token operations
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
            borderColor: activeTab === 'info' ? '#dee2e6' : 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderBottomColor: activeTab === 'info' ? 'transparent' : '#dee2e6',
            bgcolor: activeTab === 'info' ? '#fff' : 'transparent',
            '&:hover': {
              bgcolor: activeTab === 'info' ? '#fff' : '#f8f9fa',
            }
          }}
          onClick={() => setActiveTab('info')}
        >
          Token Info
        </Button>
        <Button 
          sx={{ 
            px: 2, 
            py: 1, 
            borderRadius: '4px 4px 0 0',
            borderColor: activeTab === 'transfer' ? '#dee2e6' : 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderBottomColor: activeTab === 'transfer' ? 'transparent' : '#dee2e6',
            bgcolor: activeTab === 'transfer' ? '#fff' : 'transparent',
            '&:hover': {
              bgcolor: activeTab === 'transfer' ? '#fff' : '#f8f9fa',
            }
          }}
          onClick={() => setActiveTab('transfer')}
        >
          Transfer Tokens
        </Button>
        <Button 
          sx={{ 
            px: 2, 
            py: 1, 
            borderRadius: '4px 4px 0 0',
            borderColor: activeTab === 'mint' ? '#dee2e6' : 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderBottomColor: activeTab === 'mint' ? 'transparent' : '#dee2e6',
            bgcolor: activeTab === 'mint' ? '#fff' : 'transparent',
            '&:hover': {
              bgcolor: activeTab === 'mint' ? '#fff' : '#f8f9fa',
            }
          }}
          onClick={() => setActiveTab('mint')}
        >
          Mint Tokens
        </Button>
        <Button 
          sx={{ 
            px: 2, 
            py: 1, 
            borderRadius: '4px 4px 0 0',
            borderColor: activeTab === 'burn' ? '#dee2e6' : 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderBottomColor: activeTab === 'burn' ? 'transparent' : '#dee2e6',
            bgcolor: activeTab === 'burn' ? '#fff' : 'transparent',
            '&:hover': {
              bgcolor: activeTab === 'burn' ? '#fff' : '#f8f9fa',
            }
          }}
          onClick={() => setActiveTab('burn')}
        >
          Burn Tokens
        </Button>
        <Button 
          sx={{ 
            px: 2, 
            py: 1, 
            borderRadius: '4px 4px 0 0',
            borderColor: activeTab === 'presale' ? '#dee2e6' : 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderBottomColor: activeTab === 'presale' ? 'transparent' : '#dee2e6',
            bgcolor: activeTab === 'presale' ? '#fff' : 'transparent',
            '&:hover': {
              bgcolor: activeTab === 'presale' ? '#fff' : '#f8f9fa',
            }
          }}
          onClick={() => setActiveTab('presale')}
        >
          Presale Controls
        </Button>
        <Button 
          sx={{ 
            px: 2, 
            py: 1, 
            borderRadius: '4px 4px 0 0',
            borderColor: activeTab === 'withdraw' ? '#dee2e6' : 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderBottomColor: activeTab === 'withdraw' ? 'transparent' : '#dee2e6',
            bgcolor: activeTab === 'withdraw' ? '#fff' : 'transparent',
            '&:hover': {
              bgcolor: activeTab === 'withdraw' ? '#fff' : '#f8f9fa',
            }
          }}
          onClick={() => setActiveTab('withdraw')}
        >
          Withdraw Tokens
        </Button>
      </Box>

      <Box sx={{ mt: 3 }}>
        {activeTab === 'info' && tokenInfo && (
          <StyledCard>
            <CardHeader>
              <CardTitle>DPNET-10 Token Information</CardTitle>
            </CardHeader>
            <CardBody>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">Token Name</Typography>
                    <Typography variant="body1">{tokenInfo.name}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">Token Symbol</Typography>
                    <Typography variant="body1">{tokenInfo.symbol}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">Decimals</Typography>
                    <Typography variant="body1">{tokenInfo.decimals}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">Total Supply</Typography>
                    <Typography variant="body1">{formatNumber(tokenInfo.totalSupply)} DPNET</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">Circulating Supply</Typography>
                    <Typography variant="body1">{formatNumber(tokenInfo.circulatingSupply)} DPNET</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">Token Address</Typography>
                    <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>{tokenInfo.address}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">Mint Authority</Typography>
                    <Typography variant="body1">{tokenInfo.mintAuthority ? 'Enabled' : 'Disabled'}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">Freeze Authority</Typography>
                    <Typography variant="body1">{tokenInfo.freezeAuthority ? 'Enabled' : 'Disabled'}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardBody>
          </StyledCard>
        )}

        {activeTab === 'transfer' && (
          <StyledCard>
            <CardHeader>
              <CardTitle>Transfer Tokens</CardTitle>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleTransferTokens}>
                <FormGroup>
                  <Typography variant="subtitle2" gutterBottom>Recipient Address</Typography>
                  <TextField 
                    id="recipient" 
                    fullWidth 
                    placeholder="Enter Solana wallet address" 
                    variant="outlined"
                    size="small"
                  />
                </FormGroup>
                <FormGroup>
                  <Typography variant="subtitle2" gutterBottom>Amount</Typography>
                  <TextField 
                    id="amount" 
                    type="number" 
                    fullWidth 
                    placeholder="Enter amount to transfer" 
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
                  {loading ? 'Processing...' : 'Transfer Tokens'}
                </Button>
              </form>
            </CardBody>
          </StyledCard>
        )}

        {activeTab === 'mint' && (
          <StyledCard>
            <CardHeader>
              <CardTitle>Mint New Tokens</CardTitle>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleMintTokens}>
                <FormGroup>
                  <Typography variant="subtitle2" gutterBottom>Recipient Address</Typography>
                  <TextField 
                    id="mintTo" 
                    fullWidth 
                    placeholder="Enter Solana wallet address" 
                    variant="outlined"
                    size="small"
                  />
                </FormGroup>
                <FormGroup>
                  <Typography variant="subtitle2" gutterBottom>Amount</Typography>
                  <TextField 
                    id="mintAmount" 
                    type="number" 
                    fullWidth 
                    placeholder="Enter amount to mint" 
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
                  {loading ? 'Processing...' : 'Mint Tokens'}
                </Button>
              </form>
            </CardBody>
          </StyledCard>
        )}

        {activeTab === 'burn' && (
          <StyledCard>
            <CardHeader>
              <CardTitle>Burn Tokens</CardTitle>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleBurnTokens}>
                <FormGroup>
                  <Typography variant="subtitle2" gutterBottom>Amount</Typography>
                  <TextField 
                    id="burnAmount" 
                    type="number" 
                    fullWidth 
                    placeholder="Enter amount to burn" 
                    variant="outlined"
                    size="small"
                  />
                </FormGroup>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="error" 
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Processing...' : 'Burn Tokens'}
                </Button>
              </form>
            </CardBody>
          </StyledCard>
        )}

        {activeTab === 'presale' && (
          <StyledCard>
            <CardHeader>
              <CardTitle>Presale Controls</CardTitle>
            </CardHeader>
            <CardBody>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Current Status: {presaleParams.paused ? 'Paused' : 'Active'}</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    variant="contained" 
                    color="warning" 
                    onClick={handlePausePresale} 
                    disabled={loading || presaleParams.paused}
                  >
                    Pause Presale
                  </Button>
                  <Button 
                    variant="contained" 
                    color="success" 
                    onClick={handleResumePresale} 
                    disabled={loading || !presaleParams.paused}
                  >
                    Resume Presale
                  </Button>
                </Box>
              </Box>

              <Box sx={{ borderTop: '1px solid #e9ecef', pt: 3 }}>
                <Typography variant="h6" gutterBottom>Update Presale Parameters</Typography>
                <form onSubmit={handleUpdatePresaleParams}>
                  <FormGroup>
                    <Typography variant="subtitle2" gutterBottom>Start Time</Typography>
                    <TextField 
                      id="startTime" 
                      type="date" 
                      fullWidth 
                      value={presaleParams.startTime}
                      onChange={(e) => setPresaleParams({...presaleParams, startTime: e.target.value})}
                      variant="outlined"
                      size="small"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Typography variant="subtitle2" gutterBottom>End Time</Typography>
                    <TextField 
                      id="endTime" 
                      type="date" 
                      fullWidth 
                      value={presaleParams.endTime}
                      onChange={(e) => setPresaleParams({...presaleParams, endTime: e.target.value})}
                      variant="outlined"
                      size="small"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Typography variant="subtitle2" gutterBottom>Minimum Purchase Amount</Typography>
                    <TextField 
                      id="minPurchaseAmount" 
                      type="number" 
                      fullWidth 
                      value={presaleParams.minPurchaseAmount}
                      onChange={(e) => setPresaleParams({...presaleParams, minPurchaseAmount: parseFloat(e.target.value)})}
                      variant="outlined"
                      size="small"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Typography variant="subtitle2" gutterBottom>Maximum Purchase Amount</Typography>
                    <TextField 
                      id="maxPurchaseAmount" 
                      type="number" 
                      fullWidth 
                      value={presaleParams.maxPurchaseAmount}
                      onChange={(e) => setPresaleParams({...presaleParams, maxPurchaseAmount: parseFloat(e.target.value)})}
                      variant="outlined"
                      size="small"
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          id="whitelistEnabled"
                          checked={presaleParams.whitelistEnabled}
                          onChange={(e) => setPresaleParams({...presaleParams, whitelistEnabled: e.target.checked})}
                        />
                      }
                      label="Enable Whitelist"
                    />
                  </FormGroup>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    disabled={loading}
                    sx={{ mt: 2 }}
                  >
                    {loading ? 'Updating...' : 'Update Parameters'}
                  </Button>
                </form>
              </Box>
            </CardBody>
          </StyledCard>
        )}

        {activeTab === 'withdraw' && (
          <StyledCard>
            <CardHeader>
              <CardTitle>Withdraw Unsold Tokens</CardTitle>
            </CardHeader>
            <CardBody>
              <Box sx={{ p: 2, bgcolor: '#fff3cd', color: '#856404', borderRadius: 1, mb: 3 }}>
                <Typography variant="body1"><strong>Note:</strong> You can only withdraw unsold tokens after the presale has ended.</Typography>
              </Box>
              <form onSubmit={handleWithdrawUnsoldTokens}>
                <FormGroup>
                  <Typography variant="subtitle2" gutterBottom>Amount</Typography>
                  <TextField 
                    id="withdrawAmount" 
                    type="number" 
                    fullWidth 
                    placeholder="Enter amount to withdraw" 
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
                  {loading ? 'Processing...' : 'Withdraw Tokens'}
                </Button>
              </form>
            </CardBody>
          </StyledCard>
        )}
      </Box>
    </Box>
  );
};

export default PresaleManagement;
