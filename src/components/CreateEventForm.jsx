import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarPlus,
  Image as ImageIcon,
  Clock,
  MapPin,
  Tag,
  AlertCircle,
  X,
  Upload,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { compressImage } from '../utils/security';
import './CreateEventForm.css';

const PRESET_BANNERS = [
  {
    name: 'Tech & Hackathon',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Cultural & Music',
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Workshop & Studio',
    url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80'
  }
];

export const CreateEventForm = () => {
  const { user, addHostedEventId } = useAuth();
  const { addNewEvent } = useEvents();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Cultural');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('04:00 PM');
  const [venue, setVenue] = useState('');
  const [organizer, setOrganizer] = useState(user?.name ? `${user.name}'s Student Club` : '');
  const [organizerDepartment, setOrganizerDepartment] = useState('Student Activities Council');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('0');
  const [totalSeats, setTotalSeats] = useState('250');
  const [imagePreview, setImagePreview] = useState(PRESET_BANNERS[0].url);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File upload with Canvas compression
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setIsCompressing(true);

    try {
      // Auto compress to max 800px width at 0.75 quality to prevent localStorage overflow
      const compressedDataUrl = await compressImage(file, 800, 0.75);
      setImagePreview(compressedDataUrl);
    } catch (err) {
      setError(err.message || 'Failed to process and compress uploaded image.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSelectPreset = (url) => {
    setImagePreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Event Title is required.');
      return;
    }

    if (description.trim().length < 20) {
      setError('Event Description must be at least 20 characters long.');
      return;
    }

    if (!date) {
      setError('Event Date is required.');
      return;
    }

    if (!venue.trim()) {
      setError('Event Location / Campus Venue is required.');
      return;
    }

    if (isPaid && (Number(price) <= 0 || isNaN(Number(price)))) {
      setError('Please provide a valid registration fee greater than 0 for Paid events.');
      return;
    }

    setIsSubmitting(true);

    try {
      const eventData = {
        title,
        description,
        category,
        date,
        startTime,
        endTime,
        venue,
        organizer: organizer.trim() || user?.name || 'Campus Student Club',
        organizerDepartment: organizerDepartment.trim() || 'Student Affairs',
        isPaid,
        price: isPaid ? Number(price) : 0,
        totalSeats: Number(totalSeats) || 200,
        image: imagePreview
      };

      const created = addNewEvent(eventData, user);
      
      // Elevate user role to Organizer and add event to hostedEvents list
      addHostedEventId(created.id);

      // Navigate to the newly created event details page
      navigate(`/events/${created.id}`);
    } catch (err) {
      setError(err.message || 'Failed to publish event.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-event-card animate-fade-in">
      <div className="create-event-header">
        <h1 className="create-event-title">Host a Campus Event</h1>
        <p className="create-event-subtitle">
          Publish your collegiate fest, hackathon, workshop, or tournament to the Planora student network.
        </p>
      </div>

      {error && (
        <div className="alert-banner alert-danger">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="event-form-grid">
        {/* Event Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="event-title">
            Event Name *
          </label>
          <input
            id="event-title"
            type="text"
            className="form-input"
            style={{ paddingLeft: '1rem' }}
            placeholder="e.g. CodeSprint 2026 – 24Hr Algorithmic Challenge"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Category & Date */}
        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label" htmlFor="event-category">
              Event Category *
            </label>
            <select
              id="event-category"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="Cultural">Cultural</option>
              <option value="Technical">Technical</option>
              <option value="Sports">Sports</option>
              <option value="Workshop">Workshop</option>
              <option value="Seminar">Seminar</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="event-date">
              Event Date *
            </label>
            <input
              id="event-date"
              type="date"
              className="form-input"
              style={{ paddingLeft: '1rem' }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Timing */}
        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label" htmlFor="event-start-time">
              Start Time *
            </label>
            <div className="input-with-icon">
              <Clock size={18} className="input-leading-icon" />
              <input
                id="event-start-time"
                type="text"
                className="form-input"
                placeholder="e.g. 10:00 AM"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="event-end-time">
              End Time *
            </label>
            <div className="input-with-icon">
              <Clock size={18} className="input-leading-icon" />
              <input
                id="event-end-time"
                type="text"
                className="form-input"
                placeholder="e.g. 05:00 PM"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Venue / Campus Location */}
        <div className="form-group">
          <label className="form-label" htmlFor="event-venue">
            Campus Venue / Location *
          </label>
          <div className="input-with-icon">
            <MapPin size={18} className="input-leading-icon" />
            <input
              id="event-venue"
              type="text"
              className="form-input"
              placeholder="e.g. Main Auditorium & Quadrangle, Central Campus"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Organizer & Department */}
        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label" htmlFor="event-organizer">
              Hosting Club / Committee *
            </label>
            <input
              id="event-organizer"
              type="text"
              className="form-input"
              style={{ paddingLeft: '1rem' }}
              placeholder="e.g. Robotics & AI Club"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="event-seats">
              Seat Capacity
            </label>
            <input
              id="event-seats"
              type="number"
              min="10"
              max="10000"
              className="form-input"
              style={{ paddingLeft: '1rem' }}
              value={totalSeats}
              onChange={(e) => setTotalSeats(e.target.value)}
            />
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label" htmlFor="event-description">
            Event Description (Min 20 characters) *
          </label>
          <textarea
            id="event-description"
            className="form-textarea"
            placeholder="Provide a compelling overview of your event, activities, guest speakers, eligibility, and what participants should expect..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Image Upload & Presets */}
        <div className="form-group">
          <label className="form-label">Event Banner Image *</label>

          <div className="image-upload-zone">
            <input
              id="image-file-input"
              type="file"
              accept="image/*"
              className="file-input-hidden"
              onChange={handleImageFileChange}
            />
            <label htmlFor="image-file-input" className="upload-action-content">
              <div className="upload-icon-circle">
                <Upload size={22} />
              </div>
              <span className="upload-instruction">
                {isCompressing ? 'Compressing image...' : 'Click to upload banner from computer'}
              </span>
              <span className="upload-hint">
                Auto-compressed to 800px width JPEG via Canvas for instant loading
              </span>
            </label>

            {/* Live Image Preview */}
            {imagePreview && (
              <div className="image-preview-wrapper">
                <img src={imagePreview} alt="Banner Preview" className="image-preview-img" />
              </div>
            )}
          </div>

          {/* One-Click Presets */}
          <div className="presets-section">
            <span className="presets-label">Or choose one of our verified high-res campus presets:</span>
            <div className="preset-thumbnails-row">
              {PRESET_BANNERS.map((preset) => (
                <div
                  key={preset.name}
                  className={`preset-thumb-card ${imagePreview === preset.url ? 'active' : ''}`}
                  onClick={() => handleSelectPreset(preset.url)}
                  role="button"
                  tabIndex={0}
                >
                  <img src={preset.url} alt={preset.name} className="preset-thumb-img" />
                  <span className="preset-thumb-title">{preset.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Free vs Paid Pricing */}
        <div className="pricing-options-box">
          <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
            Event Registration Fee *
          </label>

          <div className="pricing-radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="pricingType"
                checked={!isPaid}
                onChange={() => {
                  setIsPaid(false);
                  setPrice('0');
                }}
                className="radio-custom"
              />
              <span>Free Event</span>
            </label>

            <label className="radio-label">
              <input
                type="radio"
                name="pricingType"
                checked={isPaid}
                onChange={() => {
                  setIsPaid(true);
                  if (price === '0') setPrice('199');
                }}
                className="radio-custom"
              />
              <span>Paid Event</span>
            </label>
          </div>

          {isPaid && (
            <div className="form-group animate-fade-in" style={{ marginTop: '1rem' }}>
              <label className="form-label" htmlFor="event-price">
                Ticket Price (in ₹) *
              </label>
              <div className="input-with-icon">
                <Tag size={18} className="input-leading-icon" />
                <input
                  id="event-price"
                  type="number"
                  min="1"
                  step="1"
                  className="form-input"
                  placeholder="e.g. 199"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required={isPaid}
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary"
          style={{
            padding: '1rem',
            fontSize: '1.05rem',
            borderRadius: 'var(--radius-full)',
            marginTop: '1rem'
          }}
          disabled={isSubmitting || isCompressing}
        >
          <CalendarPlus size={20} />
          <span>{isSubmitting ? 'Publishing Event...' : 'Publish Event'}</span>
        </button>
      </form>
    </div>
  );
};

