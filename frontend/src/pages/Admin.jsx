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
  
  // Auditoriums data
  const [auditoriums, setAuditoriums] = useState([]);
  const [editingAuditorium, setEditingAuditorium] = useState(null);
  const [showAuditoriumForm, setShowAuditoriumForm] = useState(false);

  // Bookings data
  const [bookings, setBookings] = useState([]);

  const token = localStorage.getItem('token');

  const isShowtimePast = (booking) => {
    if (!booking?.show_date) return false;
    const showDate = new Date(booking.show_date);
    if (booking.show_time) {
      const [hours, minutes] = booking.show_time.split(':');
      showDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    }
    return showDate < new Date();
  };

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

  // Import movie from TMDB with selected language
  const importFromTMDB = async (tmdbId, language = 'en') => {
    try {
      const res = await fetch(`${API_BASE}/movies/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tmdb_id: tmdbId, language: language })
      });

      if (res.ok) {
        const movie = await res.json();
        alert(`${t('admin.movieImported')}\n\nTitle: ${movie.title}\nDirector: ${movie.director || 'N/A'}\nDuration: ${movie.duration ? movie.duration + ' min' : 'N/A'}`);
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

  // Add movie manually
  const addMovie = async (movieData) => {
    try {
      const res = await fetch(`${API_BASE}/movies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(movieData)
      });

      if (res.ok) {
        alert('Movie added successfully!');
        fetchMovies();
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to add movie');
      }
    } catch (err) {
      console.error('Error adding movie:', err);
      alert('Failed to add movie');
    }
  };

  // Delete movie
  const deleteMovie = async (movieId) => {
    if (!confirm('Are you sure you want to delete this movie?')) return;

    try {
      const res = await fetch(`${API_BASE}/movies/${movieId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        alert('Movie deleted successfully!');
        fetchMovies();
      } else {
        alert('Failed to delete movie');
      }
    } catch (err) {
      console.error('Error deleting movie:', err);
      alert('Failed to delete movie');
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
    const method = theaterData.id ? 'PUT' : 'POST';
    const url = theaterData.id 
      ? `${API_BASE}/theaters/${theaterData.id}`
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

  // Fetch bookings
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cancel booking
  const cancelBooking = async (bookingId) => {
    const bookingToCancel = bookings.find(b => b.booking_id === bookingId);
    if (bookingToCancel && isShowtimePast(bookingToCancel)) {
      alert(t('admin.operationFailed'));
      return;
    }

    if (!confirm(t('admin.confirmCancelBooking'))) return;

    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        alert(t('admin.bookingCancelled'));
        fetchBookings();
      } else {
        const data = await res.json();
        alert(data.message || t('admin.operationFailed'));
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert(t('admin.operationFailed'));
    }
  };

  // Save auditorium
  const saveAuditorium = async (auditoriumData) => {
    const method = auditoriumData.auditorium_id ? 'PUT' : 'POST';
    const url = auditoriumData.auditorium_id
      ? `${API_BASE}/auditoriums/${auditoriumData.auditorium_id}`
      : `${API_BASE}/auditoriums`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(auditoriumData)
      });

      if (res.ok) {
        alert(auditoriumData.auditorium_id ? t('admin.auditoriumUpdated') : t('admin.auditoriumCreated'));
        fetchAuditoriums();
        setShowAuditoriumForm(false);
        setEditingAuditorium(null);
      } else {
        alert(t('admin.operationFailed'));
      }
    } catch (err) {
      console.error('Error saving auditorium:', err);
      alert(t('admin.operationFailed'));
    }
  };

  // Delete auditorium
  const deleteAuditorium = async (auditoriumId) => {
    if (!confirm(t('admin.confirmDelete'))) return;

    try {
      const res = await fetch(`${API_BASE}/auditoriums/${auditoriumId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        alert(t('admin.auditoriumDeleted'));
        fetchAuditoriums();
      } else {
        alert(t('admin.deleteFailed'));
      }
    } catch (err) {
      console.error('Error deleting auditorium:', err);
      alert(t('admin.deleteFailed'));
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
      case 'auditoriums':
        if (auditoriums.length === 0) fetchAuditoriums();
        if (theaters.length === 0) fetchTheaters();
        break;
      case 'showtimes':
        if (showtimes.length === 0) fetchShowtimes();
        if (auditoriums.length === 0) fetchAuditoriums();
        if (movies.length === 0) fetchMovies();
        break;
      case 'bookings':
        if (bookings.length === 0) fetchBookings();
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
            className={`tab-btn ${activeTab === 'auditoriums' ? 'active' : ''}`}
            onClick={() => setActiveTab('auditoriums')}
          >
            🎭 {t('admin.auditoriums')}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'showtimes' ? 'active' : ''}`}
            onClick={() => setActiveTab('showtimes')}
          >
            🎞️ {t('admin.showtimes')}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            🎟️ {t('admin.bookings')}
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
                    €{Number(summary.revenue?.total || summary.revenue?.total_revenue || 0).toFixed(2)}
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
            onAddMovie={addMovie}
            onDeleteMovie={deleteMovie}
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

        {/* Auditoriums Tab */}
        {activeTab === 'auditoriums' && (
          <AuditoriumsTab
            auditoriums={auditoriums}
            theaters={theaters}
            showAuditoriumForm={showAuditoriumForm}
            setShowAuditoriumForm={setShowAuditoriumForm}
            editingAuditorium={editingAuditorium}
            setEditingAuditorium={setEditingAuditorium}
            saveAuditorium={saveAuditorium}
            deleteAuditorium={deleteAuditorium}
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

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <BookingsTab
            bookings={bookings}
            cancelBooking={cancelBooking}
            refreshBookings={fetchBookings}
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
  searchTMDB, importFromTMDB, t, onAddMovie, onDeleteMovie
}) => {
  const [formData, setFormData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newMovie, setNewMovie] = useState({
    title: '', description: '', genre: '', year: '', rating: '',
    poster_url: '', duration: '', director: '', cast: ''
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 10;
  const totalPages = Math.ceil(movies.length / moviesPerPage);
  const startIndex = (currentPage - 1) * moviesPerPage;
  const paginatedMovies = movies.slice(startIndex, startIndex + moviesPerPage);
  
  // Import language selection
  const [importLanguage, setImportLanguage] = useState('en');

  useEffect(() => {
    if (editingMovie) {
      // Explicitly set all fields from the movie data
      setFormData({
        id: editingMovie.id,
        title: editingMovie.title || '',
        year: editingMovie.year || '',
        rating: editingMovie.rating || '',
        duration: editingMovie.duration || '',
        genre: editingMovie.genre || '',
        director: editingMovie.director || '',
        cast: editingMovie.cast || '',
        description: editingMovie.description || '',
        poster_url: editingMovie.poster_url || '',
        language: editingMovie.language || '',
        original_language: editingMovie.original_language || '',
        tmdb_id: editingMovie.tmdb_id || null,
        popularity: editingMovie.popularity || null,
        release_date: editingMovie.release_date || '',
        is_featured: editingMovie.is_featured || false,
        is_trending_managed: editingMovie.is_trending_managed || false
      });
      setShowEditModal(true);
    }
  }, [editingMovie]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMovie(formData.id, formData);
    setShowEditModal(false);
    setEditingMovie(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingMovie(null);
    setFormData({});
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    if (onAddMovie) {
      await onAddMovie(newMovie);
      setNewMovie({
        title: '', description: '', genre: '', year: '', rating: '',
        poster_url: '', duration: '', director: '', cast: ''
      });
      setShowAddForm(false);
    }
  };

  return (
    <div className="tab-content">
      {/* Action Buttons Row */}
      <div className="movies-actions">
        <button 
          className={`action-btn ${showAddForm ? 'cancel' : 'primary'}`}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '✕ Cancel' : '➕ Add Movie Manually'}
        </button>
      </div>

      {/* Manual Add Movie Form */}
      {showAddForm && (
        <div className="add-movie-form-section">
          <h3>➕ Add New Movie</h3>
          <form onSubmit={handleAddMovie} className="add-movie-form">
            <div className="form-row">
              <input
                value={newMovie.title}
                onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                placeholder="Movie Title *"
                required
              />
              <input
                type="number"
                value={newMovie.year}
                onChange={(e) => setNewMovie({ ...newMovie, year: e.target.value })}
                placeholder="Year"
              />
            </div>
            <div className="form-row">
              <input
                value={newMovie.genre}
                onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
                placeholder="Genre (e.g., Action, Drama)"
              />
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={newMovie.rating}
                onChange={(e) => setNewMovie({ ...newMovie, rating: e.target.value })}
                placeholder="Rating (0-10)"
              />
            </div>
            <div className="form-row">
              <input
                value={newMovie.director}
                onChange={(e) => setNewMovie({ ...newMovie, director: e.target.value })}
                placeholder="Director"
              />
              <input
                type="number"
                value={newMovie.duration}
                onChange={(e) => setNewMovie({ ...newMovie, duration: e.target.value })}
                placeholder="Duration (minutes)"
              />
            </div>
            <input
              value={newMovie.poster_url}
              onChange={(e) => setNewMovie({ ...newMovie, poster_url: e.target.value })}
              placeholder="Poster URL"
              className="full-width"
            />
            <input
              value={newMovie.cast}
              onChange={(e) => setNewMovie({ ...newMovie, cast: e.target.value })}
              placeholder="Cast (comma-separated)"
              className="full-width"
            />
            <textarea
              value={newMovie.description}
              onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })}
              placeholder="Movie description..."
              rows={3}
              className="full-width"
            />
            <button type="submit" className="submit-btn">Add Movie</button>
          </form>
        </div>
      )}

      {/* Universal Search Section */}
      <div className="tmdb-import-section">
        <h3>🔍 Search Movies</h3>
        <div className="tmdb-search-form">
          <input
            type="text"
            value={tmdbSearchQuery}
            onChange={(e) => setTmdbSearchQuery(e.target.value)}
            placeholder="Search existing movies or TMDB..."
            onKeyPress={(e) => e.key === 'Enter' && searchTMDB()}
          />
          <select 
            value={importLanguage} 
            onChange={(e) => setImportLanguage(e.target.value)}
            className="language-select"
          >
            <option value="en">🇬🇧 English</option>
            <option value="fi">🇫🇮 Finnish</option>
            <option value="sv">🇸🇪 Swedish</option>
            <option value="de">🇩🇪 German</option>
            <option value="fr">🇫🇷 French</option>
            <option value="es">🇪🇸 Spanish</option>
            <option value="ja">🇯🇵 Japanese</option>
            <option value="ko">🇰🇷 Korean</option>
          </select>
          <button onClick={searchTMDB} disabled={tmdbSearching}>
            {tmdbSearching ? t('admin.searching') : t('admin.search')}
          </button>
        </div>

        {/* Existing Movies Search Results */}
        {tmdbSearchQuery.length >= 2 && (
          <div className="existing-movies-results">
            <h4>📚 Existing Movies</h4>
            {movies.filter(m => 
              m.title?.toLowerCase().includes(tmdbSearchQuery.toLowerCase()) ||
              m.director?.toLowerCase().includes(tmdbSearchQuery.toLowerCase()) ||
              m.genre?.toLowerCase().includes(tmdbSearchQuery.toLowerCase())
            ).slice(0, 5).map((movie) => (
              <div key={movie.id} className="existing-movie-card">
                <img src={movie.poster_url || 'https://via.placeholder.com/60x90'} alt={movie.title} />
                <div className="existing-movie-info">
                  <h5>{movie.title}</h5>
                  <p>{movie.year} • {movie.genre?.split(',')[0] || 'N/A'}</p>
                  <div className="existing-movie-badges">
                    {movie.is_featured && <span className="badge featured">⭐ Featured</span>}
                    {movie.is_trending_managed && <span className="badge trending">🔥 Trending</span>}
                  </div>
                </div>
                <button className="edit-existing-btn" onClick={() => setEditingMovie(movie)}>
                  ✏️ Edit
                </button>
              </div>
            ))}
            {movies.filter(m => 
              m.title?.toLowerCase().includes(tmdbSearchQuery.toLowerCase()) ||
              m.director?.toLowerCase().includes(tmdbSearchQuery.toLowerCase()) ||
              m.genre?.toLowerCase().includes(tmdbSearchQuery.toLowerCase())
            ).length === 0 && (
              <p className="no-results">No existing movies found for "{tmdbSearchQuery}"</p>
            )}
          </div>
        )}

        {/* TMDB Search Results */}
        {tmdbResults.length > 0 && (
          <div className="tmdb-results">
            <h4>🌐 TMDB Results</h4>
            <p className="import-hint">
              📝 Importing with <strong>{importLanguage.toUpperCase()}</strong> language
            </p>
            {tmdbResults.map((movie) => (
              <div key={movie.tmdb_id} className="tmdb-result-card">
                <img src={movie.poster_url || 'https://via.placeholder.com/100x150'} alt={movie.title} />
                <div className="tmdb-info">
                  <h4>{movie.title}</h4>
                  <p>{movie.year} • {movie.original_language?.toUpperCase() || 'N/A'}</p>
                  <button onClick={() => importFromTMDB(movie.tmdb_id, importLanguage)}>
                    {t('admin.import')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Movie Modal */}
      {showEditModal && formData.id && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="edit-movie-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Edit Movie</h3>
              <button className="modal-close" onClick={closeEditModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="edit-movie-form">
              <div className="modal-body">
                {/* Movie Poster Preview */}
                <div className="edit-poster-section">
                  <img 
                    src={formData.poster_url || 'https://via.placeholder.com/200x300'} 
                    alt={formData.title}
                    className="edit-poster-preview"
                  />
                  <input
                    value={formData.poster_url || ''}
                    onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                    placeholder="Poster URL"
                    className="poster-url-input"
                  />
                </div>

                {/* Movie Details */}
                <div className="edit-details-section">
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Movie Title"
                      required
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Year</label>
                      <input
                        type="number"
                        value={formData.year || ''}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        placeholder="Release Year"
                        min="1900"
                        max="2030"
                      />
                    </div>
                    <div className="form-group">
                      <label>Duration (min)</label>
                      <input
                        type="number"
                        value={formData.duration || ''}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="Duration in minutes"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Rating (0-10)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={formData.rating || ''}
                        onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || '' })}
                        placeholder="Rating"
                      />
                    </div>
                    <div className="form-group">
                      <label>Genre</label>
                      <input
                        value={formData.genre || ''}
                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                        placeholder="Action, Drama, Comedy..."
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Director</label>
                    <input
                      value={formData.director || ''}
                      onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                      placeholder="Director Name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Cast</label>
                    <input
                      value={formData.cast || ''}
                      onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
                      placeholder="Actor 1, Actor 2, Actor 3..."
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Language</label>
                      <select
                        value={formData.language || ''}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      >
                        <option value="">Select Language</option>
                        <option value="en">English</option>
                        <option value="fi">Finnish</option>
                        <option value="sv">Swedish</option>
                        <option value="de">German</option>
                        <option value="fr">French</option>
                        <option value="es">Spanish</option>
                        <option value="ja">Japanese</option>
                        <option value="ko">Korean</option>
                        <option value="hi">Hindi</option>
                        <option value="zh">Chinese</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Original Language</label>
                      <select
                        value={formData.original_language || ''}
                        onChange={(e) => setFormData({ ...formData, original_language: e.target.value })}
                      >
                        <option value="">Select Language</option>
                        <option value="en">English</option>
                        <option value="fi">Finnish</option>
                        <option value="sv">Swedish</option>
                        <option value="de">German</option>
                        <option value="fr">French</option>
                        <option value="es">Spanish</option>
                        <option value="ja">Japanese</option>
                        <option value="ko">Korean</option>
                        <option value="hi">Hindi</option>
                        <option value="zh">Chinese</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Movie description / plot summary..."
                      rows={4}
                    />
                  </div>

                  {/* Featured & Trending Controls */}
                  <div className="home-section-controls">
                    <label className="section-label">🏠 Home Page Sections</label>
                    <div className="checkbox-group">
                      <label className="checkbox-label featured">
                        <input
                          type="checkbox"
                          checked={formData.is_featured || false}
                          onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        />
                        <span className="checkbox-text">⭐ Featured Movies</span>
                      </label>
                      <label className="checkbox-label trending">
                        <input
                          type="checkbox"
                          checked={formData.is_trending_managed || false}
                          onChange={(e) => setFormData({ ...formData, is_trending_managed: e.target.checked })}
                        />
                        <span className="checkbox-text">🔥 Trending Now</span>
                      </label>
                    </div>
                    <p className="section-hint">Toggle to show this movie in Featured or Trending sections on the home page</p>
                  </div>

                  {/* TMDB Info (Read-only) */}
                  {formData.tmdb_id && (
                    <div className="tmdb-info-badge">
                      <span>🎬 TMDB ID: {formData.tmdb_id}</span>
                      {formData.popularity && <span>📊 Popularity: {formData.popularity}</span>}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={closeEditModal}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  💾 Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Movies Table */}
      <div className="movies-list-section">
        <h3>📝 {t('admin.manageMovies')} ({movies.length})</h3>
        <div className="movies-table-wrapper">
          <table className="movies-table">
            <thead>
              <tr>
                <th>Poster</th>
                <th>Title</th>
                <th>Year</th>
                <th>Genre</th>
                <th>Rating</th>
                <th>Sections</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMovies.map((movie) => (
                <tr key={movie.id}>
                  <td>
                    <img 
                      src={movie.poster_url || 'https://via.placeholder.com/50x75'} 
                      alt={movie.title} 
                      className="table-poster"
                    />
                  </td>
                  <td className="title-cell">{movie.title}</td>
                  <td>{movie.year || '-'}</td>
                  <td>{movie.genre || '-'}</td>
                  <td>
                    {movie.rating ? (
                      <span className="rating-badge">⭐ {movie.rating}</span>
                    ) : '-'}
                  </td>
                  <td className="sections-cell">
                    {movie.is_featured && <span className="section-badge featured">⭐ Featured</span>}
                    {movie.is_trending_managed && <span className="section-badge trending">🔥 Trending</span>}
                    {!movie.is_featured && !movie.is_trending_managed && <span className="no-section">-</span>}
                  </td>
                  <td className="actions-cell">
                    <button className="edit-btn" onClick={() => setEditingMovie(movie)}>
                      ✏️ {t('admin.edit')}
                    </button>
                    {onDeleteMovie && (
                      <button className="delete-btn" onClick={() => onDeleteMovie(movie.id)}>
                        🗑️
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="pagination-btn"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              ⏮️ First
            </button>
            <button 
              className="pagination-btn"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ◀️ Prev
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              className="pagination-btn"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next ▶️
            </button>
            <button 
              className="pagination-btn"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last ⏭️
            </button>
          </div>
        )}
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
          <div key={theater.id} className="theater-card">
            <h4>{theater.name}</h4>
            <p>📍 {theater.city || 'No city'}</p>
            <p>🏠 {theater.address || 'No address'}</p>
            <p>📞 {theater.phone || 'No phone'}</p>
            <div className="card-actions">
              <button onClick={() => setEditingTheater(theater)}>{t('admin.edit')}</button>
              <button onClick={() => deleteTheater(theater.id)} className="delete-btn">
                {t('admin.delete')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Auditoriums Tab Component
const AuditoriumsTab = ({
  auditoriums, theaters, showAuditoriumForm, setShowAuditoriumForm,
  editingAuditorium, setEditingAuditorium, saveAuditorium, deleteAuditorium, t
}) => {
  const [formData, setFormData] = useState({
    theater_id: '', name: '', seating_capacity: ''
  });

  useEffect(() => {
    if (editingAuditorium) {
      setFormData({
        auditorium_id: editingAuditorium.auditorium_id,
        theater_id: editingAuditorium.theater_id,
        name: editingAuditorium.name,
        seating_capacity: editingAuditorium.seating_capacity
      });
      setShowAuditoriumForm(true);
    }
  }, [editingAuditorium]);

  const handleSubmit = (e) => {
    e.preventDefault();
    saveAuditorium({
      ...formData,
      seating_capacity: parseInt(formData.seating_capacity)
    });
    setFormData({ theater_id: '', name: '', seating_capacity: '' });
  };

  // Group auditoriums by theater
  const groupedAuditoriums = auditoriums.reduce((acc, aud) => {
    const theaterName = aud.theater_name || 'Unknown Theater';
    if (!acc[theaterName]) {
      acc[theaterName] = [];
    }
    acc[theaterName].push(aud);
    return acc;
  }, {});

  return (
    <div className="tab-content">
      <div className="section-header">
        <h3>🎭 {t('admin.auditoriums')}</h3>
        <button onClick={() => {
          setShowAuditoriumForm(!showAuditoriumForm);
          setEditingAuditorium(null);
          setFormData({ theater_id: '', name: '', seating_capacity: '' });
        }}>
          {showAuditoriumForm ? t('admin.cancel') : `+ ${t('admin.addAuditorium')}`}
        </button>
      </div>

      {showAuditoriumForm && (
        <form onSubmit={handleSubmit} className="crud-form">
          <select
            value={formData.theater_id}
            onChange={(e) => setFormData({ ...formData, theater_id: e.target.value })}
            required
          >
            <option value="">{t('admin.selectTheater')}</option>
            {theaters.map((theater) => (
              <option key={theater.id || theater.theater_id} value={theater.id || theater.theater_id}>
                {theater.name} ({theater.city})
              </option>
            ))}
          </select>
          <input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t('admin.auditoriumName')}
            required
          />
          <input
            type="number"
            value={formData.seating_capacity}
            onChange={(e) => setFormData({ ...formData, seating_capacity: e.target.value })}
            placeholder={t('admin.seatingCapacity')}
            min="1"
            required
          />
          <button type="submit">{editingAuditorium ? t('admin.update') : t('admin.create')}</button>
        </form>
      )}

      <div className="auditoriums-grouped">
        {Object.keys(groupedAuditoriums).length === 0 ? (
          <div className="empty-state">
            <p>{t('admin.noAuditoriums')}</p>
          </div>
        ) : (
          Object.entries(groupedAuditoriums).map(([theaterName, theaterAuditoriums]) => (
            <div key={theaterName} className="theater-auditoriums-group">
              <h4 className="theater-group-title">🏛️ {theaterName}</h4>
              <div className="auditoriums-list">
                {theaterAuditoriums.map((auditorium) => (
                  <div key={auditorium.auditorium_id} className="auditorium-card">
                    <div className="auditorium-info">
                      <h5>{auditorium.name}</h5>
                      <p>🪑 {auditorium.seating_capacity} {t('admin.seats')}</p>
                    </div>
                    <div className="card-actions">
                      <button onClick={() => setEditingAuditorium(auditorium)}>{t('admin.edit')}</button>
                      <button onClick={() => deleteAuditorium(auditorium.auditorium_id)} className="delete-btn">
                        {t('admin.delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
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
            onChange={(e) => {
              const selectedAuditorium = auditoriums.find(a => a.auditorium_id == e.target.value);
              setFormData({ 
                ...formData, 
                auditorium_id: e.target.value,
                available_seats: selectedAuditorium ? selectedAuditorium.seating_capacity : ''
              });
            }}
            required
          >
            <option value="">{t('admin.selectAuditorium')}</option>
            {auditoriums.map((aud) => (
              <option key={aud.auditorium_id} value={aud.auditorium_id}>
                {aud.theater_name} - {aud.name} ({aud.seating_capacity} {t('admin.seats')})
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

// Bookings Tab Component
const BookingsTab = ({ bookings, cancelBooking, refreshBookings, t }) => {
  const [filter, setFilter] = useState('all'); // all, confirmed, cancelled, pending
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBookings = bookings.filter(booking => {
    // Status filter
    if (filter !== 'all' && booking.status !== filter) return false;
    
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        booking.customer_name?.toLowerCase().includes(search) ||
        booking.customer_email?.toLowerCase().includes(search) ||
        booking.movie_title?.toLowerCase().includes(search) ||
        booking.booking_id?.toString().includes(search)
      );
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="status-badge status-confirmed">✅ {t('admin.confirmed')}</span>;
      case 'cancelled':
        return <span className="status-badge status-cancelled">❌ {t('admin.cancelled')}</span>;
      case 'pending':
        return <span className="status-badge status-pending">⏳ {t('admin.pending')}</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const getPaymentBadge = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid':
        return <span className="payment-badge payment-paid">💳 {t('admin.paid')}</span>;
      case 'refunded':
        return <span className="payment-badge payment-refunded">↩️ {t('admin.refunded')}</span>;
      case 'pending':
        return <span className="payment-badge payment-pending">⏳ {t('admin.paymentPending')}</span>;
      default:
        return <span className="payment-badge">{paymentStatus}</span>;
    }
  };

  return (
    <div className="tab-content">
      <div className="section-header">
        <h3>🎟️ {t('admin.bookings')}</h3>
        <button onClick={refreshBookings}>🔄 {t('admin.refresh')}</button>
      </div>

      {/* Filters */}
      <div className="bookings-filters">
        <input
          type="text"
          placeholder={t('admin.searchBookings')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">{t('admin.allBookings')}</option>
          <option value="confirmed">{t('admin.confirmedOnly')}</option>
          <option value="pending">{t('admin.pendingOnly')}</option>
          <option value="cancelled">{t('admin.cancelledOnly')}</option>
        </select>
      </div>

      {/* Bookings Summary */}
      <div className="bookings-summary">
        <div className="summary-item">
          <span className="summary-count">{bookings.length}</span>
          <span className="summary-label">{t('admin.totalBookings')}</span>
        </div>
        <div className="summary-item">
          <span className="summary-count">{bookings.filter(b => b.status === 'confirmed').length}</span>
          <span className="summary-label">{t('admin.confirmed')}</span>
        </div>
        <div className="summary-item">
          <span className="summary-count">{bookings.filter(b => b.status === 'cancelled').length}</span>
          <span className="summary-label">{t('admin.cancelled')}</span>
        </div>
        <div className="summary-item">
          <span className="summary-count">€{bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0).toFixed(2)}</span>
          <span className="summary-label">{t('admin.totalRevenue')}</span>
        </div>
      </div>

      {/* Bookings Table */}
      {filteredBookings.length === 0 ? (
        <div className="empty-state">
          <p>{t('admin.noBookingsFound')}</p>
        </div>
      ) : (
        <div className="bookings-table-container">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>{t('admin.bookingId')}</th>
                <th>{t('admin.customer')}</th>
                <th>{t('admin.movie')}</th>
                <th>{t('admin.showtime')}</th>
                <th>{t('admin.seats')}</th>
                <th>{t('admin.total')}</th>
                <th>{t('admin.status')}</th>
                <th>{t('admin.payment')}</th>
                <th>{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.booking_id} className={booking.status === 'cancelled' ? 'cancelled-row' : ''}>
                  <td>#{booking.booking_id}</td>
                  <td>
                    <div className="customer-info">
                      <strong>{booking.customer_name}</strong>
                      <small>{booking.customer_email}</small>
                    </div>
                  </td>
                  <td>{booking.movie_title}</td>
                  <td>
                    <div className="showtime-info">
                      <span>{new Date(booking.show_date).toLocaleDateString()}</span>
                      <span>{booking.show_time}</span>
                      <small>{booking.theater_name}</small>
                    </div>
                  </td>
                  <td>{booking.number_of_seats}</td>
                  <td>€{parseFloat(booking.total_price).toFixed(2)}</td>
                  <td>{getStatusBadge(booking.status)}</td>
                  <td>{getPaymentBadge(booking.payment_status)}</td>
                  <td>
                    {booking.status === 'confirmed' && !isShowtimePast(booking) && (
                      <button 
                        onClick={() => cancelBooking(booking.booking_id)}
                        className="cancel-btn"
                        title={t('admin.cancelBooking')}
                      >
                        ❌ {t('admin.cancel')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminEnhanced;


