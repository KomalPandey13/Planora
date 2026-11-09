import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { eventService } from '../services/eventService';

const EventContext = createContext(null);

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState(() => eventService.getEvents());
  const [loading, setLoading] = useState(false);

  const refreshEvents = useCallback(() => {
    const list = eventService.getEvents();
    setEvents(list);
  }, []);

  const getEventById = useCallback((id) => {
    return eventService.getEventById(id);
  }, []);

  const searchAndFilter = useCallback(({ query = '', category = 'All' }) => {
    return eventService.searchAndFilterEvents({ query, category });
  }, []);

  const addNewEvent = useCallback((eventData, currentUser) => {
    const newEvent = eventService.createEvent(eventData, currentUser);
    refreshEvents();
    return newEvent;
  }, [refreshEvents]);

  const registerForEvent = useCallback((eventId, currentUser) => {
    const result = eventService.registerForEvent(eventId, currentUser);
    refreshEvents();
    return result;
  }, [refreshEvents]);

  const cancelEventRegistration = useCallback((eventId) => {
    const result = eventService.cancelRegistration(eventId);
    refreshEvents();
    return result;
  }, [refreshEvents]);

  const deleteEvent = useCallback((eventId, userId) => {
    const result = eventService.deleteEvent(eventId, userId);
    refreshEvents();
    return result;
  }, [refreshEvents]);

  const value = {
    events,
    loading,
    refreshEvents,
    getEventById,
    searchAndFilter,
    addNewEvent,
    registerForEvent,
    cancelEventRegistration,
    deleteEvent
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};

