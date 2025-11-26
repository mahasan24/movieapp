import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { t, i18n } = useTranslation();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            🎬 {t('navbar.brand')}
          </Link>
          <Link to="/browse" className="nav-link">{t('navbar.browseMovies')}</Link>
        </div>
        
        <div className="navbar-right">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              className="search-input"
              placeholder={t('navbar.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-submit-btn">🔍</button>
          </form>

          {/* Language Switcher */}
          <div className="language-switcher">
            <button 
              className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
              onClick={() => changeLanguage('en')}
            >
              EN
            </button>
            <span className="lang-divider">/</span>
            <button 
              className={`lang-btn ${i18n.language === 'fi' ? 'active' : ''}`}
              onClick={() => changeLanguage('fi')}
            >
              FI
            </button>
          </div>
          
          {!user && (
            <>
              <span className="guest-text">{t('navbar.guestText')}</span>
              <Link to="/login" className="login-btn">{t('navbar.login')}</Link>
            </>
          )}
          {user && (
            <>
              <span className="welcome-text">{t('navbar.welcome')}, {user?.name || 'User'}</span>
              {isAdmin && (
                <Link to="/admin" className="admin-link">{t('navbar.admin')}</Link>
              )}
              <Link to="/account" className="account-link">{t('navbar.myAccount')}</Link>
              <button className="logout-btn" onClick={signOut}>
                {t('navbar.logout')}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar