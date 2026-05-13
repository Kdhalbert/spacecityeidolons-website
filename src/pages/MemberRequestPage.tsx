import React, { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import { PageHero, PageSection, DarkCard } from '../components/ui';
import { createMemberRequest } from '../services/invite.service';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

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
            <div className="member-request-wrap">
              <p className="member-request-copy" style={{ marginBottom: '12px' }}>
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
          <div className="member-request-wrap">
            <p className="member-request-copy">
              Submit this form to request member status. Once approved, you will gain full access to member-only features and profile visibility.
            </p>

            {error && (
              <div className="form-alert form-alert-error" style={{ marginBottom: '12px' }}>
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="form-alert form-alert-success" style={{ marginBottom: '12px' }}>
                <p>{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="form-stack">
              <Input
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

              <Input
                type="text"
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your display name"
                required
                minLength={2}
              />

              <div className="input-field-wrapper">
                <label htmlFor="member-request-message" className="input-dark-label">
                  Message (optional)
                </label>
                <textarea
                  id="member-request-message"
                  className="input-dark input-textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="Tell admins why you'd like to be promoted to member."
                />
              </div>

              <div className="form-actions-end">
                <Link to="/" className="btn btn-secondary btn-sm">
                  Cancel
                </Link>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting || !canSubmit}>
                  {isSubmitting ? 'Submitting...' : 'Submit Member Request'}
                </Button>
              </div>
            </form>
          </div>
        </DarkCard>
      </PageSection>
    </>
  );
};

export default MemberRequestPage;
