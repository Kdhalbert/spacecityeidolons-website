import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../Input';
import { PageSection, DarkCard } from '../ui';
import type { Profile } from '../../types';

// Validation schema for profile updates
const profileUpdateSchema = z.object({
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  twitchUrl: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
  timezone: z.string().optional(),
  gamesPlayed: z.array(z.string()).optional(),
  privacyProfile: z.boolean().optional(),
  privacyEvents: z.boolean().optional(),
});

interface ProfileEditorProps {
  profile: Profile | null;
  isLoading?: boolean;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
}

/**
 * ProfileEditor component - form for editing user profile
 */
export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  profile,
  isLoading = false,
  onSubmit,
}) => {
  const [gameInput, setGameInput] = useState('');
  const [selectedGames, setSelectedGames] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      displayName: profile?.displayName || '',
      bio: profile?.bio || '',
      twitchUrl: profile?.twitchUrl || '',
      location: profile?.location || '',
      timezone: profile?.timezone || '',
      gamesPlayed: profile?.gamesPlayed || [],
      privacyProfile: profile?.privacyProfile || false,
      privacyEvents: profile?.privacyEvents || false,
    },
  });

  const displayName = watch('displayName');
  const bio = watch('bio');
  const twitchUrl = watch('twitchUrl');

  useEffect(() => {
    if (profile?.gamesPlayed) {
      setSelectedGames(profile.gamesPlayed);
    }
  }, [profile]);

  const handleAddGame = () => {
    if (gameInput.trim() && !selectedGames.includes(gameInput.trim())) {
      const newGames = [...selectedGames, gameInput.trim()];
      if (newGames.length <= 20) {
        setSelectedGames(newGames);
        setGameInput('');
      }
    }
  };

  const handleRemoveGame = (game: string) => {
    setSelectedGames(selectedGames.filter((g) => g !== game));
  };

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    try {
      await onSubmit({
        ...data,
        gamesPlayed: selectedGames,
      });
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  return (
    <PageSection>
      <DarkCard>
        <div className="profile-editor-wrap">
          <h2 className="profile-editor-title">Edit Your Profile</h2>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="profile-editor-form">
            {/* Display Name */}
            <div className="profile-field">
              <label className="input-dark-label">
                Display Name
              </label>
              <Input
                {...register('displayName')}
                placeholder="How should others see you?"
                maxLength={100}
                error={errors.displayName?.message}
              />
              <p className="profile-help-text">
                {displayName?.length || 0}/100
              </p>
            </div>

            {/* Bio */}
            <div className="profile-field">
              <label className="input-dark-label">
                Bio
              </label>
              <textarea
                {...register('bio')}
                placeholder="Tell us about yourself..."
                maxLength={500}
                className={`input-dark input-textarea${errors.bio ? ' input-dark-error' : ''}`}
              />
              {errors.bio && (
                <p className="input-error-text">
                  {errors.bio.message}
                </p>
              )}
              <p className="profile-help-text">
                {bio?.length || 0}/500
              </p>
            </div>

            {/* Games */}
            <div className="profile-field">
              <label className="input-dark-label">
                Games You Play
              </label>
              <div className="profile-game-input-row">
                <div className="profile-game-input-group">
                  <input
                    type="text"
                    value={gameInput}
                    onChange={(e) => setGameInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddGame();
                      }
                    }}
                    placeholder="Enter game name..."
                    className="input-dark"
                  />
                  <button
                    type="button"
                    onClick={handleAddGame}
                    className="btn btn-secondary btn-md"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Selected Games */}
              {selectedGames.length > 0 && (
                <div className="profile-tag-list">
                  {selectedGames.map((game) => (
                    <span key={game} className="profile-tag">
                      {game}
                      <button
                        type="button"
                        onClick={() => handleRemoveGame(game)}
                        className="profile-tag-remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="profile-help-text">
                {selectedGames.length}/20 games
              </p>
            </div>

            {/* Twitch URL */}
            <div className="profile-field">
              <label className="input-dark-label">
                Twitch URL
              </label>
              <Input
                {...register('twitchUrl')}
                placeholder="https://twitch.tv/yourname"
                error={errors.twitchUrl?.message}
              />
              {!errors.twitchUrl && twitchUrl && (
                <p className="profile-valid-text">
                  ✓ Valid Twitch URL
                </p>
              )}
            </div>

            {/* Location */}
            <div className="profile-field">
              <label className="input-dark-label">
                Location
              </label>
              <Input {...register('location')} placeholder="e.g., Austin, TX" />
            </div>

            {/* Timezone */}
            <div className="profile-field">
              <label className="input-dark-label">
                Timezone
              </label>
              <Input {...register('timezone')} placeholder="e.g., America/Chicago" />
            </div>

            {/* Privacy Settings */}
            <div className="profile-privacy">
              <h3 className="profile-privacy-title">Privacy Settings</h3>

              <div className="profile-privacy-option">
                <label className="profile-checkbox-label">
                  <input
                    {...register('privacyProfile')}
                    type="checkbox"
                    className="profile-checkbox-input"
                  />
                  Profile Privacy
                </label>
                <p className="profile-checkbox-help">
                  When private, only you can see your full profile
                </p>
              </div>

              <div>
                <label className="profile-checkbox-label">
                  <input
                    {...register('privacyEvents')}
                    type="checkbox"
                    className="profile-checkbox-input"
                  />
                  Event Privacy
                </label>
                <p className="profile-checkbox-help">
                  Hide your event attendance from others
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-md btn-full profile-submit-btn"
            >
              {isLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </DarkCard>
    </PageSection>
  );
};

export default ProfileEditor;
