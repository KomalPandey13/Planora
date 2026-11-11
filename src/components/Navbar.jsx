import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, PlusCircle, LogOut, User, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleAboutClick = (e) => {
    closeMobileMenu();
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('about-planora');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Let it navigate to /#about-planora
      navigate('/#about-planora');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="navbar">
      <div className="container navbar-container">
        {/* Brand Wordmark */}
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          <div className="brand-icon-wrapper">
            <Sparkles size={20} strokeWidth={2.2} />
          </div>
          <span className="brand-name">Planora</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav>
          <ul className="navbar-links">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                end
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/explore"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Explore Events
              </NavLink>
            </li>
            <li>
              <a href="/#about-planora" onClick={handleAboutClick} className="nav-link">
                About
              </a>
            </li>
          </ul>
        </nav>

        {/* Desktop Auth Controls */}
        <div className="navbar-auth">
          {isAuthenticated ? (
            <>
              <Link to="/host-event" className="btn btn-secondary">
                <PlusCircle size={16} />
                <span>Host an Event</span>
              </Link>

              <Link to="/profile" className="user-profile-pill" title="View Profile">
                <div className="avatar-circle">
                  {getInitials(user?.name)}
                </div>
                <div className="user-meta">
                  <span className="user-name-text">{user?.name || 'Account'}</span>
                  <span className="user-role-badge">{user?.role || 'Student'}</span>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="btn-logout"
                title="Log Out of Planora"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="mobile-toggle-btn"
          aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer" onClick={closeMobileMenu}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <ul className="mobile-nav-links">
              <li>
                <Link to="/" className="mobile-nav-link" onClick={closeMobileMenu}>
                  <span>Home</span>
                  <ChevronRight size={18} />
                </Link>
              </li>
              <li>
                <Link to="/explore" className="mobile-nav-link" onClick={closeMobileMenu}>
                  <span>Explore Events</span>
                  <ChevronRight size={18} />
                </Link>
              </li>
              <li>
                <a href="/#about-planora" className="mobile-nav-link" onClick={handleAboutClick}>
                  <span>About</span>
                  <ChevronRight size={18} />
                </a>
              </li>
            </ul>

            <div className="mobile-auth-section">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="user-profile-pill"
                    onClick={closeMobileMenu}
                    style={{ width: '100%' }}
                  >
                    <div className="avatar-circle">
                      {getInitials(user?.name)}
                    </div>
                    <div className="user-meta">
                      <span className="user-name-text">{user?.name}</span>
                      <span className="user-role-badge">{user?.role}</span>
                    </div>
                  </Link>

                  <Link to="/host-event" className="btn btn-secondary" onClick={closeMobileMenu}>
                    <PlusCircle size={16} />
                    <span>Host an Event</span>
                  </Link>

                  <button type="button" onClick={handleLogout} className="btn btn-outline" style={{ color: 'var(--danger-text)' }}>
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline" onClick={closeMobileMenu}>
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary" onClick={closeMobileMenu}>
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

