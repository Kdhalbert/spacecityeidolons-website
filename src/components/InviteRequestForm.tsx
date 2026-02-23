import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from './Input';
import { Button } from './Button';
import { createInviteRequest } from '../services/invite.service';
import type { Platform } from '../types';

const inviteRequestSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Invalid email address'),
  name: z.string().trim().min(1, 'Name is required').min(2, 'Name is too short - minimum 2 characters'),
  message: z.string().max(1000, 'Message must be less than 1000 characters').optional().or(z.literal('')),
});

type InviteRequestForm = z.infer<typeof inviteRequestSchema>;

interface InviteRequestFormProps {
  platform: Platform;
}

export const InviteRequestForm: React.FC<InviteRequestFormProps> = ({ platform }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InviteRequestForm>({
    resolver: zodResolver(inviteRequestSchema),
  });

  const platformName = platform === 'DISCORD' ? 'Discord' : 'Matrix/Element';

  const onSubmit = async (data: InviteRequestForm) => {
    try {
      setError(null);
      await createInviteRequest({
        ...data,
        platform,
      });
      setIsSubmitted(true);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    }
  };

  if (isSubmitted) {
    return (
      <div style={{ background: 'rgba(50, 29, 60, 0.8)', border: '1px solid var(--gold)', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ color: 'var(--gold)', fontFamily: "'Cinzel', serif", marginBottom: '8px', letterSpacing: '1px' }}>
          Success! Request Received
        </h3>
        <p style={{ color: 'var(--text-light)', fontFamily: 'sans-serif', lineHeight: '1.6', marginBottom: '16px' }}>
          We appreciate your interest in joining our {platformName} community.
          We'll review your submission and send an invite to your email soon.
        </p>
        <Button
          variant="secondary"
          onClick={() => setIsSubmitted(false)}
        >
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }} noValidate>
      <div>
        <h3 style={{ color: 'var(--gold)', fontFamily: "'Cinzel', serif", fontSize: '1.1rem', marginBottom: '6px', letterSpacing: '0.5px' }}>
          Request {platformName} Invite
        </h3>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'sans-serif', fontSize: '0.9rem', lineHeight: '1.5' }}>
          {platform === 'DISCORD'
            ? 'Chat with community members, find gaming groups, and stay updated on events.'
            : 'A privacy-focused alternative with end-to-end encryption.'}
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(80, 0, 0, 0.4)', border: '1px solid #cc4444', borderRadius: '8px', padding: '12px' }}>
          <p style={{ color: '#ff9999', fontFamily: 'sans-serif', fontSize: '0.88rem' }}>{error}</p>
        </div>
      )}

      <Input
        {...register('email')}
        type="email"
        label="Email Address"
        placeholder="your.email@example.com"
        error={errors.email?.message}
        required
      />

      <Input
        {...register('name')}
        type="text"
        label="Name"
        placeholder="Your name or username"
        error={errors.name?.message}
        required
      />

      <div className="input-field-wrapper">
        <label htmlFor="message" className="input-dark-label">
          Message (Optional)
        </label>
        <textarea
          {...register('message')}
          id="message"
          rows={3}
          placeholder="Tell us a bit about yourself and why you want to join..."
          className={`input-dark${errors.message ? ' input-dark-error' : ''}`}
          style={{ resize: 'vertical' }}
        />
        {errors.message && (
          <p className="input-error-text">{errors.message.message}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        fullWidth
        style={{ marginTop: 'auto' }}
      >
        {isSubmitting ? 'Submitting...' : 'Request Invite'}
      </Button>
    </form>
  );
};
