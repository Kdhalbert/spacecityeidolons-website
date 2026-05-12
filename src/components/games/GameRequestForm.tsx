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
    <form className="game-request-form" onSubmit={handleSubmit(onValid)} noValidate>
      {conflictMessage && (
        <div className="game-request-alert" role="alert">
          {conflictMessage}
        </div>
      )}

      <div className="input-field-wrapper">
        <label htmlFor="game-name" className="input-dark-label">
          Game Name
        </label>
        <input
          id="game-name"
          type="text"
          {...register('gameName')}
          placeholder="Name of the game"
          className={`input-dark ${errors.gameName ? 'input-dark-error' : ''}`.trim()}
          disabled={isLoading}
          aria-invalid={!!errors.gameName}
          aria-describedby={errors.gameName ? 'game-name-error' : undefined}
        />
        {errors.gameName && (
          <p id="game-name-error" role="alert" className="input-error-text">
            {errors.gameName.message}
          </p>
        )}
      </div>

      <div className="input-field-wrapper">
        <label htmlFor="game-description" className="input-dark-label">
          Description (optional)
        </label>
        <textarea
          id="game-description"
          {...register('description')}
          placeholder="Brief description of the game"
          className={`input-dark game-request-textarea ${errors.description ? 'input-dark-error' : ''}`.trim()}
          disabled={isLoading}
          rows={4}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'game-description-error' : undefined}
        />
        {errors.description && (
          <p id="game-description-error" role="alert" className="input-error-text">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="input-field-wrapper">
        <label htmlFor="game-reason" className="input-dark-label">
          Why should we add this game?
        </label>
        <textarea
          id="game-reason"
          {...register('reason')}
          placeholder="Tell us why this game would benefit the community..."
          className={`input-dark game-request-textarea ${errors.reason ? 'input-dark-error' : ''}`.trim()}
          disabled={isLoading}
          rows={5}
          aria-invalid={!!errors.reason}
          aria-describedby={errors.reason ? 'game-reason-error' : undefined}
        />
        {errors.reason && (
          <p id="game-reason-error" role="alert" className="input-error-text">
            {errors.reason.message}
          </p>
        )}
      </div>

      <div className="game-request-actions">
        <button type="button" className="btn btn-secondary btn-md" onClick={onCancel} disabled={isLoading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary btn-md" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
};
