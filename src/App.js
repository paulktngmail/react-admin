import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import PresaleOverview from './pages/PresaleOverview';
import PresaleManagement from './pages/PresaleManagement';
import WhitelistManagement from './pages/WhitelistManagement';
import TestingTools from './pages/TestingTools';

// Pool Dashboard Pages
import RewardsDashboard from './pages/RewardsDashboard';
import LiquidityDashboard from './pages/LiquidityDashboard';
import MarketingDashboard from './pages/MarketingDashboard';
import TeamDashboard from './pages/TeamDashboard';
import TreasuryDashboard from './pages/TreasuryDashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex' }}>
          <Navbar />
          <Sidebar />
          <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, ml: '250px' }}>
            <Routes>
              {/* Presale Pool Routes */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/presale-overview" element={<PresaleOverview />} />
              <Route path="/presale-management" element={<PresaleManagement />} />
              <Route path="/whitelist-management" element={<WhitelistManagement />} />
              <Route path="/testing-tools" element={<TestingTools />} />
              
              {/* Other Pool Dashboard Routes */}
              <Route path="/rewards-dashboard" element={<RewardsDashboard />} />
              <Route path="/liquidity-dashboard" element={<LiquidityDashboard />} />
              <Route path="/marketing-dashboard" element={<MarketingDashboard />} />
              <Route path="/team-dashboard" element={<TeamDashboard />} />
              <Route path="/treasury-dashboard" element={<TreasuryDashboard />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
