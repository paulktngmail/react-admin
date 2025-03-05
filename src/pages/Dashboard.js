import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { CircularProgress } from '@mui/material';
import api from '../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [presaleInfo, setPresaleInfo] = useState(null);

  useEffect(() => {
    const fetchPresaleInfo = async () => {
      try {
        setLoading(true);
        const data = await api.getPresaleInfo();
        setPresaleInfo(data);
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
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="textSecondary">
        Welcome to the DPNET ADMIN Dashboard!
      </Typography>
      {presaleInfo && (
        <>
          <Typography variant="body1">
            Total Supply: {presaleInfo.totalSupply}
          </Typography>
          <Typography variant="body1">
            Tokens Sold: {presaleInfo.tokensSold}
          </Typography>
        </>
      )}
    </Box>
  );
};

export default Dashboard;
