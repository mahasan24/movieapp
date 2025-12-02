// C3.2 - Enhanced User Dashboard
import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import './Account.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const Account = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // active, past, cancelled

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/bookings/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setBookings(data);
        } else {
          throw new Error('Failed to fetch bookings');
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(t('account.errorLoadingBookings'));
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user, t]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm(t('account.confirmCancel'))) return;

    // Optimistic UI update
    const bookingToCancel = bookings.find(b => b.booking_id === bookingId);
    setBookings(bookings.map(b => 
      b.booking_id === bookingId ? { ...b, status: 'cancelled', cancelling: true } : b
    ));

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        // Update confirmed
        setBookings(bookings.map(b => 
          b.booking_id === bookingId ? { ...b, status: 'cancelled', cancelling: false } : b
        ));
        alert(t('account.bookingCancelled'));
      } else {
        // Revert on failure
        setBookings(bookings.map(b => 
          b.booking_id === bookingId ? bookingToCancel : b
        ));
        alert(t('account.cancelFailed'));
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      // Revert on error
      setBookings(bookings.map(b => 
        b.booking_id === bookingId ? bookingToCancel : b
      ));
      alert(t('account.cancelFailed'));
    }
  };

  // Filter bookings by tab
  const filteredBookings = useMemo(() => {
    const now = new Date();
    return bookings.filter(booking => {
      const showDateTime = new Date(`${booking.show_date} ${booking.show_time}`);
      
      switch (activeTab) {
        case 'active':
          return booking.status === 'confirmed' && showDateTime >= now;
        case 'past':
          return booking.status === 'confirmed' && showDateTime < now;
        case 'cancelled':
          return booking.status === 'cancelled';
        default:
          return true;
      }
    });
  }, [bookings, activeTab]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'cancelled': return 'status-cancelled';
      case 'completed': return 'status-completed';
      default: return '';
    }
  };

  return (
    <div className="account-page">
      <div className="account-container">
        <h1>{t('account.title')}</h1>

        {/* Profile Section */}
        <section className="profile-section">
          <h2>{t('account.profile')}</h2>
          <div className="profile-info">
            <div className="info-item">
              <span className="info-label">{t('account.name')}:</span>
              <span className="info-value">{user?.name || t('common.notAvailable')}</span>
            </div>
            <div className="info-item">
              <span className="info-label">{t('account.email')}:</span>
              <span className="info-value">{user?.email || t('common.notAvailable')}</span>
            </div>
            <div className="info-item">
              <span className="info-label">{t('account.role')}:</span>
              <span className="info-value">{user?.role ? 'Admin' : 'User'}</span>
            </div>
            {user?.created_at && (
              <div className="info-item">
                <span className="info-label">{t('account.memberSince')}:</span>
                <span className="info-value">{formatDate(user.created_at)}</span>
              </div>
            )}
          </div>
        </section>

        {/* Bookings Section with Tabs */}
        <section className="bookings-section">
          <h2>{t('account.myBookings')}</h2>

          {/* Booking Tabs */}
          <div className="booking-tabs">
            <button
              className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              🎟️ {t('account.activeBookings')}
            </button>
            <button
              className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
              onClick={() => setActiveTab('past')}
            >
              ✅ {t('account.pastBookings')}
            </button>
            <button
              className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
              onClick={() => setActiveTab('cancelled')}
            >
              ❌ {t('account.cancelledBookings')}
            </button>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>{t('account.loadingBookings')}</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && filteredBookings.length === 0 && (
            <div className="empty-state">
              <p>{t('account.noBookingsInCategory')}</p>
            </div>
          )}

          {!loading && !error && filteredBookings.length > 0 && (
            <div className="bookings-grid">
              {filteredBookings.map(booking => (
                <div key={booking.booking_id} className="rich-booking-card">
                  {/* Movie Poster */}
                  <div className="booking-poster">
                    {booking.poster_url ? (
                      <img src={booking.poster_url} alt={booking.movie_title} />
                    ) : (
                      <div className="poster-placeholder">🎬</div>
                    )}
                    <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                      {t(`account.${booking.status}`)}
                    </span>
                  </div>

                  {/* Booking Info */}
                  <div className="booking-content">
                    <h3 className="movie-title">{booking.movie_title}</h3>
                    
                    <div className="booking-meta">
                      <div className="meta-item">
                        <span className="meta-icon">🏛️</span>
                        <span className="meta-text">{booking.theater_name}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">📍</span>
                        <span className="meta-text">{booking.city}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">🎭</span>
                        <span className="meta-text">{booking.auditorium_name}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">📅</span>
                        <span className="meta-text">{formatDate(booking.show_date)}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">🕐</span>
                        <span className="meta-text">{booking.show_time}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">🪑</span>
                        <span className="meta-text">{booking.number_of_seats} {t('account.seats')}</span>
                      </div>
                    </div>

                    <div className="booking-footer">
                      <div className="booking-price">
                        <span className="price-label">{t('account.totalPrice')}:</span>
                        <span className="price-value">€{booking.total_price}</span>
                      </div>
                      <div className="booking-id-small">#{booking.booking_id}</div>
                    </div>

                    {booking.status === 'confirmed' && !booking.cancelling && (
                      <button 
                        className="cancel-booking-btn"
                        onClick={() => handleCancelBooking(booking.booking_id)}
                      >
                        🗑️ {t('account.cancelBooking')}
                      </button>
                    )}

                    {booking.cancelling && (
                      <button className="cancel-booking-btn" disabled>
                        {t('account.cancelling')}...
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Account;

