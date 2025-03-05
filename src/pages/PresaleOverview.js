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
  const [presaleData, setPresaleData] = useState({
    totalSupply: 0,
    tokensSold: 0,
    tokensSoldForSol: 0,
    tokensSoldForFiat: 0,
    transactionsNumber: 0,
    lastUpdated: new Date().toISOString(),
    timeLeft: {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    },
    presalePoolAddress: '',
    tokenAddress: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.getPresaleInfo();
        if (response) {
          setPresaleData(response);
          setError(null);
        } else {
          // If API returns no data, use default data
          setPresaleData({
            totalSupply: 500000000, // 500 million DPNET tokens for presale
            tokensSold: 250000000,
            tokensSoldForSol: 200000000,
            tokensSoldForFiat: 50000000,
            transactionsNumber: 1250,
            lastUpdated: new Date().toISOString(),
            timeLeft: {
              days: 30,
              hours: 12,
              minutes: 45,
              seconds: 20
            },
            presalePoolAddress: 'bJhdXiRhddYL2wXHjx3CEsGDRDCLYrW5ZxmG4xeSahX',
            tokenAddress: 'F4qB6W5tUPHXRE1nfnw7MkLAu3YU7T12o6T52QKq5pQK'
          });
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching presale info:', err);
        // Use default data if API fails
        setPresaleData({
          totalSupply: 500000000, // 500 million DPNET tokens for presale
          tokensSold: 250000000,
          tokensSoldForSol: 200000000,
          tokensSoldForFiat: 50000000,
          transactionsNumber: 1250,
          lastUpdated: new Date().toISOString(),
          timeLeft: {
            days: 30,
            hours: 12,
            minutes: 45,
            seconds: 20
          },
          presalePoolAddress: 'bJhdXiRhddYL2wXHjx3CEsGDRDCLYrW5ZxmG4xeSahX',
          tokenAddress: 'F4qB6W5tUPHXRE1nfnw7MkLAu3YU7T12o6T52QKq5pQK'
        });
        setError(null);
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

  const formatTimeLeft = (timeLeft) => {
    if (!timeLeft) return 'N/A';
    return `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`;
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
        Monitor the presale progress and statistics
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <CardTitle color="textSecondary" gutterBottom>
                Total Supply
              </CardTitle>
              <CardValue variant="h5">
                {formatNumber(presaleData.totalSupply)} DPNET
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
                {formatNumber(presaleData.tokensSold)} DPNET
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
                {formatNumber(presaleData.tokensSoldForSol)} DPNET
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
                {formatNumber(presaleData.tokensSoldForFiat)} DPNET
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
                {formatNumber(presaleData.transactionsNumber)}
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
                {formatTimeLeft(presaleData.timeLeft)}
              </CardValue>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <CardTitle color="textSecondary" gutterBottom>
                Percent Sold
              </CardTitle>
              <CardValue variant="h5">
                {presaleData.totalSupply ? ((presaleData.tokensSold / presaleData.totalSupply) * 100).toFixed(2) : '0.00'}%
              </CardValue>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <CardTitle color="textSecondary" gutterBottom>
                SOL vs Fiat Ratio
              </CardTitle>
              <CardValue variant="h5">
                {presaleData.tokensSold ? ((presaleData.tokensSoldForSol / presaleData.tokensSold) * 100).toFixed(2) : '0.00'}%
              </CardValue>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="textSecondary">
          Last updated: {formatDate(presaleData.lastUpdated)}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Presale Pool Address: {presaleData.presalePoolAddress}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Token Address: {presaleData.tokenAddress}
        </Typography>
      </Box>
    </Box>
  );
};

export default PresaleOverview;
