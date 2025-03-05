import React, { useState } from 'react';

const TokenManagement = () => {
  const [activeTab, setActiveTab] = useState('info');

  return (
    <div>
      <h2>Token Management</h2>
      
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          Token Info
        </div>
        <div 
          className={`tab ${activeTab === 'transfer' ? 'active' : ''}`}
          onClick={() => setActiveTab('transfer')}
        >
          Transfer Tokens
        </div>
        <div 
          className={`tab ${activeTab === 'mint' ? 'active' : ''}`}
          onClick={() => setActiveTab('mint')}
        >
          Mint Tokens
        </div>
        <div 
          className={`tab ${activeTab === 'burn' ? 'active' : ''}`}
          onClick={() => setActiveTab('burn')}
        >
          Burn Tokens
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'info' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">DPNET-10 Token Information</h3>
            </div>
            <div className="card-body">
              <p><strong>Token Name:</strong> DPNET-10</p>
              <p><strong>Token Symbol:</strong> DPNET</p>
              <p><strong>Decimals:</strong> 9</p>
              <p><strong>Total Supply:</strong> 1,000,000,000 DPNET</p>
              <p><strong>Circulating Supply:</strong> 250,000,000 DPNET</p>
              <p><strong>Token Address:</strong> 7XSvJnS19TodrQJSbjUR3NLSZoK3mHvfGqVhxJQRPvTb</p>
              <p><strong>Owner Address:</strong> 9XyQMkZG8Ro7BKYYPCe9Xvjrv8uLZMGZwGhVJZFwBvU9</p>
              <p><strong>Mint Authority:</strong> Enabled</p>
              <p><strong>Freeze Authority:</strong> Enabled</p>
            </div>
          </div>
        )}

        {activeTab === 'transfer' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Transfer Tokens</h3>
            </div>
            <div className="card-body">
              <form>
                <div className="form-group">
                  <label htmlFor="recipient">Recipient Address</label>
                  <input type="text" id="recipient" className="form-control" placeholder="Enter Solana wallet address" />
                </div>
                <div className="form-group">
                  <label htmlFor="amount">Amount</label>
                  <input type="number" id="amount" className="form-control" placeholder="Enter amount to transfer" />
                </div>
                <button type="submit" className="btn btn-primary">Transfer Tokens</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'mint' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Mint New Tokens</h3>
            </div>
            <div className="card-body">
              <form>
                <div className="form-group">
                  <label htmlFor="mintTo">Recipient Address</label>
                  <input type="text" id="mintTo" className="form-control" placeholder="Enter Solana wallet address" />
                </div>
                <div className="form-group">
                  <label htmlFor="mintAmount">Amount</label>
                  <input type="number" id="mintAmount" className="form-control" placeholder="Enter amount to mint" />
                </div>
                <button type="submit" className="btn btn-primary">Mint Tokens</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'burn' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Burn Tokens</h3>
            </div>
            <div className="card-body">
              <form>
                <div className="form-group">
                  <label htmlFor="burnAmount">Amount</label>
                  <input type="number" id="burnAmount" className="form-control" placeholder="Enter amount to burn" />
                </div>
                <button type="submit" className="btn btn-danger">Burn Tokens</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenManagement;
