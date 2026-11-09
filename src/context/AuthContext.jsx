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

  const registerUserForEvent = useCallback((pass) => {
    if (!user) return;
    const existingIndex = user.registeredEvents?.findIndex((p) => p.eventId === pass.eventId);
    let updatedRegistrations = user.registeredEvents ? [...user.registeredEvents] : [];

    if (existingIndex >= 0) {
      updatedRegistrations[existingIndex] = pass;
    } else {
      updatedRegistrations.push(pass);
    }

    const updatedUser = {
      ...user,
      registeredEvents: updatedRegistrations
    };

    authService.updateUser(updatedUser);
    setUser(updatedUser);
  }, [user]);

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

