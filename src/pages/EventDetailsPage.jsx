import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { EventDetails } from '../components/EventDetails';

export const EventDetailsPage = () => {
  const { id } = useParams();
  const { getEventById } = useEvents();

  const event = getEventById(id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  return <EventDetails event={event} />;
};

