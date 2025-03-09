import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    presale: true,
    rewards: false,
    liquidity: false,
    marketing: false,
    team: false,
    treasury: false
  });
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  const renderSubMenu = (section, items) => {
    return (
      <ul style={expandedSections[section] ? subMenuStyle : { display: 'none' }}>
        {items.map((item, index) => (
          <li key={index} style={subMenuItemStyle} className={isActive(item.path)}>
            <Link to={item.path} style={subLinkStyle}>{item.name}</Link>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={sidebarStyle}>
      <ul style={menuStyle}>
        {/* Presale Pool Section */}
        <li style={sectionStyle}>
          <div 
            style={sectionHeaderStyle} 
            onClick={() => toggleSection('presale')}
          >
            <span>Presale Pool</span>
            <span style={expandIconStyle}>{expandedSections.presale ? '▼' : '▶'}</span>
          </div>
          {renderSubMenu('presale', [
            { name: 'Dashboard', path: '/' },
            { name: 'Presale Overview', path: '/presale-overview' },
            { name: 'Presale Management', path: '/presale-management' },
            { name: 'Whitelist Management', path: '/whitelist-management' },
            { name: 'Testing Tools', path: '/testing-tools' }
          ])}
        </li>

        {/* Rewards Pool Section */}
        <li style={sectionStyle}>
          <div 
            style={sectionHeaderStyle} 
            onClick={() => toggleSection('rewards')}
          >
            <span>Rewards Pool</span>
            <span style={expandIconStyle}>{expandedSections.rewards ? '▼' : '▶'}</span>
          </div>
          {renderSubMenu('rewards', [
            { name: 'Dashboard', path: '/rewards-dashboard' }
          ])}
        </li>

        {/* Liquidity Pools Section */}
        <li style={sectionStyle}>
          <div 
            style={sectionHeaderStyle} 
            onClick={() => toggleSection('liquidity')}
          >
            <span>Liquidity Pools</span>
            <span style={expandIconStyle}>{expandedSections.liquidity ? '▼' : '▶'}</span>
          </div>
          {renderSubMenu('liquidity', [
            { name: 'Dashboard', path: '/liquidity-dashboard' }
          ])}
        </li>

        {/* Marketing Section */}
        <li style={sectionStyle}>
          <div 
            style={sectionHeaderStyle} 
            onClick={() => toggleSection('marketing')}
          >
            <span>Marketing & Community</span>
            <span style={expandIconStyle}>{expandedSections.marketing ? '▼' : '▶'}</span>
          </div>
          {renderSubMenu('marketing', [
            { name: 'Dashboard', path: '/marketing-dashboard' }
          ])}
        </li>

        {/* Team Allocation Section */}
        <li style={sectionStyle}>
          <div 
            style={sectionHeaderStyle} 
            onClick={() => toggleSection('team')}
          >
            <span>Team Allocation</span>
            <span style={expandIconStyle}>{expandedSections.team ? '▼' : '▶'}</span>
          </div>
          {renderSubMenu('team', [
            { name: 'Dashboard', path: '/team-dashboard' }
          ])}
        </li>

        {/* Treasury Reserves Section */}
        <li style={sectionStyle}>
          <div 
            style={sectionHeaderStyle} 
            onClick={() => toggleSection('treasury')}
          >
            <span>Treasury Reserves</span>
            <span style={expandIconStyle}>{expandedSections.treasury ? '▼' : '▶'}</span>
          </div>
          {renderSubMenu('treasury', [
            { name: 'Dashboard', path: '/treasury-dashboard' }
          ])}
        </li>
      </ul>
    </div>
  );
};

const sidebarStyle = {
  width: '250px',
  backgroundColor: '#f8f9fa',
  borderRight: '1px solid #e9ecef',
  padding: '0',
  height: '100vh',
  overflowY: 'auto',
  position: 'fixed',
  left: 0,
  top: '60px'
};

const menuStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0
};

const sectionStyle = {
  borderBottom: '1px solid #e9ecef'
};

const sectionHeaderStyle = {
  padding: '15px 20px',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontWeight: 'bold',
  backgroundColor: '#f1f3f5'
};

const expandIconStyle = {
  fontSize: '10px'
};

const subMenuStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  backgroundColor: '#ffffff'
};

const subMenuItemStyle = {
  padding: '10px 20px 10px 35px',
  borderLeft: '3px solid transparent',
  transition: 'all 0.2s'
};

const subLinkStyle = {
  color: '#333',
  textDecoration: 'none',
  display: 'block',
  fontSize: '14px'
};

export default Sidebar;
