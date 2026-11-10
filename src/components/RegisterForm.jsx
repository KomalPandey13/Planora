import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthForms.css';

export const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const destination = location.state?.from?.pathname || '/explore';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ name, email, password });
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to create your account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card animate-fade-in">
      <div className="auth-card-header">
        <div className="auth-icon-badge">
          <UserPlus size={24} />
        </div>
        <h2 className="auth-title">Join Planora</h2>
        <p className="auth-subtitle">Create your college event passport</p>
      </div>

      {error && (
        <div className="alert-banner alert-danger">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        {/* Full Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="register-name">
            Full Name
          </label>
          <div className="input-with-icon">
            <User size={18} className="input-leading-icon" />
            <input
              id="register-name"
              type="text"
              className="form-input"
              placeholder="e.g. Priya Patel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
        </div>

        {/* College Email */}
        <div className="form-group">
          <label className="form-label" htmlFor="register-email">
            College Email
          </label>
          <div className="input-with-icon">
            <Mail size={18} className="input-leading-icon" />
            <input
              id="register-email"
              type="email"
              className="form-input"
              placeholder="e.g. priya@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="register-password">
            Password (Min 6 Characters)
          </label>
          <div className="input-with-icon">
            <Lock size={18} className="input-leading-icon" />
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="register-confirm-password">
            Confirm Password
          </label>
          <div className="input-with-icon">
            <Lock size={18} className="input-leading-icon" />
            <input
              id="register-confirm-password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary auth-submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Account...' : 'Get Started'}
        </button>
      </form>

      <div className="auth-switch-prompt">
        Already have a Planora account?
        <Link to="/login" state={location.state} className="auth-switch-link">
          Sign In
        </Link>
      </div>
    </div>
  );
};

