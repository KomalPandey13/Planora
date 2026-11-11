import React, { useEffect } from 'react';
import { LoginForm } from '../components/LoginForm';

export const LoginPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="auth-page-container">
      <LoginForm />
    </div>
  );
};

