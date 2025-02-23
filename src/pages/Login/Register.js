import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import '../../styles/pages/LoginRegisterPage.css';
import logo from '../../assets/logo4.svg';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email || !username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');

    try {
      const response = await axios.post(`${BACKEND_URL}/users/register`, {
        email,
        username,
        password
      });

      if (response.status === 201) {
        alert('Registration successful!');
        navigate('/login');
        // Handle successful registration
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          <h2>Create Account</h2>
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>
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
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit">Get Started</button>
          </form>
          <p className="text-center mt-4">
            Already have an account?{' '}
            <Link to="/login" className="toggle-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;