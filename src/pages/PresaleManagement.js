import React, { useState } from 'react';
import { 
  getTokenInfo, 
  transferTokens, 
  mintTokens, 
  burnTokens,
  pausePresale,
  resumePresale,
  updatePresaleParams,
  withdrawUnsoldTokens
} from '../services/api';

const PresaleManagement = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [presaleParams, setPresaleParams] = useState({
    startTime: new Date().toISOString().split('T')[0],
    endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    minPurchaseAmount: 100,
    maxPurchaseAmount: 100000,
    whitelistEnabled: true,
    paused: false
  });

  const handleTransferTokens = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const recipient = e.target.recipient.value;
      const amount = parseFloat(e.target.amount.value);
      
      if (!recipient || !amount) {
        throw new Error('Recipient address and amount are required');
      }
      
      await transferTokens(recipient, amount);
      setSuccess('Tokens transferred successfully');
      e.target.reset();
    } catch (err) {
      console.error('Error transferring tokens:', err);
      setError(err.message || 'Failed to transfer tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleMintTokens = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const recipient = e.target.mintTo.value;
      const amount = parseFloat(e.target.mintAmount.value);
      
      if (!recipient || !amount) {
        throw new Error('Recipient address and amount are required');
      }
      
      await mintTokens(recipient, amount);
      setSuccess('Tokens minted successfully');
      e.target.reset();
    } catch (err) {
      console.error('Error minting tokens:', err);
      setError(err.message || 'Failed to mint tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleBurnTokens = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const amount = parseFloat(e.target.burnAmount.value);
      
      if (!amount) {
        throw new Error('Amount is required');
      }
      
      await burnTokens(amount);
      setSuccess('Tokens burned successfully');
      e.target.reset();
    } catch (err) {
      console.error('Error burning tokens:', err);
      setError(err.message || 'Failed to burn tokens');
    } finally {
      setLoading(false);
    }
  };

  const handlePausePresale = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await pausePresale();
      setPresaleParams({...presaleParams, paused: true});
      setSuccess('Presale paused successfully');
    } catch (err) {
      console.error('Error pausing presale:', err);
      setError(err.message || 'Failed to pause presale');
    } finally {
      setLoading(false);
    }
  };

  const handleResumePresale = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await resumePresale();
      setPresaleParams({...presaleParams, paused: false});
      setSuccess('Presale resumed successfully');
    } catch (err) {
      console.error('Error resuming presale:', err);
      setError(err.message || 'Failed to resume presale');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePresaleParams = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const startTime = e.target.startTime.value;
      const endTime = e.target.endTime.value;
      const minPurchaseAmount = parseFloat(e.target.minPurchaseAmount.value);
      const maxPurchaseAmount = parseFloat(e.target.maxPurchaseAmount.value);
      const whitelistEnabled = e.target.whitelistEnabled.checked;
      
      if (!startTime || !endTime || !minPurchaseAmount || !maxPurchaseAmount) {
        throw new Error('All fields are required');
      }
      
      if (new Date(startTime) >= new Date(endTime)) {
        throw new Error('End time must be after start time');
      }
      
      if (minPurchaseAmount >= maxPurchaseAmount) {
        throw new Error('Maximum purchase amount must be greater than minimum purchase amount');
      }
      
      const updatedParams = {
        startTime,
        endTime,
        minPurchaseAmount,
        maxPurchaseAmount,
        whitelistEnabled
      };
      
      await updatePresaleParams(updatedParams);
      setPresaleParams({...presaleParams, ...updatedParams});
      setSuccess('Presale parameters updated successfully');
    } catch (err) {
      console.error('Error updating presale parameters:', err);
      setError(err.message || 'Failed to update presale parameters');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawUnsoldTokens = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const amount = parseFloat(e.target.withdrawAmount.value);
      
      if (!amount) {
        throw new Error('Amount is required');
      }
      
      await withdrawUnsoldTokens(amount);
      setSuccess('Unsold tokens withdrawn successfully');
      e.target.reset();
    } catch (err) {
      console.error('Error withdrawing unsold tokens:', err);
      setError(err.message || 'Failed to withdraw unsold tokens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Presale Management</h2>
      
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
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
        <div 
          className={`tab ${activeTab === 'presale' ? 'active' : ''}`}
          onClick={() => setActiveTab('presale')}
        >
          Presale Controls
        </div>
        <div 
          className={`tab ${activeTab === 'withdraw' ? 'active' : ''}`}
          onClick={() => setActiveTab('withdraw')}
        >
          Withdraw Tokens
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
              <form onSubmit={handleTransferTokens}>
                <div className="form-group">
                  <label htmlFor="recipient">Recipient Address</label>
                  <input type="text" id="recipient" className="form-control" placeholder="Enter Solana wallet address" />
                </div>
                <div className="form-group">
                  <label htmlFor="amount">Amount</label>
                  <input type="number" id="amount" className="form-control" placeholder="Enter amount to transfer" />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Processing...' : 'Transfer Tokens'}
                </button>
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
              <form onSubmit={handleMintTokens}>
                <div className="form-group">
                  <label htmlFor="mintTo">Recipient Address</label>
                  <input type="text" id="mintTo" className="form-control" placeholder="Enter Solana wallet address" />
                </div>
                <div className="form-group">
                  <label htmlFor="mintAmount">Amount</label>
                  <input type="number" id="mintAmount" className="form-control" placeholder="Enter amount to mint" />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Processing...' : 'Mint Tokens'}
                </button>
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
              <form onSubmit={handleBurnTokens}>
                <div className="form-group">
                  <label htmlFor="burnAmount">Amount</label>
                  <input type="number" id="burnAmount" className="form-control" placeholder="Enter amount to burn" />
                </div>
                <button type="submit" className="btn btn-danger" disabled={loading}>
                  {loading ? 'Processing...' : 'Burn Tokens'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'presale' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Presale Controls</h3>
            </div>
            <div className="card-body">
              <div className="presale-status">
                <h4>Current Status: {presaleParams.paused ? 'Paused' : 'Active'}</h4>
                <div className="button-group">
                  <button 
                    className="btn btn-warning" 
                    onClick={handlePausePresale} 
                    disabled={loading || presaleParams.paused}
                  >
                    Pause Presale
                  </button>
                  <button 
                    className="btn btn-success" 
                    onClick={handleResumePresale} 
                    disabled={loading || !presaleParams.paused}
                  >
                    Resume Presale
                  </button>
                </div>
              </div>

              <hr />

              <h4>Update Presale Parameters</h4>
              <form onSubmit={handleUpdatePresaleParams}>
                <div className="form-group">
                  <label htmlFor="startTime">Start Time</label>
                  <input 
                    type="date" 
                    id="startTime" 
                    className="form-control" 
                    value={presaleParams.startTime}
                    onChange={(e) => setPresaleParams({...presaleParams, startTime: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endTime">End Time</label>
                  <input 
                    type="date" 
                    id="endTime" 
                    className="form-control" 
                    value={presaleParams.endTime}
                    onChange={(e) => setPresaleParams({...presaleParams, endTime: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="minPurchaseAmount">Minimum Purchase Amount</label>
                  <input 
                    type="number" 
                    id="minPurchaseAmount" 
                    className="form-control" 
                    value={presaleParams.minPurchaseAmount}
                    onChange={(e) => setPresaleParams({...presaleParams, minPurchaseAmount: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="maxPurchaseAmount">Maximum Purchase Amount</label>
                  <input 
                    type="number" 
                    id="maxPurchaseAmount" 
                    className="form-control" 
                    value={presaleParams.maxPurchaseAmount}
                    onChange={(e) => setPresaleParams({...presaleParams, maxPurchaseAmount: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="form-check">
                  <input 
                    type="checkbox" 
                    id="whitelistEnabled" 
                    className="form-check-input" 
                    checked={presaleParams.whitelistEnabled}
                    onChange={(e) => setPresaleParams({...presaleParams, whitelistEnabled: e.target.checked})}
                  />
                  <label className="form-check-label" htmlFor="whitelistEnabled">
                    Enable Whitelist
                  </label>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Parameters'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Withdraw Unsold Tokens</h3>
            </div>
            <div className="card-body">
              <div className="alert alert-warning">
                <strong>Note:</strong> You can only withdraw unsold tokens after the presale has ended.
              </div>
              <form onSubmit={handleWithdrawUnsoldTokens}>
                <div className="form-group">
                  <label htmlFor="withdrawAmount">Amount</label>
                  <input type="number" id="withdrawAmount" className="form-control" placeholder="Enter amount to withdraw" />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Processing...' : 'Withdraw Tokens'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .tabs {
          display: flex;
          flex-wrap: wrap;
          border-bottom: 1px solid #dee2e6;
          margin-bottom: 20px;
        }
        
        .tab {
          padding: 10px 15px;
          cursor: pointer;
          border: 1px solid transparent;
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;
          margin-bottom: -1px;
          background-color: transparent;
          transition: all 0.2s;
        }
        
        .tab:hover {
          border-color: #e9ecef #e9ecef #dee2e6;
        }
        
        .tab.active {
          color: #495057;
          background-color: #fff;
          border-color: #dee2e6 #dee2e6 #fff;
        }
        
        .card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          margin-bottom: 20px;
        }
        
        .card-header {
          background-color: #f8f9fa;
          padding: 15px 20px;
          border-bottom: 1px solid #e9ecef;
        }
        
        .card-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .card-body {
          padding: 20px;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        .form-control {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
        }
        
        .form-check {
          margin-bottom: 15px;
        }
        
        .form-check-input {
          margin-right: 8px;
        }
        
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .btn-primary {
          background-color: #007bff;
          color: white;
        }
        
        .btn-primary:hover {
          background-color: #0069d9;
        }
        
        .btn-danger {
          background-color: #dc3545;
          color: white;
        }
        
        .btn-danger:hover {
          background-color: #c82333;
        }
        
        .btn-warning {
          background-color: #ffc107;
          color: #212529;
        }
        
        .btn-warning:hover {
          background-color: #e0a800;
        }
        
        .btn-success {
          background-color: #28a745;
          color: white;
        }
        
        .btn-success:hover {
          background-color: #218838;
        }
        
        .btn:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
        
        .loading {
          text-align: center;
          padding: 10px;
          font-weight: 500;
          color: #007bff;
        }
        
        .error {
          text-align: center;
          padding: 10px;
          font-weight: 500;
          color: #dc3545;
          background-color: #f8d7da;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .success {
          text-align: center;
          padding: 10px;
          font-weight: 500;
          color: #28a745;
          background-color: #d4edda;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .presale-status {
          margin-bottom: 20px;
        }
        
        .button-group {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
        
        .alert {
          padding: 12px 20px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .alert-warning {
          background-color: #fff3cd;
          border: 1px solid #ffeeba;
          color: #856404;
        }
        
        hr {
          margin: 20px 0;
          border: 0;
          border-top: 1px solid #e9ecef;
        }
      `}</style>
    </div>
  );
};

export default PresaleManagement;
