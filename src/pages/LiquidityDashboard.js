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

const LiquidityDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [poolData, setPoolData] = useState({
    balance: 0,
    allocation: 0,
    percentFilled: 0,
    transactions: 0,
    lastUpdated: new Date().toISOString()
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/pools/liquidity');
        if (response && response.data) {
          setPoolData(response.data);
          setError(null);
        } else {
          // If API returns no data, use token allocation data
          const tokenAllocations = await api.get('/api/token/allocations');
          if (tokenAllocations && tokenAllocations.data) {
            const liquidityPool = tokenAllocations.data.pools.find(pool => 
              pool.name === "Liquidity Pools"
            );
            
            if (liquidityPool) {
              setPoolData({
                balance: 0, // We don't have real balance data
                allocation: liquidityPool.allocation,
                percentFilled: 0,
                transactions: 0,
                lastUpdated: new Date().toISOString()
              });
              setError(null);
            } else {
              setError('Failed to find liquidity pool data');
            }
          } else {
            setError('Failed to load liquidity pool data');
          }
        }
      } catch (err) {
        console.error('Error fetching liquidity pool data:', err);
        // Try to get token allocation data as fallback
        try {
          const tokenAllocations = await api.get('/api/token/allocations');
          if (tokenAllocations && tokenAllocations.data) {
            const liquidityPool = tokenAllocations.data.pools.find(pool => 
              pool.name === "Liquidity Pools"
            );
            
            if (liquidityPool) {
              setPoolData({
                balance: 0, // We don't have real balance data
                allocation: liquidityPool.allocation,
                percentFilled: 0,
                transactions: 0,
                lastUpdated: new Date().toISOString()
              });
              setError(null);
            } else {
              setError('Failed to find liquidity pool data');
            }
          } else {
            setError('Failed to load liquidity pool data');
          }
        } catch (fallbackErr) {
          console.error('Error fetching fallback data:', fallbackErr);
          setError('Failed to load liquidity pool data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const formatNumber = (num) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A';
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString() : 'N/A';
  };

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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Liquidity Pools Dashboard
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Monitor the liquidity pools allocation and usage
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
                {poolData.percentFilled?.toFixed(2) || '0.00'}%
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
          Wallet Address: 3HUwa6YYKNdDgsU6nkkMWyBgT2BRtzmD1JpWSg77sa55
        </Typography>
      </Box>
    </Box>
  );
};

export default LiquidityDashboard;
