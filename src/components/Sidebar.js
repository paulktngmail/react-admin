import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div style={sidebarStyle}>
      <ul style={menuStyle}>
        <li style={menuItemStyle} className={isActive('/')}>
          <Link to="/" style={linkStyle}>Dashboard</Link>
        </li>
        <li style={menuItemStyle} className={isActive('/presale-overview')}>
          <Link to="/presale-overview" style={linkStyle}>Presale Overview</Link>
        </li>
        <li style={menuItemStyle} className={isActive('/presale-management')}>
          <Link to="/presale-management" style={linkStyle}>Presale Management</Link>
        </li>
        <li style={menuItemStyle} className={isActive('/whitelist-management')}>
          <Link to="/whitelist-management" style={linkStyle}>Whitelist Management</Link>
        </li>
        <li style={menuItemStyle} className={isActive('/testing-tools')}>
          <Link to="/testing-tools" style={linkStyle}>Testing Tools</Link>
        </li>
      </ul>
    </div>
  );
};

const sidebarStyle = {
  width: '250px',
  backgroundColor: '#f8f9fa',
  borderRight: '1px solid #e9ecef',
  padding: '20px 0'
};

const menuStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0
};

const menuItemStyle = {
  padding: '10px 20px',
  borderLeft: '3px solid transparent',
  transition: 'all 0.2s'
};

const linkStyle = {
  color: '#333',
  textDecoration: 'none',
  display: 'block'
};

export default Sidebar;
