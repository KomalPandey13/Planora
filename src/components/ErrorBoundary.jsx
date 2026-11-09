import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FAF8FF',
            padding: '2rem'
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '2.5rem',
              boxShadow: '0 20px 40px rgba(109, 40, 217, 0.12)',
              textAlign: 'center',
              border: '1px solid #E2E8F0'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}
            >
              <AlertTriangle size={32} />
            </div>

            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#1E1B4B',
                marginBottom: '0.75rem',
                fontFamily: 'Plus Jakarta Sans, sans-serif'
              }}
            >
              Something went wrong
            </h2>

            <p
              style={{
                color: '#475569',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                marginBottom: '2rem'
              }}
            >
              An unexpected error occurred while rendering the page. Don't worry, your data is safe.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}
            >
              <button
                onClick={this.handleReload}
                className="btn btn-outline"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '9999px',
                  fontWeight: 600
                }}
              >
                <RefreshCw size={16} />
                Reload Page
              </button>

              <button
                onClick={this.handleReset}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '9999px',
                  fontWeight: 600
                }}
              >
                <Home size={16} />
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

