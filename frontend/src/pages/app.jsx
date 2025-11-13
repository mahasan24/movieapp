import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import MoviesPage from './MoviesPage';
import MovieDetailsPage from './MovieDetailsPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movies/:id" element={<MovieDetailsPage />} />
          <Route path="/movies/:id/showtimes" element={<div style={{padding: '50px', textAlign: 'center'}}><h1>Showtimes - Coming Soon</h1></div>} />
          <Route path="*" element={<div style={{padding: '50px', textAlign: 'center'}}><h1>404 - Page Not Found</h1></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;