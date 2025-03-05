import React from 'react';

const Navbar = () => {
  return (
    <nav style={navbarStyle}>
      <div style={logoStyle}>
        DPNET-10 Admin Dashboard
      </div>
      <div style={userInfoStyle}>
        <span style={userNameStyle}>Admin</span>
      </div>
    </nav>
  );
};

const navbarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 20px',
  height: '60px',
  backgroundColor: '#2c3e50',
  color: 'white',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
};

const logoStyle = {
  fontSize: '20px',
  fontWeight: 'bold'
};

const userInfoStyle = {
  display: 'flex',
  alignItems: 'center'
};

const userNameStyle = {
  marginRight: '10px'
};

export default Navbar;
