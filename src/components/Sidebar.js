import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul>
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/token-management" className={({ isActive }) => isActive ? 'active' : ''}>
            Token Management
          </NavLink>
        </li>
        <li>
          <NavLink to="/whitelist-management" className={({ isActive }) => isActive ? 'active' : ''}>
            Whitelist Management
          </NavLink>
        </li>
        <li>
          <NavLink to="/testing-tools" className={({ isActive }) => isActive ? 'active' : ''}>
            Testing Tools
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
