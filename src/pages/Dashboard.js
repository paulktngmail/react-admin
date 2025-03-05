import React from 'react';

const Dashboard = () => {
  return (
    <div>
      <h2>Dashboard</h2>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">DPNET-10 Token Overview</h3>
        </div>
        <div className="card-body">
          <div className="status-card">
            <div className="status-indicator status-active"></div>
            <span>Active</span>
          </div>
          <div className="row">
            <div className="col">
              <p><strong>Total Supply:</strong> 1,000,000,000 DPNET</p>
              <p><strong>Current Price:</strong> 0.00001 SOL</p>
              <p><strong>Market Cap:</strong> 10,000 SOL</p>
            </div>
            <div className="col">
              <p><strong>Holders:</strong> 1,250</p>
              <p><strong>Transactions:</strong> 5,678</p>
              <p><strong>Last Updated:</strong> {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Activity</h3>
        </div>
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Wallet</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Transfer</td>
                <td>10,000 DPNET</td>
                <td>Gk5g...7jH6</td>
                <td>2 minutes ago</td>
              </tr>
              <tr>
                <td>Purchase</td>
                <td>50,000 DPNET</td>
                <td>Hj7k...9dF2</td>
                <td>15 minutes ago</td>
              </tr>
              <tr>
                <td>Whitelist Add</td>
                <td>-</td>
                <td>Lp3s...2gT7</td>
                <td>32 minutes ago</td>
              </tr>
              <tr>
                <td>Transfer</td>
                <td>25,000 DPNET</td>
                <td>Rt6y...1hJ9</td>
                <td>45 minutes ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
