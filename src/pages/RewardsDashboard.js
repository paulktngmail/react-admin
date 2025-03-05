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

const RewardsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [poolData, setPoolData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/pools/rewards');
        setPoolData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching rewards pool data:', err);
        setError('Failed to load rewards pool data. Please try again later.');
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
        Rewards Pool Dashboard
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Monitor the rewards pool allocation and usage
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <CardTitle color="textSecondary" gutterBottom>
                Current Balance
              </CardTitle>
              <CardValue variant="h5">
                {formatNumber(poolData?.balance)} DPNET
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
                {formatNumber(poolData?.allocation)} DPNET
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
                {poolData?.percentFilled?.toFixed(2)}%
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
                {formatNumber(poolData?.transactions)}
              </CardValue>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="textSecondary">
          Last updated: {formatDate(poolData?.lastUpdated)}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Wallet Address: FdYsNj3jhGLcCzoMLA2KZdzUnM3UiwCYUNhMmmFaUDie
        </Typography>
      </Box>
    </Box>
  );
};

export default RewardsDashboard;
