import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentSession());
  const [loading, setLoading] = useState(true);

  // Sync session on mount
  useEffect(() => {
    try {
      const activeUser = authService.getCurrentSession();
      setUser(activeUser);
    } catch (err) {
      console.error('Failed to load session:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const loggedUser = await authService.login({ email, password });
    setUser(loggedUser);
    return loggedUser;
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const registeredUser = await authService.register({ name, email, password });
    setUser(registeredUser);
    return registeredUser;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const elevateToOrganizer = useCallback(() => {
    if (!user) return null;
    const elevated = authService.elevateRole(user.id, 'Organizer');
    if (elevated) {
      setUser(elevated);
    }
    return elevated;
  }, [user]);

  /**
   * Registers user for an event and stores rich booking metadata
   * Supports both Free events (totalAmount: 0, paymentMethod: "Free Entry")
   * and Paid events (quantity, totalAmount, transactionId, method) with 100% backward compatibility.
   */
  const registerForEvent = useCallback((eventId, bookingDetails = {}) => {
    if (!user) return null;

    const bookingId = bookingDetails.bookingId || `PLN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const quantity = Number(bookingDetails.quantity) || 1;
    const totalAmount = bookingDetails.totalAmount !== undefined ? Number(bookingDetails.totalAmount) : 0;
    const paymentMethod = bookingDetails.paymentMethod || bookingDetails.method || (totalAmount > 0 ? 'Online Payment' : 'Free Entry');
    const transactionId = bookingDetails.transactionId || (totalAmount > 0 ? `TXN${Date.now()}` : 'FREE-ADMISSION');
    const registeredAt = bookingDetails.paidAt || bookingDetails.registeredAt || new Date().toISOString();
    const passCode = bookingDetails.passCode || `PASS-${Math.floor(100000 + Math.random() * 900000)}`;

    const passRecord = {
      eventId,
      eventTitle: bookingDetails.eventTitle || '',
      eventDate: bookingDetails.eventDate || '',
      displayDate: bookingDetails.displayDate || null,
      time: bookingDetails.time || '',
      venue: bookingDetails.venue || '',
      priceDisplay: bookingDetails.priceDisplay || (totalAmount > 0 ? `₹${totalAmount}` : 'Free'),
      bookingId,
      transactionId,
      quantity,
      totalAmount,
      paymentMethod,
      registeredAt,
      passCode,
      attendeeName: user.name,
      attendeeEmail: user.email,
      status: 'Confirmed'
    };

    const existingIndex = user.registeredEvents?.findIndex((p) => p.eventId === eventId);
    let updatedRegistrations = user.registeredEvents ? [...user.registeredEvents] : [];

    if (existingIndex >= 0) {
      updatedRegistrations[existingIndex] = { ...updatedRegistrations[existingIndex], ...passRecord };
    } else {
      updatedRegistrations.push(passRecord);
    }

    const updatedUser = {
      ...user,
      registeredEvents: updatedRegistrations
    };

    authService.updateUser(updatedUser);
    setUser(updatedUser);
    return passRecord;
  }, [user]);

  // Backward compatible alias for existing passes
  const registerUserForEvent = useCallback((pass) => {
    if (!pass) return null;
    return registerForEvent(pass.eventId, pass);
  }, [registerForEvent]);

  const cancelUserEventRegistration = useCallback((eventId) => {
    if (!user) return;
    const updatedRegistrations = (user.registeredEvents || []).filter((p) => p.eventId !== eventId);
    const updatedUser = {
      ...user,
      registeredEvents: updatedRegistrations
    };

    authService.updateUser(updatedUser);
    setUser(updatedUser);
  }, [user]);

  const addHostedEventId = useCallback((eventId) => {
    if (!user) return;
    const hostedList = user.hostedEvents ? [...user.hostedEvents] : [];
    if (!hostedList.includes(eventId)) {
      hostedList.push(eventId);
    }

    // Also elevate role to Organizer if not already
    const updatedUser = {
      ...user,
      role: 'Organizer',
      hostedEvents: hostedList
    };

    authService.updateUser(updatedUser);
    setUser(updatedUser);
  }, [user]);

  const removeHostedEventId = useCallback((eventId) => {
    if (!user) return;
    const hostedList = (user.hostedEvents || []).filter((id) => id !== eventId);
    const updatedUser = {
      ...user,
      hostedEvents: hostedList
    };

    authService.updateUser(updatedUser);
    setUser(updatedUser);
  }, [user]);

  const isEventRegistered = useCallback((eventId) => {
    if (!user || !user.registeredEvents) return false;
    return user.registeredEvents.some((p) => p.eventId === eventId);
  }, [user]);

  const isEventHosted = useCallback((eventId) => {
    if (!user) return false;
    if (user.hostedEvents && user.hostedEvents.includes(eventId)) return true;
    return false;
  }, [user]);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    login,
    register,
    logout,
    elevateToOrganizer,
    registerForEvent,
    registerUserForEvent,
    cancelUserEventRegistration,
    addHostedEventId,
    removeHostedEventId,
    isEventRegistered,
    isEventHosted
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
