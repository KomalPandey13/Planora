import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';
import './Footer.css';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top-grid">
          {/* Brand Col */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-brand">
              <div className="footer-brand-icon">
                <Sparkles size={18} />
              </div>
              <span>Planora</span>
            </Link>
            <p className="footer-brand-desc">
              The premier college event management and discovery platform. Connecting vibrant student communities with unforgettable campus experiences.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="footer-title">Navigation</h4>
            <ul className="footer-links-list">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/explore" className="footer-link">Explore Events</Link></li>
              <li><Link to="/host-event" className="footer-link">Host an Event</Link></li>
              <li><Link to="/profile" className="footer-link">Student Profile</Link></li>
              <li><a href="/#about-planora" className="footer-link">About Planora</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="footer-title">Categories</h4>
            <ul className="footer-links-list">
              <li><Link to="/explore?category=Cultural" className="footer-link">Cultural Fests</Link></li>
              <li><Link to="/explore?category=Technical" className="footer-link">Technical & Coding</Link></li>
              <li><Link to="/explore?category=Sports" className="footer-link">Sports Tournaments</Link></li>
              <li><Link to="/explore?category=Workshop" className="footer-link">Workshops & Bootcamps</Link></li>
              <li><Link to="/explore?category=Seminar" className="footer-link">Seminars & Keynotes</Link></li>
            </ul>
          </div>

          {/* Campus Support */}
          <div>
            <h4 className="footer-title">Campus Hub</h4>
            <div className="footer-contact-item">
              <MapPin size={16} className="footer-contact-icon" />
              <span>Student Council Activities Center, North Campus Quad</span>
            </div>
            <div className="footer-contact-item">
              <Mail size={16} className="footer-contact-icon" />
              <span>support@planora.campus.edu</span>
            </div>
            <div className="footer-contact-item">
              <ShieldCheck size={16} className="footer-contact-icon" />
              <span>Verified Collegiate Event Network</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Planora. College Event Management Platform. All rights reserved.</p>
          <div className="footer-bottom-links">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              Built for campus innovators & student leaders
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

