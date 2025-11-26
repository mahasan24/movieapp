import React, { useEffect, useState } from 'react';
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
    if (!window.confirm(t('common.confirm'))) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setBookings(bookings.map(b => 
          b.booking_id === bookingId ? { ...b, status: 'cancelled' } : b
        ));
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
    }
  };

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

        {/* Bookings Section */}
        <section className="bookings-section">
          <h2>{t('account.myBookings')}</h2>

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

          {!loading && !error && bookings.length === 0 && (
            <div className="empty-state">
              <p>{t('account.noBookings')}</p>
            </div>
          )}

          {!loading && !error && bookings.length > 0 && (
            <div className="bookings-list">
              {bookings.map(booking => (
                <div key={booking.booking_id} className="booking-card">
                  <div className="booking-header">
                    <span className="booking-id">
                      {t('account.bookingId')}: #{booking.booking_id}
                    </span>
                    <span className={`booking-status ${getStatusBadgeClass(booking.status)}`}>
                      {t(`account.${booking.status}`)}
                    </span>
                  </div>

                  <div className="booking-details">
                    <div className="detail-row">
                      <span className="detail-label">{t('account.movie')}:</span>
                      <span className="detail-value">{booking.movie_title}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t('account.theater')}:</span>
                      <span className="detail-value">
                        {booking.theater_name} - {booking.auditorium_name}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t('account.showtime')}:</span>
                      <span className="detail-value">
                        {formatDate(booking.show_date)} at {booking.show_time}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t('account.seats')}:</span>
                      <span className="detail-value">{booking.number_of_seats}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t('account.totalPrice')}:</span>
                      <span className="detail-value price">${booking.total_price}</span>
                    </div>
                  </div>

                  {booking.status === 'confirmed' && (
                    <button 
                      className="cancel-btn"
                      onClick={() => handleCancelBooking(booking.booking_id)}
                    >
                      {t('account.cancelBooking')}
                    </button>
                  )}
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

