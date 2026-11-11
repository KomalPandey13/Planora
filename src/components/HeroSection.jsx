import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ArrowRight, Sparkles, CalendarDays } from 'lucide-react';
import './HeroSection.css';

export const HeroSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (query) {
      navigate(`/explore?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <section className="hero-section">
      <div className="container hero-content">
        <div className="hero-tagline-badge animate-fade-in">
          <Sparkles size={16} />
          <span>The Central Hub for Campus Life</span>
        </div>

        <h1 className="hero-title animate-fade-in">
          YOUR EVENTS, <span className="hero-title-highlight">YOUR MOMENTS</span>
        </h1>

        <p className="hero-subheading animate-fade-in">
          Find Your Next Unforgettable Experience.
        </p>

        {/* Large Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hero-search-form animate-fade-in">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              className="hero-search-input"
              placeholder="Search college fests, hackathons, workshops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search events"
            />
          </div>
          <button type="submit" className="hero-search-submit">
            <span>Find Events</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Two CTAs */}
        <div className="hero-cta-group animate-fade-in">
          <Link to="/explore" className="btn btn-primary hero-cta-btn">
            <CalendarDays size={18} />
            <span>Explore Events</span>
          </Link>
          <Link to="/host-event" className="btn btn-secondary hero-cta-btn">
            <span>Host an Event</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

