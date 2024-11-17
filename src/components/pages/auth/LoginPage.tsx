import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Add stars effect
  useEffect(() => {
    const createStars = () => {
      const stars = document.createElement('div');
      stars.className = 'stars';
      
      for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.width = `${Math.random() * 3}px`;
        star.style.height = star.style.width;
        star.style.setProperty('--duration', `${Math.random() * 3 + 1}s`);
        star.style.setProperty('--opacity', `${Math.random() * 0.7 + 0.3}`);
        stars.appendChild(star);
      }
      
      document.querySelector('.login-container')?.appendChild(stars);
    };

    createStars();
    return () => {
      document.querySelector('.stars')?.remove();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Please sign in to continue</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 