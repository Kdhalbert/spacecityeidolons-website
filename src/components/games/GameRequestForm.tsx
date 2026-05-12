import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { GamePageRequestInput } from '../../types';

const gameRequestSchema = z.object({
  gameName: z.string().trim().min(2, 'Game name must be at least 2 characters').max(120, 'Game name must be at most 120 characters'),
  description: z.string().trim().max(500, 'Description must be at most 500 characters').optional().or(z.literal('')),
  reason: z.string().trim().min(10, 'Reason must be at least 10 characters').max(1000, 'Reason must be at most 1000 characters'),
});

type GameRequestFormValues = z.infer<typeof gameRequestSchema>;

interface GameRequestFormProps {
  onSubmit: (data: GamePageRequestInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  conflictMessage?: string;
}

export const GameRequestForm: React.FC<GameRequestFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  conflictMessage,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GameRequestFormValues>({
    resolver: zodResolver(gameRequestSchema),
  });

  const onValid = async (data: GameRequestFormValues) => {
    await onSubmit({
      gameName: data.gameName,
      description: data.description || undefined,
      reason: data.reason,
    });
  };

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate>
      {conflictMessage && (
        <div role="alert" style={{ color: 'red' }}>
          {conflictMessage}
        </div>
      )}

      <div>
        <label htmlFor="game-name">Game Name</label>
        <input
          id="game-name"
          type="text"
          {...register('gameName')}
          placeholder="Name of the game"
          disabled={isLoading}
          aria-invalid={!!errors.gameName}
          aria-describedby={errors.gameName ? 'game-name-error' : undefined}
        />
        {errors.gameName && (
          <span id="game-name-error" role="alert">
            {errors.gameName.message}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="game-description">Description (optional)</label>
        <textarea
          id="game-description"
          {...register('description')}
          placeholder="Brief description of the game"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="game-reason">Why should we add this game?</label>
        <textarea
          id="game-reason"
          {...register('reason')}
          placeholder="Tell us why this game would benefit the community..."
          disabled={isLoading}
          aria-invalid={!!errors.reason}
          aria-describedby={errors.reason ? 'game-reason-error' : undefined}
        />
        {errors.reason && (
          <span id="game-reason-error" role="alert">
            {errors.reason.message}
          </span>
        )}
      </div>

      <div>
        <button type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </button>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
};
