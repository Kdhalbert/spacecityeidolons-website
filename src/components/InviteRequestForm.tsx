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
      <div className="invite-success-card">
        <h3 className="invite-success-title">
          Success! Request Received
        </h3>
        <p className="invite-success-copy">
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
    <form onSubmit={handleSubmit(onSubmit)} className="form-stack" style={{ flex: 1 }} noValidate>
      <div>
        <h3 className="form-intro-title">
          Request {platformName} Invite
        </h3>
        <p className="form-intro-copy">
          {platform === 'DISCORD'
            ? 'Chat with community members, find gaming groups, and stay updated on events.'
            : 'A privacy-focused alternative with end-to-end encryption.'}
        </p>
      </div>

      {error && (
        <div className="form-alert form-alert-error">
          <p>{error}</p>
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
          className={`input-dark input-textarea${errors.message ? ' input-dark-error' : ''}`}
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
