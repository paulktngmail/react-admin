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

const PresaleOverview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [presaleInfo, setPresaleInfo] = useState(null);

  useEffect(() => {
    const fetchPresaleInfo = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/presale/info');
        setPresaleInfo(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching presale info:', err);
        setError('Failed to load presale information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPresaleInfo();

    const intervalId = setInterval(fetchPresaleInfo, 5 * 60 * 1000);

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
        Presale Overview
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Real-time data and key metrics for the DPNET-10 presale
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <CardTitle color="textSecondary" gutterBottom>
                Total Supply
              </CardTitle>
              <CardValue variant="h5">
                {formatNumber(presaleInfo?.totalSupply)} DPNET
              </CardValue>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <CardTitle color="textSecondary" gutterBottom>
                Tokens Sold
              </CardTitle>
              <CardValue variant="h5">
                {formatNumber(presaleInfo?.tokensSold)} DPNET
              </CardValue>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <CardTitle color="textSecondary" gutterBottom>
                Sold for SOL
              </CardTitle>
              <CardValue variant="h5">
                {formatNumber(presaleInfo?.tokensSoldForSol)} SOL
              </CardValue>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <CardTitle color="textSecondary" gutterBottom>
                Sold for Fiat
              </CardTitle>
              <CardValue variant="h5">
                {formatNumber(presaleInfo?.tokensSoldForFiat)} USD
              </CardValue>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <CardTitle color="textSecondary" gutterBottom>
                Transactions
              </CardTitle>
              <CardValue variant="h5">
                {formatNumber(presaleInfo?.transactionsNumber)}
              </CardValue>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <CardTitle color="textSecondary" gutterBottom>
                Last Updated
              </CardTitle>
              <CardValue variant="h5">
                {formatDate(presaleInfo?.lastUpdated)}
              </CardValue>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <CardTitle color="textSecondary" gutterBottom>
                Time Left
              </CardTitle>
              <CardValue variant="h5">
                {presaleInfo?.timeLeft?.days}d {presaleInfo?.timeLeft?.hours}h {presaleInfo?.timeLeft?.minutes}m {presaleInfo?.timeLeft?.seconds}s
              </CardValue>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PresaleOverview;
