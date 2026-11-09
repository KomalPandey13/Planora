import { mockEvents } from '../data/mockEvents';
import { sanitizeInput } from '../utils/security';

const EVENTS_STORAGE_KEY = 'planora_events';

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/**
 * Parses an ISO date string (YYYY-MM-DD) into display components
 */
function parseDateParts(dateStr) {
  if (!dateStr) {
    const now = new Date();
    return {
      day: String(now.getDate()).padStart(2, '0'),
      month: MONTH_NAMES[now.getMonth()],
      year: String(now.getFullYear())
    };
  }

  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parts[2].padStart(2, '0');
    return {
      day,
      month: MONTH_NAMES[monthIndex] || 'NOV',
      year
    };
  }

  const d = new Date(dateStr);
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: MONTH_NAMES[d.getMonth()] || 'NOV',
    year: String(d.getFullYear())
  };
}

export const eventService = {
  /**
   * Initializes event repository with mockEvents if empty
   */
  getEvents() {
    try {
      const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(mockEvents));
        return mockEvents;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(mockEvents));
        return mockEvents;
      }
      return parsed;
    } catch (err) {
      console.error('Error loading events:', err);
      return mockEvents;
    }
  },

  /**
   * Saves events array to localStorage
   */
  saveEvents(events) {
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    } catch (err) {
      console.error('Error saving events:', err);
    }
  },

  /**
   * Fetches single event by ID
   */
  getEventById(id) {
    const events = this.getEvents();
    return events.find((e) => String(e.id) === String(id)) || null;
  },

  /**
   * Searches and filters events by query string and category
   */
  searchAndFilterEvents({ query = '', category = 'All' }) {
    const events = this.getEvents();
    const cleanQuery = query.trim().toLowerCase();
    const cleanCategory = category.trim();

    return events.filter((event) => {
      // Category match
      const matchesCategory =
        !cleanCategory ||
        cleanCategory.toLowerCase() === 'all' ||
        event.category.toLowerCase() === cleanCategory.toLowerCase();

      if (!matchesCategory) return false;

      // Text query match (title, description, tags, organizer)
      if (!cleanQuery) return true;

      const titleMatch = event.title?.toLowerCase().includes(cleanQuery);
      const descMatch = event.description?.toLowerCase().includes(cleanQuery);
      const orgMatch = event.organizer?.toLowerCase().includes(cleanQuery);
      const tagMatch = Array.isArray(event.tags) && event.tags.some((t) => t.toLowerCase().includes(cleanQuery));

      return titleMatch || descMatch || orgMatch || tagMatch;
    });
  },

  /**
   * Creates a new campus event and stores it
   */
  createEvent(eventData, currentUser) {
    const events = this.getEvents();
    const newId = `event-${Date.now()}`;
    const dateParts = parseDateParts(eventData.date);

    const priceNum = eventData.isPaid ? Number(eventData.price) || 0 : 0;
    const isPaid = priceNum > 0;
    const priceDisplay = isPaid ? `₹${priceNum}` : 'Free';

    const newEvent = {
      id: newId,
      title: sanitizeInput(eventData.title),
      category: sanitizeInput(eventData.category) || 'Others',
      description: sanitizeInput(eventData.description),
      date: eventData.date,
      displayDate: dateParts,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      time: `${eventData.startTime} - ${eventData.endTime}`,
      venue: sanitizeInput(eventData.venue),
      organizer: sanitizeInput(eventData.organizer || currentUser?.name || 'Campus Student Club'),
      organizerDepartment: sanitizeInput(eventData.organizerDepartment || 'Student Affairs & Clubs'),
      organizerContact: currentUser?.email || 'events@campus.edu',
      isPaid,
      price: priceNum,
      priceDisplay,
      totalSeats: Number(eventData.totalSeats) || 200,
      availableSeats: Number(eventData.totalSeats) || 200,
      registeredCount: 0,
      image: eventData.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      highlights: Array.isArray(eventData.highlights) && eventData.highlights.length > 0
        ? eventData.highlights.map(sanitizeInput)
        : [
            'Interactive Q&A Session',
            'Certificate of Participation',
            'Campus Networking & Refreshments',
            'Student Club Welcome Kit'
          ],
      tags: [eventData.category, isPaid ? 'Paid' : 'Free', 'Campus Life'],
      featured: false,
      createdBy: currentUser?.id || 'anonymous',
      createdAt: new Date().toISOString()
    };

    // Prepend new event so it shows immediately at the top
    const updatedEvents = [newEvent, ...events];
    this.saveEvents(updatedEvents);
    return newEvent;
  },

  /**
   * Registers a user for an event and returns a digital pass
   */
  registerForEvent(eventId, user) {
    const events = this.getEvents();
    const eventIndex = events.findIndex((e) => String(e.id) === String(eventId));

    if (eventIndex === -1) {
      throw new Error('Event not found');
    }

    const event = events[eventIndex];
    if (event.availableSeats <= 0) {
      throw new Error('This event is completely booked. No seats remaining.');
    }

    // Decrement available seats, increment registeredCount
    event.availableSeats = Math.max(0, (event.availableSeats || 0) - 1);
    event.registeredCount = (event.registeredCount || 0) + 1;
    events[eventIndex] = event;
    this.saveEvents(events);

    // Create digital pass
    const bookingId = `PLN-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const passCode = `PASS-${Math.floor(100000 + Math.random() * 900000)}`;

    const pass = {
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      displayDate: event.displayDate,
      time: event.time,
      venue: event.venue,
      priceDisplay: event.priceDisplay,
      bookingId,
      passCode,
      attendeeName: user.name,
      attendeeEmail: user.email,
      registeredAt: new Date().toISOString(),
      status: 'Confirmed'
    };

    return { event, pass };
  },

  /**
   * Cancels a user's registration
   */
  cancelRegistration(eventId) {
    const events = this.getEvents();
    const eventIndex = events.findIndex((e) => String(e.id) === String(eventId));

    if (eventIndex !== -1) {
      const event = events[eventIndex];
      event.availableSeats = (event.availableSeats || 0) + 1;
      event.registeredCount = Math.max(0, (event.registeredCount || 0) - 1);
      events[eventIndex] = event;
      this.saveEvents(events);
    }
    return true;
  },

  /**
   * Deletes an event (only if owned by current user)
   */
  deleteEvent(eventId, userId) {
    const events = this.getEvents();
    const event = events.find((e) => String(e.id) === String(eventId));
    if (!event) return false;

    if (event.createdBy !== userId) {
      throw new Error('You do not have permission to delete this event.');
    }

    const filtered = events.filter((e) => String(e.id) !== String(eventId));
    this.saveEvents(filtered);
    return true;
  }
};

