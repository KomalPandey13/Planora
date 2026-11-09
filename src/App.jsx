import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { HomePage } from './pages/HomePage';
import { ExploreEventsPage } from './pages/ExploreEventsPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HostEventPage } from './pages/HostEventPage';
import { ProfilePage } from './pages/ProfilePage';

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <EventProvider>
          <BrowserRouter>
            <div className="app-container">
              <Navbar />
              <main className="main-content">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/explore" element={<ExploreEventsPage />} />
                  <Route path="/events/:id" element={<EventDetailsPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Protected Routes */}
                  <Route
                    path="/host-event"
                    element={
                      <ProtectedRoute>
                        <HostEventPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </EventProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

