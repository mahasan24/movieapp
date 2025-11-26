import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const Admin = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/admin/summary`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        } else {
          throw new Error('Failed to fetch admin summary');
        }
      } catch (err) {
        console.error('Error fetching admin summary:', err);
        setError(t('admin.errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSummary();
    }
  }, [user, t]);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>{t('admin.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1>{t('admin.title')}</h1>

        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            {t('admin.overview')}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            {t('admin.statistics')}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'topMovies' ? 'active' : ''}`}
            onClick={() => setActiveTab('topMovies')}
          >
            {t('admin.topMovies')}
          </button>
        </div>

        {activeTab === 'overview' && summary && (
          <div className="tab-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <div className="stat-value">{summary.counts?.total_users || 0}</div>
                  <div className="stat-label">{t('admin.totalUsers')}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🎬</div>
                <div className="stat-info">
                  <div className="stat-value">{summary.counts?.total_movies || 0}</div>
                  <div className="stat-label">{t('admin.totalMovies')}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🏛️</div>
                <div className="stat-info">
                  <div className="stat-value">{summary.counts?.total_theaters || 0}</div>
                  <div className="stat-label">{t('admin.totalTheaters')}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🎞️</div>
                <div className="stat-info">
                  <div className="stat-value">{summary.counts?.active_showtimes || 0}</div>
                  <div className="stat-label">{t('admin.activeShowtimes')}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🎟️</div>
                <div className="stat-info">
                  <div className="stat-value">{summary.counts?.active_bookings || 0}</div>
                  <div className="stat-label">{t('admin.activeBookings')}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <div className="stat-value">
                    ${Number(summary.revenue?.total_revenue || 0).toFixed(2)}
                  </div>
                  <div className="stat-label">{t('admin.totalRevenue')}</div>
                </div>
              </div>
            </div>

            <div className="revenue-cards">
              <div className="revenue-card">
                <h3>{t('admin.revenue30Days')}</h3>
                <p className="revenue-amount">
                  ${Number(summary.revenue?.revenue_last_30_days || 0).toFixed(2)}
                </p>
              </div>
              <div className="revenue-card">
                <h3>{t('admin.completedRevenue')}</h3>
                <p className="revenue-amount">
                  ${Number(summary.revenue?.completed_revenue || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'statistics' && summary && (
          <div className="tab-content">
            <div className="stats-table">
              <h3>{t('admin.userStatistics')}</h3>
              <table>
                <tbody>
                  <tr>
                    <td>{t('admin.adminUsers')}</td>
                    <td className="value">{summary.users?.admin_count || 0}</td>
                  </tr>
                  <tr>
                    <td>{t('admin.regularUsers')}</td>
                    <td className="value">{summary.users?.user_count || 0}</td>
                  </tr>
                  <tr>
                    <td>{t('admin.newUsers30Days')}</td>
                    <td className="value">{summary.users?.new_users_last_30_days || 0}</td>
                  </tr>
                </tbody>
              </table>

              <h3 className="section-title">{t('admin.bookingStatistics')}</h3>
              <table>
                <tbody>
                  <tr>
                    <td>{t('admin.activeBookings')}</td>
                    <td className="value">{summary.counts?.active_bookings || 0}</td>
                  </tr>
                  <tr>
                    <td>{t('admin.cancelledBookings')}</td>
                    <td className="value">{summary.counts?.cancelled_bookings || 0}</td>
                  </tr>
                  <tr>
                    <td>{t('admin.recentBookings')}</td>
                    <td className="value">{summary.recent_bookings_count || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'topMovies' && summary && (
          <div className="tab-content">
            <h3>{t('admin.topMoviesByBookings')}</h3>
            {summary.top_movies && summary.top_movies.length > 0 ? (
              <div className="top-movies-list">
                {summary.top_movies.map((movie, index) => (
                  <div key={movie.id} className="top-movie-card">
                    <div className="movie-rank">#{index + 1}</div>
                    <img 
                      src={movie.poster_url || 'https://via.placeholder.com/100x150'} 
                      alt={movie.title}
                      className="movie-poster-small"
                    />
                    <div className="movie-info">
                      <h4>{movie.title}</h4>
                      <div className="movie-stats">
                        <span>📊 {movie.total_bookings} {t('admin.bookings')}</span>
                        <span>🎟️ {movie.total_seats_sold} {t('admin.seatsSold')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>{t('admin.noTopMovies')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;

