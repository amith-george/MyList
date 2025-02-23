import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../../styles/pages/LoginRegisterPage.css';
import logo from '../../assets/logo4.svg';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/users/reset-password`, {
        email,
        newPassword
      });

      if (response.status === 200) {
        alert('Password updated successfully!');
        // Optionally redirect to login:
        // navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed');
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

      {/* Right Panel */}
      <div className="split-panel right-panel">
        <div className="login-register-container">
          <h2>Reset Password</h2>
          <form onSubmit={handleSubmit}>
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
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit">Update Password</button>
          </form>
          <p className="text-center mt-4">
            Remember your password?{' '}
            <Link to="/login" className="toggle-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
