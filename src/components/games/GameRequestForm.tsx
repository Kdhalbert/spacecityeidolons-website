import React, { useState } from 'react';
import type { GamePageRequestInput } from '../../types';

interface FormErrors {
  gameName?: string;
  reason?: string;
}

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
  const [gameName, setGameName] = useState('');
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!gameName.trim() || gameName.trim().length < 2) {
      newErrors.gameName = 'Game name must be at least 2 characters';
    }
    if (!reason.trim() || reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      gameName: gameName.trim(),
      description: description.trim() || undefined,
      reason: reason.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
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
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          placeholder="Name of the game"
          disabled={isLoading}
          aria-invalid={!!errors.gameName}
          aria-describedby={errors.gameName ? 'game-name-error' : undefined}
        />
        {errors.gameName && (
          <span id="game-name-error" role="alert">
            {errors.gameName}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="game-description">Description (optional)</label>
        <textarea
          id="game-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the game"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="game-reason">Why should we add this game?</label>
        <textarea
          id="game-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Tell us why this game would benefit the community..."
          disabled={isLoading}
          aria-invalid={!!errors.reason}
          aria-describedby={errors.reason ? 'game-reason-error' : undefined}
        />
        {errors.reason && (
          <span id="game-reason-error" role="alert">
            {errors.reason}
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
