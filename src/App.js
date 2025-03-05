import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PresaleOverview from './pages/PresaleOverview';
import PresaleManagement from './pages/PresaleManagement';
import WhitelistManagement from './pages/WhitelistManagement';
import TestingTools from './pages/TestingTools';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Sidebar />
          <main className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/presale-overview" element={<PresaleOverview />} />
              <Route path="/presale-management" element={<PresaleManagement />} />
              <Route path="/whitelist-management" element={<WhitelistManagement />} />
              <Route path="/testing-tools" element={<TestingTools />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
