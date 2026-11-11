import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Ticket, Users, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { HeroSection } from '../components/HeroSection';
import { UpcomingEvents } from '../components/UpcomingEvents';
import { EventCategories } from '../components/EventCategories';
import './HomePage.css';

export const HomePage = () => {
  const location = useLocation();

  useEffect(() => {
    // If navigated with hash #about-planora, scroll smoothly into view
    if (location.hash === '#about-planora') {
      const el = document.getElementById('about-planora');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <HeroSection />

      {/* Categories Grid */}
      <EventCategories />

      {/* 6 Upcoming Events */}
      <UpcomingEvents />

      {/* About Planora Section */}
      <section id="about-planora" className="about-section">
        <div className="container">
          <div className="about-grid">
            {/* Left Column: Story & Mission */}
            <div className="about-story">
              <div className="about-badge">
                <Sparkles size={14} />
                <span>Empowering Student Life</span>
              </div>

              <h2 className="about-title">
                One Platform, Every Campus Memory.
              </h2>

              <p className="about-lead">
                Planora centralizes collegiate life by bridging the gap between student organizers, university clubs, and eager participants.
              </p>

              <p className="about-paragraph">
                Gone are the days of scattered poster boards, missed announcements, and chaotic paper registrations. With Planora, every college festival, technical hackathon, sports championship, and career bootcamp is verified, cataloged, and accessible in real-time with instant digital tickets.
              </p>

              <div className="about-cta-row">
                <Link to="/explore" className="btn btn-primary">
                  <span>Browse Campus Events</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/host-event" className="btn btn-outline">
                  <span>Host Your Club Event</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Platform Highlights */}
            <div className="about-features-stack">
              <div className="feature-box">
                <div className="feature-icon-wrapper">
                  <ShieldCheck size={24} />
                </div>
                <div className="feature-content">
                  <h4>Verified Collegiate Events</h4>
                  <p>Every event is authored by official student committees, academic departments, or recognized campus societies.</p>
                </div>
              </div>

              <div className="feature-box">
                <div className="feature-icon-wrapper">
                  <Ticket size={24} />
                </div>
                <div className="feature-content">
                  <h4>Instant Digital Passes</h4>
                  <p>Register with a single click and access your confirmed booking pass, venue location, and timing right in your profile.</p>
                </div>
              </div>

              <div className="feature-box">
                <div className="feature-icon-wrapper">
                  <Users size={24} />
                </div>
                <div className="feature-content">
                  <h4>Seamless Dual-Role Platform</h4>
                  <p>Every student can become an organizer instantly. Publish club events in minutes with built-in image compression and attendee tracking.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

