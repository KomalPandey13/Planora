import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RotateCcw, Filter, CalendarX2 } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { EventCard } from '../components/EventCard';
import './ExploreEventsPage.css';

const CATEGORIES = [
  'All',
  'Cultural',
  'Technical',
  'Sports',
  'Workshop',
  'Seminar',
  'Others'
];

export const ExploreEventsPage = () => {
  const { events } = useEvents();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'All';

  // Live filter computation
  const filteredEvents = useMemo(() => {
    const q = queryParam.trim().toLowerCase();
    const cat = categoryParam.trim();

    return events.filter((event) => {
      // Category filter
      const matchesCategory =
        cat.toLowerCase() === 'all' ||
        event.category.toLowerCase() === cat.toLowerCase();

      if (!matchesCategory) return false;

      // Text query match (event title, description, tags, organizer)
      if (!q) return true;

      const titleMatch = event.title?.toLowerCase().includes(q);
      const descMatch = event.description?.toLowerCase().includes(q);
      const orgMatch = event.organizer?.toLowerCase().includes(q);
      const tagMatch = Array.isArray(event.tags) && event.tags.some((t) => t.toLowerCase().includes(q));

      return titleMatch || descMatch || orgMatch || tagMatch;
    });
  }, [events, queryParam, categoryParam]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    const nextParams = new URLSearchParams(searchParams);
    if (val) {
      nextParams.set('q', val);
    } else {
      nextParams.delete('q');
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleCategorySelect = (category) => {
    const nextParams = new URLSearchParams(searchParams);
    if (category === 'All') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', category);
    }
    setSearchParams(nextParams);
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(queryParam || (categoryParam && categoryParam !== 'All'));

  return (
    <div className="explore-page">
      <div className="container">
        {/* Page Title & Intro */}
        <div className="explore-header">
          <h1 className="explore-page-title">Explore Campus Events</h1>
          <p className="explore-page-desc">
            Discover upcoming hackathons, festivals, workshops, and sports meets happening across colleges.
          </p>
        </div>

        {/* Filter Controls Card */}
        <div className="explore-controls-card">
          {/* Live Search Input */}
          <div className="explore-search-input-wrapper">
            <Search size={20} className="explore-search-icon" />
            <input
              type="text"
              className="explore-search-input"
              placeholder="Filter events by name, club, or keyword..."
              value={queryParam}
              onChange={handleSearchChange}
              aria-label="Filter events by name"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="category-pills-row">
            {CATEGORIES.map((cat) => {
              const isActive =
                (!categoryParam && cat === 'All') ||
                categoryParam.toLowerCase() === cat.toLowerCase();

              return (
                <button
                  key={cat}
                  type="button"
                  className={`category-pill-btn ${isActive ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Summary Bar */}
        <div className="results-summary-bar">
          <div>
            Showing <span className="results-count-bold">{filteredEvents.length}</span> {filteredEvents.length === 1 ? 'event' : 'events'}
            {categoryParam && categoryParam !== 'All' && (
              <span> in <strong>{categoryParam}</strong></span>
            )}
            {queryParam && (
              <span> matching &ldquo;{queryParam}&rdquo;</span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="btn btn-outline btn-reset-filters"
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-full)'
              }}
            >
              <RotateCcw size={14} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Event Cards Grid or Empty State */}
        {filteredEvents.length > 0 ? (
          <div className="explore-grid">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="explore-empty-state animate-fade-in">
            <div className="empty-icon-circle">
              <CalendarX2 size={32} />
            </div>
            <h3 className="empty-title">No events found</h3>
            <p className="empty-desc">
              We couldn't find any campus events matching your current filters. Try searching with a different keyword or resetting your category selection.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="btn btn-primary btn-clear-empty"
            >
              <RotateCcw size={16} />
              <span>Clear All Filters</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
