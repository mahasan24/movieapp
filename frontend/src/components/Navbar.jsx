import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          🎬 {t('navbar.brand')}
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-center">
          <Link to="/now-showing" className="nav-link nav-link-highlight">{t('navbar.nowShowing')}</Link>
          <Link to="/browse" className="nav-link">{t('navbar.browseMovies')}</Link>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              className="search-input"
              placeholder={t('navbar.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn" aria-label="Search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          </form>
        </div>

        {/* Desktop Right Section */}
        <div className="navbar-right">
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
              <span className="welcome-text">{t('navbar.guestText')}</span>
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

        {/* Hamburger Button (mobile only) */}
        <button 
          className={`hamburger-btn ${mobileMenuOpen ? 'open' : ''}`} 
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <form onSubmit={handleSearch} className="mobile-search-form">
          <input
            type="text"
            placeholder={t('navbar.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </form>

        <Link to="/now-showing" className="mobile-nav-link mobile-nav-highlight" onClick={closeMobileMenu}>
          🎬 {t('navbar.nowShowing')}
        </Link>

        <Link to="/browse" className="mobile-nav-link" onClick={closeMobileMenu}>
          {t('navbar.browseMovies')}
        </Link>

        <div className="mobile-language-switcher">
          <button 
            className={i18n.language === 'en' ? 'active' : ''}
            onClick={() => changeLanguage('en')}
          >
            English
          </button>
          <button 
            className={i18n.language === 'fi' ? 'active' : ''}
            onClick={() => changeLanguage('fi')}
          >
            Suomi
          </button>
        </div>

        {!user && (
          <Link to="/login" className="mobile-login-btn" onClick={closeMobileMenu}>
            {t('navbar.login')}
          </Link>
        )}

        {user && (
          <>
            <div className="mobile-user-info">
              {t('navbar.welcome')}, {user?.name || 'User'}
            </div>
            {isAdmin && (
              <Link to="/admin" className="mobile-nav-link" onClick={closeMobileMenu}>
                {t('navbar.admin')}
              </Link>
            )}
            <Link to="/account" className="mobile-nav-link" onClick={closeMobileMenu}>
              {t('navbar.myAccount')}
            </Link>
            <button className="mobile-logout-btn" onClick={() => { signOut(); closeMobileMenu(); }}>
              {t('navbar.logout')}
            </button>
          </>
        )}
      </div>

      {/* Overlay */}
      {mobileMenuOpen && <div className="mobile-overlay" onClick={closeMobileMenu}></div>}
    </nav>
  )
}

export default Navbar
