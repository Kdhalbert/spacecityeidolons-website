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
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          Success! Request Received
        </h3>
        <p className="text-green-800 mb-4">
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Request {platformName} Invite
        </h3>
        <p className="text-gray-600 mb-4">
          {platform === 'DISCORD' 
            ? 'Chat with community members, find gaming groups, and stay updated on events.'
            : 'A privacy-focused alternative with end-to-end encryption.'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
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

      <div className="w-full">
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Message (Optional)
        </label>
        <textarea
          {...register('message')}
          id="message"
          rows={3}
          placeholder="Tell us a bit about yourself and why you want to join..."
          className={`
            w-full px-3 py-2 border rounded-lg
            bg-white text-gray-900 placeholder-gray-400
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${errors.message ? 'border-red-500' : 'border-gray-300'}
            disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50
          `}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Submitting...' : 'Request Invite'}
      </Button>
    </form>
  );
};
