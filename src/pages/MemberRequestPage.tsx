import React, { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import { PageHero, PageSection, DarkCard } from '../components/ui';
import { createMemberRequest } from '../services/invite.service';

const MemberRequestPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.discordUsername || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => email.trim().length > 0 && name.trim().length >= 2,
    [email, name]
  );

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== Role.GUEST) {
    return (
      <>
        <PageHero
          title="Member Request"
          subtitle="Your account already has member access."
        />
        <PageSection>
          <DarkCard>
            <div style={{ padding: '24px' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
                Only guest accounts need to submit a member request.
              </p>
              <Link to="/" className="btn btn-primary btn-sm">
                Back to Home
              </Link>
            </div>
          </DarkCard>
        </PageSection>
      </>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!canSubmit) {
      setError('Please provide a valid name and email.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createMemberRequest({
        email: email.trim(),
        name: name.trim(),
        message: message.trim() || undefined,
      });

      setSuccess('Your member request has been submitted. An admin will review it soon.');
      setMessage('');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to submit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        title="Request Member Access"
        subtitle="Guests can request promotion to member status for full community access."
      />
      <PageSection>
        <DarkCard>
          <div style={{ padding: '24px', maxWidth: '720px', margin: '0 auto' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              Submit this form to request member status. Once approved, you will gain full access to member-only features and profile visibility.
            </p>

            {error && (
              <div style={{ background: 'rgba(160, 30, 30, 0.2)', border: '1px solid #cc4444', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                <p style={{ color: '#ff9999' }}>{error}</p>
              </div>
            )}

            {success && (
              <div style={{ background: 'rgba(22, 163, 74, 0.15)', border: '1px solid #22c55e', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                <p style={{ color: '#86efac' }}>{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
              <label style={{ display: 'grid', gap: '4px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Email</span>
                <input
                  className="input-dark"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label style={{ display: 'grid', gap: '4px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Name</span>
                <input
                  className="input-dark"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your display name"
                  required
                  minLength={2}
                />
              </label>

              <label style={{ display: 'grid', gap: '4px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Message (optional)</span>
                <textarea
                  className="input-dark"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="Tell admins why you'd like to be promoted to member."
                />
              </label>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <Link to="/" className="btn btn-secondary btn-sm">
                  Cancel
                </Link>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting || !canSubmit}>
                  {isSubmitting ? 'Submitting...' : 'Submit Member Request'}
                </button>
              </div>
            </form>
          </div>
        </DarkCard>
      </PageSection>
    </>
  );
};

export default MemberRequestPage;
