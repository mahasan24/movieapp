import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './Home.css'
import MovieCard from '../components/MovieCard'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const Home = () => {
  const { t } = useTranslation();
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [nowShowing, setNowShowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const [featuredRes, trendingRes, nowShowingRes] = await Promise.all([
          fetch(`${API_BASE}/movies/featured?limit=5`),
          fetch(`${API_BASE}/movies/trending?limit=5`),
          fetch(`${API_BASE}/movies/now-showing`)
        ]);

        if (featuredRes.ok) {
          const data = await featuredRes.json();
          setFeatured(data.slice(0, 5));
        }
        if (trendingRes.ok) {
          const data = await trendingRes.json();
          setTrending(data.slice(0, 5));
        }
        if (nowShowingRes.ok) {
          const data = await nowShowingRes.json();
          setNowShowing(data.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to fetch home content', err);
        setError(t('landing.errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    fetchHomeContent();
  }, [t]);

  if (loading) {
    return (
      <div className="landing-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>{t('landing.loadingContent')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">{t('landing.heroTitle')}</h1>
          <p className="hero-subtitle">{t('landing.heroSubtitle')}</p>
          <div className="hero-buttons">
            <Link to="/now-showing" className="hero-btn btn-primary">
              🎬 {t('landing.nowShowingButton')}
            </Link>
            <Link to="/browse" className="hero-btn btn-secondary">
              {t('landing.browseButton')}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Movies Section */}
      {featured.length > 0 && (
        <section className="content-section featured-section">
          <div className="section-header">
            <h2 className="section-title">{t('landing.featured')}</h2>
          </div>
          <div className="movies-grid">
            {featured.map(movie => (
              <MovieCard key={movie.id} movie={movie} showGenreBadge />
            ))}
          </div>
          <div className="section-footer">
            <Link to="/browse" className="view-all-btn">
              {t('landing.viewAll')} →
            </Link>
          </div>
        </section>
      )}

      {/* Trending Content Section */}
      <section className="trending-section">
        <div className="section-header">
          <h2 className="section-title">{t('landing.trendingContent')}</h2>
        </div>
        <div className="trending-grid">
          <Link to="/browse?sort=featured" className="trending-card">
            <span className="trending-badge badge-blue">FILM INSIDER</span>
            <h3 className="trending-title">{t('landing.behindScenes')}</h3>
            <p className="trending-description">{t('landing.behindScenesDesc')}</p>
          </Link>
          
          <Link to="/browse?sort=trending" className="trending-card">
            <span className="trending-badge badge-cyan">CRITIC'S CHOICE</span>
            <h3 className="trending-title">{t('landing.topPicks')}</h3>
            <p className="trending-description">{t('landing.topPicksDesc')}</p>
          </Link>
          
          <Link to="/browse?sort=new" className="trending-card">
            <span className="trending-badge badge-orange">MOVIE BUFF</span>
            <h3 className="trending-title">{t('landing.newReleases')}</h3>
            <p className="trending-description">{t('landing.newReleasesDesc')}</p>
          </Link>
        </div>
      </section>

      {/* Now Showing Section */}
      {nowShowing.length > 0 && (
        <section className="content-section now-showing-section">
          <div className="section-header">
            <h2 className="section-title">{t('landing.nowShowing')}</h2>
          </div>
          <div className="movies-grid">
            {nowShowing.slice(0, 5).map(movie => (
              <MovieCard key={movie.id} movie={movie} showGenreBadge />
            ))}
          </div>
          <div className="section-footer">
            <Link to="/browse" className="view-all-btn">
              {t('landing.viewAll')} →
            </Link>
          </div>
        </section>
      )}

      {/* Trending Movies (as "Must-Watch") */}
      {trending.length > 0 && (
        <section className="content-section must-watch-section">
          <div className="section-header">
            <h2 className="section-title">{t('landing.mustWatch')}</h2>
          </div>
          <div className="movies-grid">
            {trending.map(movie => (
              <MovieCard key={movie.id} movie={movie} showRating />
            ))}
          </div>
          <div className="section-footer">
            <Link to="/browse" className="view-all-btn">
              {t('landing.viewAll')} →
            </Link>
          </div>
        </section>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default Home;
