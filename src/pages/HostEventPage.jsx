import React, { useEffect } from 'react';
import { CreateEventForm } from '../components/CreateEventForm';

export const HostEventPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ padding: '3rem 0 5rem', backgroundColor: 'var(--bg-page)', minHeight: 'calc(100vh - var(--navbar-height))' }}>
      <div className="container">
        <CreateEventForm />
      </div>
    </div>
  );
};

