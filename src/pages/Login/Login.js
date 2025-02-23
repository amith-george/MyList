import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/pages/LoginRegisterPage.css';
import logo from '../../assets/logo4.svg';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');

    try {
      const response = await axios.post(`${BACKEND_URL}/users/login`, {
        email,
        password,
      });

      if (response.status === 200) {
        alert('Login successful!');
        localStorage.setItem('token', response.data.token);
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-register-wrapper">
      {/* Left Panel */}
      <div className="split-panel left-panel">
        <div className="logo-container">
          <img src={logo} alt="Site Logo" className="site-logo" />
          <h1 className="mylist-heading">MyList</h1>
        </div>
        <ul className="benefits-list">
          {/* ... benefits list remains unchanged ... */}
          <li className="benefit-item">
            <div className="benefit-icon">🎥</div>
            <div className="benefit-content">
              <h3 className="benefit-title">Explore & Organize</h3>
              <p className="benefit-description">
                Save and manage your favorite movies and TV shows in personalized watchlists.
              </p>
            </div>
          </li>
          <li className="benefit-item">
            <div className="benefit-icon">🔍</div>
            <div className="benefit-content">
              <h3 className="benefit-title">Quick Search</h3>
              <p className="benefit-description">
                Find detailed information on any movie or TV show instantly.
              </p>
            </div>
          </li>
          <li className="benefit-item">
            <div className="benefit-icon">⭐</div>
            <div className="benefit-content">
              <h3 className="benefit-title">Rate & Review</h3>
              <p className="benefit-description">
                Add ratings and reviews to remember your favorites and share your thoughts.
              </p>
            </div>
          </li>
          <li className="benefit-item">
            <div className="benefit-icon">📢</div>
            <div className="benefit-content">
              <h3 className="benefit-title">Trending & New Releases</h3>
              <p className="benefit-description">
                Stay updated with the latest hits, top-rated movies, and curated recommendations.
              </p>
            </div>
          </li>
        </ul>
      </div>

      {/* Right Panel remains unchanged */}
      <div className="split-panel right-panel">
        <div className="login-register-container">
          <h2>Welcome Back</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <div className="forgot-password-link">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit">Sign In</button>
          </form>
          <p className="text-center mt-4">
            New here?{' '}
            <Link to="/register" className="toggle-link">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
