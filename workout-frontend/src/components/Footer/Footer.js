import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.module.css';

function Footer({ onLogout }) {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    if (onLogout) {
      onLogout(); // Trigger logout to clear authentication state
    }
    navigate('/'); // Navigate to the login or start page
  };

  return (
    <footer>
      <button onClick={handleBackToLogin} style={{ margin: '10px' }}>
        Back to Login
      </button>
      <p>Created by <a href="https://github.com/zhangmatt" target="_blank" rel="noopener noreferrer">Matthew Zhang</a></p>
    </footer>
  );
}

export default Footer;
