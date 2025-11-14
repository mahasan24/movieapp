import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('token') !== null;
  const user = isLoggedIn ? JSON.parse(localStorage.getItem('user') || '{}') : null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to home page with search query
      window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            🎬 MovieApp
          </Link>
        </div>
        
        <div className="navbar-right">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              className="search-input"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-submit-btn">🔍</button>
          </form>
          
          {!isLoggedIn && (
            <>
              <span className="guest-text">You are currently using guest access</span>
              <Link to="/login" className="login-btn">Log in</Link>
            </>
          )}
          {isLoggedIn && (
            <>
              <span className="welcome-text">Welcome, {user?.name || 'User'}</span>
              <button 
                className="logout-btn"
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/';
                }}
              >
                Log out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar