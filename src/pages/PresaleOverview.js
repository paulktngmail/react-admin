import React, { useState, useEffect } from 'react';
import { getPresaleInfo, extendPresaleTime } from '../services/api';

const PresaleOverview = () => {
  const [presaleInfo, setPresaleInfo] = useState({
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeExtension, setTimeExtension] = useState({
    days: 0,
    hours: 0,
    minutes: 0
  });
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Fetch presale info from the API
  useEffect(() => {
    const fetchPresaleInfo = async () => {
      setLoading(true);
      try {
        const data = await getPresaleInfo();
        setPresaleInfo(data);
        setCountdown(data.timeLeft);
        setError(null);
      } catch (err) {
        console.error('Error fetching presale info:', err);
        setError('Failed to load presale information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Fetch data on component mount
    fetchPresaleInfo();
    
    // Set up interval to refresh data every 5 minutes
    const intervalId = setInterval(fetchPresaleInfo, 5 * 60 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Update countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (presaleInfo.timeLeft) {
        let { days, hours, minutes, seconds } = presaleInfo.timeLeft;
        
        if (seconds > 0) {
          seconds -= 1;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes -= 1;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours -= 1;
            } else {
              hours = 23;
              if (days > 0) {
                days -= 1;
              }
            }
          }
        }

        setCountdown({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [presaleInfo.timeLeft, countdown]);

  const handleExtendTime = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { days, hours, minutes } = timeExtension;
      const totalMinutes = (days * 24 * 60) + (hours * 60) + parseInt(minutes);
      
      if (totalMinutes <= 0) {
        setError('Please enter a valid time extension');
        setLoading(false);
        return;
      }

      const data = await extendPresaleTime(totalMinutes);
      setPresaleInfo(data);
      setError(null);
      setTimeExtension({ days: 0, hours: 0, minutes: 0 });
    } catch (err) {
      console.error('Error extending presale time:', err);
      setError('Failed to extend presale time. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div>
      <h2>Presale Overview</h2>
      
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
      
      <div className="presale-overview-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Token Supply</h3>
          </div>
          <div className="card-body">
            <div className="stat">
              <div className="stat-label">Total Supply:</div>
              <div className="stat-value">{formatNumber(presaleInfo.totalSupply)} DPNET</div>
            </div>
            <div className="stat">
              <div className="stat-label">Tokens Sold:</div>
              <div className="stat-value">{formatNumber(presaleInfo.tokensSold)} DPNET</div>
            </div>
            <div className="stat">
              <div className="stat-label">Tokens Sold for SOL:</div>
              <div className="stat-value">{formatNumber(presaleInfo.tokensSoldForSol)} DPNET</div>
            </div>
            <div className="stat">
              <div className="stat-label">Tokens Sold for Fiat:</div>
              <div className="stat-value">{formatNumber(presaleInfo.tokensSoldForFiat)} DPNET</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Presale Status</h3>
          </div>
          <div className="card-body">
            <div className="stat">
              <div className="stat-label">Transactions:</div>
              <div className="stat-value">{formatNumber(presaleInfo.transactionsNumber)}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Last Updated:</div>
              <div className="stat-value">{formatDate(presaleInfo.lastUpdated)}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Time Left:</div>
              <div className="stat-value countdown">
                <span className="countdown-segment">
                  <span className="countdown-number">{countdown.days}</span>
                  <span className="countdown-label">days</span>
                </span>
                <span className="countdown-segment">
                  <span className="countdown-number">{countdown.hours}</span>
                  <span className="countdown-label">hours</span>
                </span>
                <span className="countdown-segment">
                  <span className="countdown-number">{countdown.minutes}</span>
                  <span className="countdown-label">min</span>
                </span>
                <span className="countdown-segment">
                  <span className="countdown-number">{countdown.seconds}</span>
                  <span className="countdown-label">sec</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Contract Addresses</h3>
          </div>
          <div className="card-body">
            <div className="stat">
              <div className="stat-label">Presale Pool Address:</div>
              <div className="stat-value address">{presaleInfo.presalePoolAddress}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Token Address:</div>
              <div className="stat-value address">{presaleInfo.tokenAddress}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Extend Presale Time</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleExtendTime}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="days">Days</label>
                  <input 
                    type="number" 
                    id="days" 
                    className="form-control" 
                    min="0"
                    value={timeExtension.days}
                    onChange={(e) => setTimeExtension({...timeExtension, days: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="hours">Hours</label>
                  <input 
                    type="number" 
                    id="hours" 
                    className="form-control" 
                    min="0" 
                    max="23"
                    value={timeExtension.hours}
                    onChange={(e) => setTimeExtension({...timeExtension, hours: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="minutes">Minutes</label>
                  <input 
                    type="number" 
                    id="minutes" 
                    className="form-control" 
                    min="0" 
                    max="59"
                    value={timeExtension.minutes}
                    onChange={(e) => setTimeExtension({...timeExtension, minutes: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Extending...' : 'Extend Time'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .address {
          font-family: monospace;
          font-size: 0.9em;
          word-break: break-all;
        }
        .presale-overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        
        .card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
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
        
        .stat {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }
        
        .stat-label {
          font-weight: 500;
          color: #495057;
        }
        
        .stat-value {
          font-weight: 600;
          color: #212529;
        }
        
        .countdown {
          display: flex;
          justify-content: space-between;
        }
        
        .countdown-segment {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-right: 10px;
        }
        
        .countdown-number {
          font-size: 24px;
          font-weight: 700;
          color: #007bff;
        }
        
        .countdown-label {
          font-size: 12px;
          color: #6c757d;
        }
        
        .form-row {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .form-group {
          flex: 1;
        }
        
        .form-control {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
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
        
        .btn:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
        
        .loading {
          text-align: center;
          padding: 20px;
          font-weight: 500;
          color: #007bff;
        }
        
        .error {
          text-align: center;
          padding: 20px;
          font-weight: 500;
          color: #dc3545;
          background-color: #f8d7da;
          border-radius: 4px;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
};

export default PresaleOverview;
