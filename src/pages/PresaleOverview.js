import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, CircularProgress, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import api from '../services/api';
import solanaApi from '../services/solanaApi';

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
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Try to get data from backend first (which includes timeLeft from DynamoDB)
        try {
          const backendData = await api.getPresaleInfo();
          if (backendData) {
            // Store the timeLeft from backend (DynamoDB)
            const { timeLeft } = backendData;
            
            // Get real-time blockchain data
            const blockchainData = await solanaApi.getPresalePoolData();
            
            // Merge the data, prioritizing blockchain data but keeping timeLeft from backend
            setPresaleData({
              ...blockchainData,
              timeLeft: timeLeft || {
                days: 30,
                hours: 12,
                minutes: 45,
                seconds: 20
              }
            });
            
            // Get transaction history
            const txHistory = await solanaApi.getTransactionHistory(blockchainData.presalePoolAddress, 5);
            setTransactions(txHistory);
            
            setError(null);
          }
        } catch (backendError) {
          console.error('Error fetching from backend:', backendError);
          
          // If backend fails, try to get data directly from blockchain
          try {
            const blockchainData = await solanaApi.getPresalePoolData();
            
            // Use default timeLeft since we couldn't get it from backend
            setPresaleData({
              ...blockchainData,
              timeLeft: {
                days: 30,
                hours: 12,
                minutes: 45,
                seconds: 20
              }
            });
            
            // Get transaction history
            const txHistory = await solanaApi.getTransactionHistory(blockchainData.presalePoolAddress, 5);
            setTransactions(txHistory);
            
            setError(null);
          } catch (blockchainError) {
            console.error('Error fetching from blockchain:', blockchainError);
            throw new Error('Failed to fetch data from both backend and blockchain');
          }
        }
      } catch (err) {
        console.error('Error fetching presale info:', err);
        setError('Failed to load presale data. Please try again later.');
        
        // Use default data as last resort
        setPresaleData({
          totalSupply: 500000000,
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up timer to update timeLeft
    const timer = setInterval(() => {
      setPresaleData(prevData => {
        if (!prevData.timeLeft) return prevData;
        
        let { days, hours, minutes, seconds } = prevData.timeLeft;
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }
        
        return {
          ...prevData,
          timeLeft: { days, hours, minutes, seconds }
        };
      });
    }, 1000);

    // Set up interval to refresh data from API
    const refreshInterval = setInterval(fetchData, 5 * 60 * 1000);

    return () => {
      clearInterval(timer);
      clearInterval(refreshInterval);
    };
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

      {/* Recent Transactions Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Recent Transactions
        </Typography>
        
        {transactions.length > 0 ? (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Signature</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Time</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Slot</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Fee (SOL)</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px' }}>
          <a 
            href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#1976d2', textDecoration: 'none' }}
          >
            {tx.signature.substring(0, 8)}...{tx.signature.substring(tx.signature.length - 8)}
          </a>
                    </td>
                    <td style={{ padding: '12px' }}>{tx.blockTime ? new Date(tx.blockTime).toLocaleString() : 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{tx.slot}</td>
                    <td style={{ padding: '12px' }}>{(tx.fee / 1000000000).toFixed(6)}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        color: tx.status === 'Success' ? '#28a745' : '#dc3545',
                        fontWeight: 'bold'
                      }}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        ) : (
          <Typography variant="body1" color="textSecondary">
            No recent transactions found.
          </Typography>
        )}
      </Box>

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
