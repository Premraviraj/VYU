import React from 'react';
import { useNavigate } from 'react-router-dom';

const LocalPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <h1>User Local Page</h1>
      <p>Welcome to the user dashboard</p>
      <button 
        className="logout-button"
        onClick={() => navigate('/')}
      >
        Logout
      </button>
    </div>
  );
};

export default LocalPage; 