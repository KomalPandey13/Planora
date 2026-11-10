import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { EventCard } from './EventCard';
import './UpcomingEvents.css';

export const UpcomingEvents = () => {
  const { events } = useEvents();

  // Show top 6 upcoming events
  const displayedEvents = events.slice(0, 6);

  return (
    <section className="upcoming-section">
      <div className="container">
        <div className="upcoming-header-row">
          <div className="upcoming-header-text">
            <div className="upcoming-pill">
              <Calendar size={14} />
              <span>Campus Buzz</span>
            </div>
            <h2 className="upcoming-title">Upcoming College Events</h2>
            <p className="upcoming-desc">
              Discover the most anticipated campus gatherings, competitions, and symposiums scheduled this month.
            </p>
          </div>

          <Link to="/explore" className="btn btn-outline" style={{ borderRadius: 'var(--radius-full)' }}>
            <span>View All ({events.length})</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="events-grid-3">
          {displayedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        <div className="upcoming-footer-cta">
          <Link to="/explore" className="btn btn-primary btn-explore-all">
            <span>Explore All Events</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

