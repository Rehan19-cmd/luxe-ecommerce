import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Homepage from './pages/Homepage'
import SpecialOffers from './pages/SpecialOffers'
import Login from './pages/Login'

function Sidebar({ onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <span className="sidebar__logo-icon">◆</span>
        <span className="sidebar__logo-text">LUXE</span>
      </div>
      <span className="sidebar__label">Main Menu</span>
      <ul className="sidebar__nav">
        <li>
          <NavLink to="/" end className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/products" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            <span>Products</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/orders" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            <span>Orders</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/homepage" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Homepage</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/special-offers" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            <span>Special Offers</span>
          </NavLink>
        </li>
      </ul>
      <div style={{ marginTop: 'auto', padding: '1.5rem' }}>
        <button 
          className="btn btn-outline" 
          onClick={onLogout} 
          style={{ width: '100%', borderColor: 'var(--danger)', color: 'var(--danger)' }}
        >
          Logout
        </button>
      </div>
    </aside>
  )
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('adminToken', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('adminToken');
    }

    // Intercept 401s globally to force a logout if token expires
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          setToken(null);
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [token]);

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  return (
    <BrowserRouter basename="/admin">
      <div className="layout">
        <Sidebar onLogout={() => setToken(null)} />
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/homepage" element={<Homepage />} />
            <Route path="/special-offers" element={<SpecialOffers />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
