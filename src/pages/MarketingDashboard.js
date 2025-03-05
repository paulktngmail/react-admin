import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, CircularProgress, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import api from '../services/api';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  borderRadius: '8px',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',
  },
}));

const CardTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  fontWeight: 'bold',
  marginBottom: '8px',
  color: '#333',
}));

const CardValue = styled(Typography)(({ theme }) => ({
  fontSize: '1.8rem',
  fontWeight: 'bold',
  color: '#1976d2',
}));

const MarketingDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [poolData, setPoolData] = useState({
    balance: 0,
    allocation: 0,
    percentFilled: 0,
    transactions: 0,
    lastUpdated: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get pool data from the API
        const response = await api.get('/api/pools/marketing');
        
        // If the API call fails, use the token allocation data
        if (!response.data) {
          const tokenAllocations = await api.get('/api/token/allocations');
          const marketingPool = tokenAllocations.data.pools.find(pool => 
            pool.name === "Marketing, Airdrops, and Community Building"
          );
          
          setPoolData({
            balance: 0, // We don't have real balance data
            allocation: marketingPool.allocation,
            percentFilled: 0,
            transactions: 0,
            lastUpdated: new Date().toISOString()
          });
        } else {
          setPoolData(response.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching marketing pool data:', err);
        setError('Failed to load marketing pool data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh data every 60 seconds
    const intervalId = setInterval(fetchData, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Marketing & Community Dashboard
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Monitor the marketing, airdrops, and community building allocation and usage
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <CardTitle color="textSecondary" gutterBottom>
                Current Balance
              </CardTitle>
              <CardValue variant="h5">
                {formatNumber(poolData.balance)} DPNET
              </CardValue>
            </CardContent>
          </StyledCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <CardTitle color="textSecondary" gutterBottom>
                Total Allocation
              </CardTitle>
              <CardValue variant="h5">
                {formatNumber(poolData.allocation)} DPNET
              </CardValue>
            </CardContent>
          </StyledCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <CardTitle color="textSecondary" gutterBottom>
                Percent Filled
              </CardTitle>
              <CardValue variant="h5">
                {poolData.percentFilled.toFixed(2)}%
              </CardValue>
            </CardContent>
          </StyledCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <CardTitle color="textSecondary" gutterBottom>
                Transactions
              </CardTitle>
              <CardValue variant="h5">
                {formatNumber(poolData.transactions)}
              </CardValue>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="textSecondary">
          Last updated: {formatDate(poolData.lastUpdated)}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Wallet Address: 99AufghSAA7Xj1grrhLgiZMvGXk6XAGLESf1PRJBpoko
        </Typography>
      </Box>
    </Box>
  );
};

export default MarketingDashboard;
