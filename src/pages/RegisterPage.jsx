import React, { useEffect } from 'react';
import { RegisterForm } from '../components/RegisterForm';

export const RegisterPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="auth-page-container">
      <RegisterForm />
    </div>
  );
};

