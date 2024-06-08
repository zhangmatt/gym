import React from 'react';
import './Header.module.css'; // Assume your CSS is in this file

const Header = ({ isAuthenticated, onLogout }) => {
  return (
    <header className="header">
      <h1 className="header-title">🐯 TIGERTRAX WORKOUTS 🐯</h1>
      {isAuthenticated && <button onClick={onLogout} className="logout-button">Logout</button>}
    </header>
  );
};

export default Header;
