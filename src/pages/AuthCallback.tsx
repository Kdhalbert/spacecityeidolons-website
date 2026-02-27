import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuth } from '../hooks/useAuth';
import { PageHero, DarkCard } from '../components/ui';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasProcessedCode = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent duplicate processing of the same code
      if (hasProcessedCode.current) {
        return;
      }
      hasProcessedCode.current = true;
      try {
        // Check for error parameter (user denied authorization)
        const errorParam = searchParams.get('error');
        if (errorParam) {
          if (errorParam === 'access_denied') {
            setError('You cancelled the login process.');
          } else {
            setError(`Authentication error: ${errorParam}`);
          }
          setIsLoading(false);
          return;
        }

        // Check for authorization code
        const code = searchParams.get('code');
        if (!code) {
          setError('Missing authorization code. Please try logging in again.');
          setIsLoading(false);
          return;
        }

        // Exchange code for tokens
        await authService.handleOAuthCallback(code);
        
        // Refresh user data in context
        await refreshUser();

        // Redirect to home page
        navigate('/', { replace: true });
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(
          err instanceof Error 
            ? err.message 
            : 'An unexpected error occurred. Please try again.'
        );
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, refreshUser]);

  if (isLoading) {
    return (
      <>
        <PageHero title="Signing In" subtitle="Please wait..." />
        <div className="content-section" style={{ maxWidth: '480px' }}>
          <DarkCard>
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div 
                className="spinner" 
                style={{
                  width: '48px',
                  height: '48px',
                  margin: '0 auto 24px',
                  border: '4px solid var(--border-color)',
                  borderTop: '4px solid #5865F2',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <p style={{ 
                color: 'var(--text-primary)', 
                fontFamily: 'sans-serif',
                fontSize: '16px',
                margin: 0,
              }}>
                Completing login...
              </p>
            </div>
          </DarkCard>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHero title="Authentication Failed" subtitle="Something went wrong" />
        <div className="content-section" style={{ maxWidth: '480px' }}>
          <DarkCard>
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 24px',
                borderRadius: '50%',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg 
                  width="32" 
                  height="32" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#DC2626" 
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              
              <h3 style={{
                color: 'var(--text-primary)',
                fontFamily: 'sans-serif',
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '12px',
              }}>
                Authentication Failed
              </h3>
              
              <p style={{
                color: 'var(--text-muted)',
                fontFamily: 'sans-serif',
                fontSize: '14px',
                marginBottom: '32px',
                lineHeight: '1.6',
              }}>
                {error}
              </p>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Link
                  to="/login"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#5865F2',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontFamily: 'sans-serif',
                    fontWeight: '600',
                    fontSize: '14px',
                  }}
                >
                  Try Again
                </Link>
                
                <Link
                  to="/"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontFamily: 'sans-serif',
                    fontWeight: '600',
                    fontSize: '14px',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  Go Home
                </Link>
              </div>
            </div>
          </DarkCard>
        </div>
      </>
    );
  }

  return null;
};

export default AuthCallback;
