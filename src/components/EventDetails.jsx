import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Users,
  Ticket,
  CheckCircle2,
  ArrowLeft,
  QrCode,
  Tag,
  AlertCircle,
  Share2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import './EventDetails.css';

export const EventDetails = ({ event }) => {
  const { user, isAuthenticated, isEventRegistered, isEventHosted, registerUserForEvent, cancelUserEventRegistration } = useAuth();
  const { registerForEvent, cancelEventRegistration } = useEvents();
  const navigate = useNavigate();
  const location = useLocation();

  const [notification, setNotification] = useState(null);
  const [showPassModal, setShowPassModal] = useState(false);

  if (!event) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', background: '#FFF', padding: '3rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
          <AlertCircle size={48} color="#DC2626" style={{ margin: '0 auto 1.25rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1E1B4B' }}>
            Event Not Found
          </h2>
          <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>
            The requested campus event might have been removed, completed, or the link is invalid.
          </p>
          <Link to="/explore" className="btn btn-primary">
            <ArrowLeft size={16} />
            <span>Browse All Events</span>
          </Link>
        </div>
      </div>
    );
  }

  const isUserRegistered = isEventRegistered(event.id);
  const isUserHosting = isEventHosted(event.id) || (user && event.createdBy === user.id);

  // Retrieve existing pass if registered
  const userPass = user?.registeredEvents?.find((p) => p.eventId === event.id);

  const handleRegister = () => {
    if (!isAuthenticated) {
      // Redirect to login preserving destination
      navigate('/login', { state: { from: location } });
      return;
    }

    try {
      const { pass } = registerForEvent(event.id, user);
      registerUserForEvent(pass);
      setNotification({
        type: 'success',
        message: 'Registration confirmed! Your digital entry pass is now active.'
      });
      setShowPassModal(true);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to complete registration.'
      });
    }
  };

  const handleCancelRegistration = () => {
    if (window.confirm('Are you sure you want to cancel your event registration? Your seat will be released.')) {
      cancelEventRegistration(event.id);
      cancelUserEventRegistration(event.id);
      setShowPassModal(false);
      setNotification({
        type: 'info',
        message: 'Your registration has been cancelled.'
      });
    }
  };

  const day = event.displayDate?.day || '24';
  const month = event.displayDate?.month || 'NOV';
  const year = event.displayDate?.year || '2026';

  return (
    <div className="event-details-layout">
      <div className="container">
        {/* Back Link */}
        <Link to="/explore" className="back-nav-btn">
          <ArrowLeft size={18} />
          <span>Back to Explore Events</span>
        </Link>

        {/* Status Notification Banner */}
        {notification && (
          <div className={`alert-banner ${notification.type === 'error' ? 'alert-danger' : 'alert-success'} animate-fade-in`}>
            {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Hero Banner Header */}
        <div className="event-hero-banner">
          <img src={event.image} alt={event.title} className="event-hero-img" />
          <div className="event-banner-overlay">
            <div className="banner-overlay-content">
              <div className="banner-badges-row">
                <span className="banner-category-badge">{event.category}</span>
                <span className={`badge ${event.isPaid ? 'badge-paid' : 'badge-free'}`}>
                  {event.priceDisplay}
                </span>
              </div>
              <h1 className="banner-title">{event.title}</h1>
            </div>
          </div>
        </div>

        {/* Two-Column Content Grid */}
        <div className="event-content-grid">
          {/* Left Column: Description & Highlights */}
          <div className="event-main-col">
            <div className="details-card-block">
              <h2 className="details-section-heading">About This Event</h2>
              <p className="details-desc-text">{event.description}</p>
            </div>

            <div className="details-card-block">
              <h2 className="details-section-heading">Event Highlights & Inclusions</h2>
              <ul className="highlights-list">
                {event.highlights && event.highlights.map((highlight, index) => (
                  <li key={index} className="highlight-item">
                    <CheckCircle2 size={18} className="highlight-check-icon" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Digital Pass Preview if Registered */}
            {isUserRegistered && userPass && (
              <div className="digital-pass-card animate-fade-in">
                <div className="digital-pass-header">
                  <span className="pass-brand-tag">Planora Verified Campus Pass</span>
                  <span className="pass-status-chip">Confirmed</span>
                </div>
                <div className="pass-booking-id">
                  Booking ID: {userPass.bookingId || 'PLN-2026-X89K'}
                </div>
                <p style={{ fontSize: '0.88rem', color: '#DDD6FE', marginBottom: '0.5rem' }}>
                  Attendee: <strong>{user?.name}</strong> ({user?.email})
                </p>
                <div className="pass-qr-sim">
                  <QrCode size={36} color="#6D28D9" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Digital Verification Code</div>
                    <div className="pass-qr-sim-code">{userPass.passCode || 'PLN-PASS-2026'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Metadata & Booking Card */}
          <div className="event-sidebar-col">
            <div className="booking-sidebar-card">
              <div className="sidebar-price-row">
                <span className="sidebar-price-label">Registration Fee</span>
                <span className="sidebar-price-amount">{event.priceDisplay}</span>
              </div>

              {/* Structured Metadata Grid */}
              <div className="metadata-list">
                {/* Date */}
                <div className="meta-item">
                  <div className="meta-icon-wrapper">
                    <Calendar size={18} />
                  </div>
                  <div className="meta-info-block">
                    <span className="meta-label">Date</span>
                    <span className="meta-value">{day} {month} {year}</span>
                  </div>
                </div>

                {/* Timing */}
                <div className="meta-item">
                  <div className="meta-icon-wrapper">
                    <Clock size={18} />
                  </div>
                  <div className="meta-info-block">
                    <span className="meta-label">Time</span>
                    <span className="meta-value">{event.time}</span>
                  </div>
                </div>

                {/* Venue */}
                <div className="meta-item">
                  <div className="meta-icon-wrapper">
                    <MapPin size={18} />
                  </div>
                  <div className="meta-info-block">
                    <span className="meta-label">Campus Venue</span>
                    <span className="meta-value">{event.venue}</span>
                  </div>
                </div>

                {/* Organizer & Club */}
                <div className="meta-item">
                  <div className="meta-icon-wrapper">
                    <Building2 size={18} />
                  </div>
                  <div className="meta-info-block">
                    <span className="meta-label">Organized By</span>
                    <span className="meta-value">{event.organizer}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {event.organizerDepartment}
                    </span>
                  </div>
                </div>

                {/* Seats Information */}
                <div className="meta-item">
                  <div className="meta-icon-wrapper">
                    <Users size={18} />
                  </div>
                  <div className="meta-info-block">
                    <span className="meta-label">Seats & Registrations</span>
                    <span className="meta-value">
                      {event.availableSeats > 0 ? `${event.availableSeats} seats remaining` : 'Full capacity reached'}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {event.registeredCount || 0} students already registered
                    </span>
                  </div>
                </div>
              </div>

              {/* Registration Actions */}
              <div className="booking-action-wrapper">
                {isUserHosting ? (
                  <div className="hosting-own-badge">
                    You are hosting this event
                  </div>
                ) : isUserRegistered ? (
                  <div className="registration-confirmed-banner">
                    <div className="confirmed-pill">
                      <CheckCircle2 size={18} />
                      <span>You&apos;re Registered!</span>
                    </div>
                    <p className="confirmed-subtext">
                      Show your digital pass at the entrance on event day.
                    </p>
                    <div className="confirmed-btn-group">
                      <Link to="/profile" className="btn btn-secondary" style={{ width: '100%' }}>
                        <Ticket size={16} />
                        <span>View in My Profile</span>
                      </Link>
                      <button
                        type="button"
                        onClick={handleCancelRegistration}
                        className="btn btn-danger-outline"
                        style={{ width: '100%', fontSize: '0.85rem' }}
                      >
                        Cancel Registration
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleRegister}
                    className="btn btn-primary btn-register-action"
                    disabled={event.availableSeats <= 0}
                  >
                    <Ticket size={18} />
                    <span>{event.availableSeats <= 0 ? 'Fully Booked' : 'Register Now'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

