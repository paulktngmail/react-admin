import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TokenManagement from './pages/TokenManagement';
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
              <Route path="/token-management" element={<TokenManagement />} />
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
