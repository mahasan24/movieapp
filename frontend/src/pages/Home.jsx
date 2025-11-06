import React from 'react'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  }

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })();

  return (
    <div style={{padding:20}}>
      <h1>Home</h1>
      {user && <p>Welcome, {user.name} ({user.email})</p>}
      <button onClick={logout}>Logout</button>
    </div>
  )
}

export default Home
