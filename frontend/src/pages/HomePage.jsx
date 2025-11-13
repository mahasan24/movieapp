import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Cine Movie App</h1>
          <p className="hero-subtitle">
            Book your favorite movies instantly and enjoy the best cinema experience
          </p>
          
          <div className="hero-buttons">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/movies')}
            >
              Browse Movies
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/movies')}
            >
              View Showtimes
            </button>
          </div>
        </div>
        
        <div className="hero-image">
          <img 
            src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800" 
            alt="Cinema"
          />
        </div>
      </section>

      {/* Features Section (Optional but looks good) */}
      <section className="features-section">
        <div className="feature-card">
          <h3>🎬 Latest Movies</h3>
          <p>Watch the newest releases</p>
        </div>
        <div className="feature-card">
          <h3>🎟️ Easy Booking</h3>
          <p>Book tickets in seconds</p>
        </div>
        <div className="feature-card">
          <h3>⭐ Best Experience</h3>
          <p>Premium cinema quality</p>
        </div>
      </section>
    </div>
  );
};

export default Home;