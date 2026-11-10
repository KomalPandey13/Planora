import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowUpRight } from 'lucide-react';
import './EventCard.css';

export const EventCard = ({ event }) => {
  if (!event) return null;

  const {
    id,
    title,
    category,
    displayDate,
    time,
    isPaid,
    priceDisplay,
    image
  } = event;

  const day = displayDate?.day || '24';
  const month = displayDate?.month || 'NOV';

  return (
    <article className="event-card animate-fade-in">
      <div className="card-media">
        {/* Floating Date Badge (Top-Left) */}
        <div className="floating-date-badge" aria-label={`Event date: ${day} ${month}`}>
          <span className="date-day">{day}</span>
          <span className="date-month">{month}</span>
        </div>

        {/* Floating Category & Price Badges (Top-Right) */}
        <div className="card-badges-top">
          <span className={`card-badge ${isPaid ? 'badge-paid' : 'badge-free'}`}>
            {priceDisplay}
          </span>
        </div>

        <img
          src={image}
          alt={title}
          className="card-img"
          loading="lazy"
        />
      </div>

      <div className="card-body">
        <div className="card-meta-row">
          <span className="card-category-label">{category}</span>
        </div>

        <h3 className="card-title" title={title}>
          {title}
        </h3>

        <div className="card-timing">
          <Clock size={16} className="card-timing-icon" />
          <span>{time}</span>
        </div>

        <div className="card-footer">
          <div className="card-price-block">
            <span className="price-label">Registration</span>
            <span className={`price-value ${!isPaid ? 'is-free' : ''}`}>
              {priceDisplay}
            </span>
          </div>

          <Link
            to={`/events/${id}`}
            className="btn btn-secondary card-action-btn"
            aria-label={`View details for ${title}`}
          >
            <span>View Details</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
};

