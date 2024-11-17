import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginFormData {
  username: string;
  password: string;
}

const VALID_CREDENTIALS = {
  admin: {
    username: 'admin',
    password: 'admin123',
  },
  user: {
    username: 'user',
    password: 'user123',
  }
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.username === VALID_CREDENTIALS.admin.username && 
        formData.password === VALID_CREDENTIALS.admin.password) {
      navigate('/localconfig');
    } else if (formData.username === VALID_CREDENTIALS.user.username && 
               formData.password === VALID_CREDENTIALS.user.password) {
      navigate('/local');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-title">Welcome Back</h2>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />
        </div>
        
        <button
          type="submit"
          className="login-button"
        >
          Login
        </button>

        <div className="credentials-hint">
          <p>Available accounts:</p>
          <small>Admin: username="admin", password="admin123"</small>
          <br />
          <small>User: username="user", password="user123"</small>
        </div>
      </form>
    </div>
  );
};

export default LoginPage; 