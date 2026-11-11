import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  PlusCircle,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  QrCode,
  CalendarCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { EventCard } from '../components/EventCard';
import './ProfilePage.css';

export const ProfilePage = () => {
  const { user, cancelUserEventRegistration, removeHostedEventId } = useAuth();
  const { events, getEventById, cancelEventRegistration, deleteEvent } = useEvents();

  const [activeTab, setActiveTab] = useState('registered'); // 'registered' | 'hosted'

  const registeredPasses = user?.registeredEvents || [];
  
  // Find hosted events either by user's hostedEvents array or createdBy match
  const hostedEventsList = events.filter(
    (e) => (user?.hostedEvents && user.hostedEvents.includes(e.id)) || e.createdBy === user?.id
  );

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleCancelRegistration = (eventId) => {
    if (window.confirm('Are you sure you want to cancel your registration? Your reserved seat will be released.')) {
      cancelEventRegistration(eventId);
      cancelUserEventRegistration(eventId);
    }
  };

  const handleDeleteHostedEvent = (eventId) => {
    if (window.confirm('Are you sure you want to permanently delete this hosted event?')) {
      deleteEvent(eventId, user.id);
      removeHostedEventId(eventId);
    }
  };

  const isOrganizer = user?.role === 'Organizer' || hostedEventsList.length > 0;

  return (
    <div className="profile-page">
      <div className="container">
        {/* Profile Header Card */}
        <div className="profile-card animate-fade-in">
          <div className="profile-user-left">
            <div className="profile-avatar-big">
              {getInitials(user?.name)}
            </div>
            <div className="profile-user-info">
              <h1>{user?.name}</h1>
              <div className="profile-email">
                <span>{user?.email}</span>
              </div>
              <span className={`role-badge-pill ${isOrganizer ? 'badge-role-organizer' : 'badge-role-student'}`}>
                <Sparkles size={13} />
                <span>{isOrganizer ? 'Student & Event Organizer' : 'Student'}</span>
              </span>
            </div>
          </div>

          <div>
            <Link to="/host-event" className="btn btn-secondary">
              <PlusCircle size={16} />
              <span>Host Another Event</span>
            </Link>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="profile-tabs-nav">
          <button
            type="button"
            className={`profile-tab-btn ${activeTab === 'registered' ? 'active' : ''}`}
            onClick={() => setActiveTab('registered')}
          >
            <Ticket size={18} />
            <span>My Registered Events</span>
            <span className="tab-badge-count">{registeredPasses.length}</span>
          </button>

          <button
            type="button"
            className={`profile-tab-btn ${activeTab === 'hosted' ? 'active' : ''}`}
            onClick={() => setActiveTab('hosted')}
          >
            <CalendarCheck size={18} />
            <span>My Hosted Events</span>
            <span className="tab-badge-count">{hostedEventsList.length}</span>
          </button>
        </div>

        {/* Tab 1: Registered Events */}
        {activeTab === 'registered' && (
          <div className="tab-content animate-fade-in">
            {registeredPasses.length > 0 ? (
              <div className="registered-list">
                {registeredPasses.map((pass) => {
                  const eventDetails = getEventById(pass.eventId);
                  const title = eventDetails?.title || pass.eventTitle || 'Campus Event';
                  const dateStr = eventDetails?.date || pass.eventDate;
                  const venueStr = eventDetails?.venue || pass.venue || 'Campus Venue';
                  const timeStr = eventDetails?.time || pass.time || '10:00 AM';

                  return (
                    <div key={pass.eventId} className="registered-item-card">
                      <div className="registered-details-main">
                        <h3>{title}</h3>

                        <div className="registered-meta-tags">
                          <span className="registered-meta-tag">
                            <Calendar size={15} color="var(--primary-violet)" />
                            <span>{dateStr}</span>
                          </span>
                          <span className="registered-meta-tag">
                            <Clock size={15} color="var(--primary-violet)" />
                            <span>{timeStr}</span>
                          </span>
                          <span className="registered-meta-tag">
                            <MapPin size={15} color="var(--primary-violet)" />
                            <span>{venueStr}</span>
                          </span>
                        </div>

                        <div className="pass-credentials-strip">
                          <QrCode size={16} color="var(--primary-violet)" />
                          <span>PASS ID: {pass.bookingId || 'PLN-PASS-CONFIRMED'}</span>
                          <span>•</span>
                          <span style={{ color: '#166534', fontWeight: 700 }}>STATUS: CONFIRMED</span>
                        </div>
                      </div>

                      <div className="registered-actions-group">
                        <Link
                          to={`/events/${pass.eventId}`}
                          className="btn btn-secondary"
                          style={{ padding: '0.55rem 1rem', fontSize: '0.88rem' }}
                        >
                          <ExternalLink size={15} />
                          <span>View Event</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleCancelRegistration(pass.eventId)}
                          className="btn btn-danger-outline"
                          style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                        >
                          Cancel Registration
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="profile-empty-tab">
                <div className="profile-empty-icon">
                  <Ticket size={28} />
                </div>
                <h3 className="profile-empty-title">No event registrations yet</h3>
                <p className="profile-empty-desc">
                  Explore exciting college festivals, workshops, and sports matches and book your free digital pass.
                </p>
                <Link to="/explore" className="btn btn-primary">
                  <span>Explore Campus Events</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Hosted Events */}
        {activeTab === 'hosted' && (
          <div className="tab-content animate-fade-in">
            {hostedEventsList.length > 0 ? (
              <div className="hosted-events-grid">
                {hostedEventsList.map((event) => (
                  <div key={event.id} className="hosted-item-wrapper">
                    <EventCard event={event} />
                    <div className="hosted-actions-bar">
                      <button
                        type="button"
                        onClick={() => handleDeleteHostedEvent(event.id)}
                        className="btn btn-danger-outline"
                        style={{ width: '100%', padding: '0.45rem', fontSize: '0.82rem' }}
                      >
                        <Trash2 size={14} />
                        <span>Delete Event</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="profile-empty-tab">
                <div className="profile-empty-icon">
                  <PlusCircle size={28} />
                </div>
                <h3 className="profile-empty-title">You haven&apos;t hosted any events yet</h3>
                <p className="profile-empty-desc">
                  Are you a student club head, department coordinator, or fest organizer? Publish your campus event in minutes and start tracking attendees.
                </p>
                <Link to="/host-event" className="btn btn-primary">
                  <PlusCircle size={16} />
                  <span>Host Your First Event</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

