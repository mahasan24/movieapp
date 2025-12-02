// C3.3 - Enhanced Admin Panel with Core Management Features
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const AdminEnhanced = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Overview data
  const [summary, setSummary] = useState(null);

  // Movies data
  const [movies, setMovies] = useState([]);
  const [editingMovie, setEditingMovie] = useState(null);
  const [tmdbSearchQuery, setTmdbSearchQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState([]);
  const [tmdbSearching, setTmdbSearching] = useState(false);

  // Theaters data
  const [theaters, setTheaters] = useState([]);
  const [editingTheater, setEditingTheater] = useState(null);
  const [showTheaterForm, setShowTheaterForm] = useState(false);

  // Showtimes data
  const [showtimes, setShowtimes] = useState([]);
  const [editingShowtime, setEditingShowtime] = useState(null);
  const [showShowtimeForm, setShowShowtimeForm] = useState(false);
  const [auditoriums, setAuditoriums] = useState([]);

  const token = localStorage.getItem('token');

  // Fetch overview summary
  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch movies
  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/movies`);
      if (res.ok) {
        const data = await res.json();
        setMovies(data);
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search TMDB
  const searchTMDB = async () => {
    if (!tmdbSearchQuery.trim()) return;
    
    setTmdbSearching(true);
    try {
      const res = await fetch(`${API_BASE}/movies/external/search?q=${encodeURIComponent(tmdbSearchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTmdbResults(data);
      } else {
        alert(t('admin.tmdbSearchFailed'));
      }
    } catch (err) {
      console.error('Error searching TMDB:', err);
      alert(t('admin.tmdbSearchFailed'));
    } finally {
      setTmdbSearching(false);
    }
  };

  // Import movie from TMDB
  const importFromTMDB = async (tmdbId) => {
    try {
      const res = await fetch(`${API_BASE}/movies/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tmdb_id: tmdbId, language: 'en' })
      });

      if (res.ok) {
        alert(t('admin.movieImported'));
        fetchMovies();
        setTmdbResults([]);
        setTmdbSearchQuery('');
      } else {
        const error = await res.json();
        alert(error.message || t('admin.importFailed'));
      }
    } catch (err) {
      console.error('Error importing movie:', err);
      alert(t('admin.importFailed'));
    }
  };

  // Update movie
  const updateMovie = async (movieId, updates) => {
    try {
      const res = await fetch(`${API_BASE}/movies/${movieId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        alert(t('admin.movieUpdated'));
        fetchMovies();
        setEditingMovie(null);
      } else {
        alert(t('admin.updateFailed'));
      }
    } catch (err) {
      console.error('Error updating movie:', err);
      alert(t('admin.updateFailed'));
    }
  };

  // Fetch theaters
  const fetchTheaters = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/theaters`);
      if (res.ok) {
        const data = await res.json();
        setTheaters(data);
      }
    } catch (err) {
      console.error('Error fetching theaters:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create/Update theater
  const saveTheater = async (theaterData) => {
    const method = theaterData.theater_id ? 'PUT' : 'POST';
    const url = theaterData.theater_id 
      ? `${API_BASE}/theaters/${theaterData.theater_id}`
      : `${API_BASE}/theaters`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(theaterData)
      });

      if (res.ok) {
        alert(theaterData.theater_id ? t('admin.theaterUpdated') : t('admin.theaterCreated'));
        fetchTheaters();
        setShowTheaterForm(false);
        setEditingTheater(null);
      } else {
        alert(t('admin.operationFailed'));
      }
    } catch (err) {
      console.error('Error saving theater:', err);
      alert(t('admin.operationFailed'));
    }
  };

  // Delete theater
  const deleteTheater = async (theaterId) => {
    if (!confirm(t('admin.confirmDelete'))) return;

    try {
      const res = await fetch(`${API_BASE}/theaters/${theaterId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        alert(t('admin.theaterDeleted'));
        fetchTheaters();
      } else {
        alert(t('admin.deleteFailed'));
      }
    } catch (err) {
      console.error('Error deleting theater:', err);
      alert(t('admin.deleteFailed'));
    }
  };

  // Fetch showtimes
  const fetchShowtimes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/showtimes`);
      if (res.ok) {
        const data = await res.json();
        setShowtimes(data);
      }
    } catch (err) {
      console.error('Error fetching showtimes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch auditoriums
  const fetchAuditoriums = async () => {
    try {
      const res = await fetch(`${API_BASE}/auditoriums`);
      if (res.ok) {
        const data = await res.json();
        setAuditoriums(data);
      }
    } catch (err) {
      console.error('Error fetching auditoriums:', err);
    }
  };

  // Save showtime
  const saveShowtime = async (showtimeData) => {
    const method = showtimeData.showtime_id ? 'PUT' : 'POST';
    const url = showtimeData.showtime_id
      ? `${API_BASE}/showtimes/${showtimeData.showtime_id}`
      : `${API_BASE}/showtimes`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(showtimeData)
      });

      if (res.ok) {
        alert(showtimeData.showtime_id ? t('admin.showtimeUpdated') : t('admin.showtimeCreated'));
        fetchShowtimes();
        setShowShowtimeForm(false);
        setEditingShowtime(null);
      } else {
        alert(t('admin.operationFailed'));
      }
    } catch (err) {
      console.error('Error saving showtime:', err);
      alert(t('admin.operationFailed'));
    }
  };

  // Delete showtime
  const deleteShowtime = async (showtimeId) => {
    if (!confirm(t('admin.confirmDelete'))) return;

    try {
      const res = await fetch(`${API_BASE}/showtimes/${showtimeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        alert(t('admin.showtimeDeleted'));
        fetchShowtimes();
      } else {
        alert(t('admin.deleteFailed'));
      }
    } catch (err) {
      console.error('Error deleting showtime:', err);
      alert(t('admin.deleteFailed'));
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (!user) return;

    switch (activeTab) {
      case 'overview':
      case 'statistics':
      case 'topMovies':
        if (!summary) fetchSummary();
        break;
      case 'movies':
        if (movies.length === 0) fetchMovies();
        break;
      case 'theaters':
        if (theaters.length === 0) fetchTheaters();
        break;
      case 'showtimes':
        if (showtimes.length === 0) fetchShowtimes();
        if (auditoriums.length === 0) fetchAuditoriums();
        if (movies.length === 0) fetchMovies();
        break;
    }
  }, [activeTab, user]);

  if (loading && !summary && movies.length === 0) {
    return (
      <div className="admin-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>{t('admin.loading')}</p>
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
            📊 {t('admin.overview')}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'movies' ? 'active' : ''}`}
            onClick={() => setActiveTab('movies')}
          >
            🎬 {t('admin.movies')}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'theaters' ? 'active' : ''}`}
            onClick={() => setActiveTab('theaters')}
          >
            🏛️ {t('admin.theaters')}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'showtimes' ? 'active' : ''}`}
            onClick={() => setActiveTab('showtimes')}
          >
            🎞️ {t('admin.showtimes')}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            📈 {t('admin.statistics')}
          </button>
        </div>

        {/* Overview Tab */}
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
                    €{Number(summary.revenue?.total_revenue || 0).toFixed(2)}
                  </div>
                  <div className="stat-label">{t('admin.totalRevenue')}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Movies Tab */}
        {activeTab === 'movies' && (
          <MoviesTab
            movies={movies}
            editingMovie={editingMovie}
            setEditingMovie={setEditingMovie}
            updateMovie={updateMovie}
            tmdbSearchQuery={tmdbSearchQuery}
            setTmdbSearchQuery={setTmdbSearchQuery}
            tmdbResults={tmdbResults}
            tmdbSearching={tmdbSearching}
            searchTMDB={searchTMDB}
            importFromTMDB={importFromTMDB}
            t={t}
          />
        )}

        {/* Theaters Tab */}
        {activeTab === 'theaters' && (
          <TheatersTab
            theaters={theaters}
            showTheaterForm={showTheaterForm}
            setShowTheaterForm={setShowTheaterForm}
            editingTheater={editingTheater}
            setEditingTheater={setEditingTheater}
            saveTheater={saveTheater}
            deleteTheater={deleteTheater}
            t={t}
          />
        )}

        {/* Showtimes Tab */}
        {activeTab === 'showtimes' && (
          <ShowtimesTab
            showtimes={showtimes}
            movies={movies}
            auditoriums={auditoriums}
            showShowtimeForm={showShowtimeForm}
            setShowShowtimeForm={setShowShowtimeForm}
            editingShowtime={editingShowtime}
            setEditingShowtime={setEditingShowtime}
            saveShowtime={saveShowtime}
            deleteShowtime={deleteShowtime}
            t={t}
          />
        )}

        {/* Statistics Tab */}
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
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Movies Tab Component
const MoviesTab = ({
  movies, editingMovie, setEditingMovie, updateMovie,
  tmdbSearchQuery, setTmdbSearchQuery, tmdbResults, tmdbSearching,
  searchTMDB, importFromTMDB, t
}) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (editingMovie) {
      setFormData(editingMovie);
    }
  }, [editingMovie]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMovie(formData.id, formData);
  };

  return (
    <div className="tab-content">
      {/* TMDB Import Section */}
      <div className="tmdb-import-section">
        <h3>🔍 {t('admin.importFromTMDB')}</h3>
        <div className="search-form">
          <input
            type="text"
            value={tmdbSearchQuery}
            onChange={(e) => setTmdbSearchQuery(e.target.value)}
            placeholder={t('admin.searchTMDB')}
            onKeyPress={(e) => e.key === 'Enter' && searchTMDB()}
          />
          <button onClick={searchTMDB} disabled={tmdbSearching}>
            {tmdbSearching ? t('admin.searching') : t('admin.search')}
          </button>
        </div>

        {tmdbResults.length > 0 && (
          <div className="tmdb-results">
            {tmdbResults.map((movie) => (
              <div key={movie.tmdb_id} className="tmdb-result-card">
                <img src={movie.poster_url || 'https://via.placeholder.com/100x150'} alt={movie.title} />
                <div className="tmdb-info">
                  <h4>{movie.title}</h4>
                  <p>{movie.year}</p>
                  <button onClick={() => importFromTMDB(movie.tmdb_id)}>
                    {t('admin.import')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Movies List */}
      <div className="movies-list-section">
        <h3>📝 {t('admin.manageMovies')}</h3>
        <div className="movies-table">
          {movies.map((movie) => (
            <div key={movie.id} className="movie-row">
              {editingMovie?.id === movie.id ? (
                <form onSubmit={handleSubmit} className="edit-form">
                  <input
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={t('admin.title')}
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={formData.rating || ''}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                    placeholder={t('admin.rating')}
                  />
                  <div className="form-buttons">
                    <button type="submit">{t('admin.save')}</button>
                    <button type="button" onClick={() => setEditingMovie(null)}>{t('admin.cancel')}</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="movie-info">
                    <h4>{movie.title}</h4>
                    <span>⭐ {movie.rating}/10</span>
                    <span>📅 {movie.year}</span>
                  </div>
                  <button onClick={() => setEditingMovie(movie)}>{t('admin.edit')}</button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Theaters Tab Component
const TheatersTab = ({
  theaters, showTheaterForm, setShowTheaterForm, editingTheater,
  setEditingTheater, saveTheater, deleteTheater, t
}) => {
  const [formData, setFormData] = useState({
    name: '', address: '', city: '', phone: '', total_auditoriums: 0
  });

  useEffect(() => {
    if (editingTheater) {
      setFormData(editingTheater);
      setShowTheaterForm(true);
    }
  }, [editingTheater]);

  const handleSubmit = (e) => {
    e.preventDefault();
    saveTheater(formData);
    setFormData({ name: '', address: '', city: '', phone: '', total_auditoriums: 0 });
  };

  return (
    <div className="tab-content">
      <div className="section-header">
        <h3>{t('admin.theaters')}</h3>
        <button onClick={() => {
          setShowTheaterForm(!showTheaterForm);
          setEditingTheater(null);
          setFormData({ name: '', address: '', city: '', phone: '', total_auditoriums: 0 });
        }}>
          {showTheaterForm ? t('admin.cancel') : `+ ${t('admin.addTheater')}`}
        </button>
      </div>

      {showTheaterForm && (
        <form onSubmit={handleSubmit} className="crud-form">
          <input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t('admin.theaterName')}
            required
          />
          <input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder={t('admin.address')}
          />
          <input
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder={t('admin.city')}
          />
          <input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder={t('admin.phone')}
          />
          <button type="submit">{editingTheater ? t('admin.update') : t('admin.create')}</button>
        </form>
      )}

      <div className="theaters-list">
        {theaters.map((theater) => (
          <div key={theater.theater_id} className="theater-card">
            <h4>{theater.name}</h4>
            <p>📍 {theater.city}</p>
            <p>📞 {theater.phone}</p>
            <div className="card-actions">
              <button onClick={() => setEditingTheater(theater)}>{t('admin.edit')}</button>
              <button onClick={() => deleteTheater(theater.theater_id)} className="delete-btn">
                {t('admin.delete')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Showtimes Tab Component
const ShowtimesTab = ({
  showtimes, movies, auditoriums, showShowtimeForm, setShowShowtimeForm,
  editingShowtime, setEditingShowtime, saveShowtime, deleteShowtime, t
}) => {
  const [formData, setFormData] = useState({
    movie_id: '', auditorium_id: '', show_date: '', show_time: '', price: '', available_seats: ''
  });

  useEffect(() => {
    if (editingShowtime) {
      setFormData(editingShowtime);
      setShowShowtimeForm(true);
    }
  }, [editingShowtime]);

  const handleSubmit = (e) => {
    e.preventDefault();
    saveShowtime({
      ...formData,
      price: parseFloat(formData.price),
      available_seats: parseInt(formData.available_seats)
    });
    setFormData({ movie_id: '', auditorium_id: '', show_date: '', show_time: '', price: '', available_seats: '' });
  };

  return (
    <div className="tab-content">
      <div className="section-header">
        <h3>{t('admin.showtimes')}</h3>
        <button onClick={() => {
          setShowShowtimeForm(!showShowtimeForm);
          setEditingShowtime(null);
          setFormData({ movie_id: '', auditorium_id: '', show_date: '', show_time: '', price: '', available_seats: '' });
        }}>
          {showShowtimeForm ? t('admin.cancel') : `+ ${t('admin.addShowtime')}`}
        </button>
      </div>

      {showShowtimeForm && (
        <form onSubmit={handleSubmit} className="crud-form">
          <select
            value={formData.movie_id}
            onChange={(e) => setFormData({ ...formData, movie_id: e.target.value })}
            required
          >
            <option value="">{t('admin.selectMovie')}</option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>{movie.title}</option>
            ))}
          </select>
          <select
            value={formData.auditorium_id}
            onChange={(e) => setFormData({ ...formData, auditorium_id: e.target.value })}
            required
          >
            <option value="">{t('admin.selectAuditorium')}</option>
            {auditoriums.map((aud) => (
              <option key={aud.auditorium_id} value={aud.auditorium_id}>
                {aud.theater_name} - {aud.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={formData.show_date}
            onChange={(e) => setFormData({ ...formData, show_date: e.target.value })}
            required
          />
          <input
            type="time"
            value={formData.show_time}
            onChange={(e) => setFormData({ ...formData, show_time: e.target.value })}
            required
          />
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder={t('admin.price')}
            required
          />
          <input
            type="number"
            value={formData.available_seats}
            onChange={(e) => setFormData({ ...formData, available_seats: e.target.value })}
            placeholder={t('admin.availableSeats')}
            required
          />
          <button type="submit">{editingShowtime ? t('admin.update') : t('admin.create')}</button>
        </form>
      )}

      <div className="showtimes-list">
        {showtimes.map((showtime) => (
          <div key={showtime.showtime_id} className="showtime-card">
            <h4>{showtime.movie_title}</h4>
            <p>🏛️ {showtime.theater_name} - {showtime.auditorium_name}</p>
            <p>📅 {new Date(showtime.show_date).toLocaleDateString()}</p>
            <p>🕐 {showtime.show_time}</p>
            <p>💰 €{showtime.price}</p>
            <p>🪑 {showtime.available_seats} seats</p>
            <div className="card-actions">
              <button onClick={() => setEditingShowtime(showtime)}>{t('admin.edit')}</button>
              <button onClick={() => deleteShowtime(showtime.showtime_id)} className="delete-btn">
                {t('admin.delete')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminEnhanced;


