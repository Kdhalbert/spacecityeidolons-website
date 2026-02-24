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
  onSubmit: (data: any) => Promise<void>;
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

  const handleFormSubmit = async (data: any) => {
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
        <div style={{ padding: '32px' }}>
          <h2 style={{ marginBottom: '24px', fontSize: '1.5rem' }}>Edit Your Profile</h2>

          <form onSubmit={handleSubmit(handleFormSubmit)}>
            {/* Display Name */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'sans-serif', fontWeight: '500' }}>
                Display Name
              </label>
              <Input
                {...register('displayName')}
                placeholder="How should others see you?"
                maxLength={100}
                error={errors.displayName?.message}
              />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0', fontFamily: 'sans-serif' }}>
                {displayName?.length || 0}/100
              </p>
            </div>

            {/* Bio */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'sans-serif', fontWeight: '500' }}>
                Bio
              </label>
              <textarea
                {...register('bio')}
                placeholder="Tell us about yourself..."
                maxLength={500}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'rgba(88, 101, 242, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontFamily: 'sans-serif',
                  fontSize: '1rem',
                  minHeight: '100px',
                  resize: 'vertical',
                }}
              />
              {errors.bio && (
                <p style={{ color: 'var(--error-color)', fontSize: '0.85rem', margin: '4px 0 0 0', fontFamily: 'sans-serif' }}>
                  {errors.bio.message}
                </p>
              )}
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0', fontFamily: 'sans-serif' }}>
                {bio?.length || 0}/500
              </p>
            </div>

            {/* Games */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'sans-serif', fontWeight: '500' }}>
                Games You Play
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
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
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: 'rgba(88, 101, 242, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontFamily: 'sans-serif',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddGame}
                    className="invite-btn"
                    style={{ padding: '10px 16px' }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Selected Games */}
              {selectedGames.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  {selectedGames.map((game) => (
                    <span
                      key={game}
                      style={{
                        backgroundColor: 'rgba(88, 101, 242, 0.2)',
                        color: 'var(--purple-lighter)',
                        padding: '6px 12px',
                        borderRadius: '16px',
                        fontFamily: 'sans-serif',
                        fontSize: '0.9rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      {game}
                      <button
                        type="button"
                        onClick={() => handleRemoveGame(game)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--purple-lighter)',
                          cursor: 'pointer',
                          fontSize: '1.2rem',
                          lineHeight: '1',
                          padding: '0',
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'sans-serif' }}>
                {selectedGames.length}/20 games
              </p>
            </div>

            {/* Twitch URL */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'sans-serif', fontWeight: '500' }}>
                Twitch URL
              </label>
              <Input
                {...register('twitchUrl')}
                placeholder="https://twitch.tv/yourname"
                error={errors.twitchUrl?.message}
              />
              {!errors.twitchUrl && twitchUrl && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-success)', margin: '4px 0 0 0', fontFamily: 'sans-serif' }}>
                  ✓ Valid Twitch URL
                </p>
              )}
            </div>

            {/* Location */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'sans-serif', fontWeight: '500' }}>
                Location
              </label>
              <Input {...register('location')} placeholder="e.g., Austin, TX" />
            </div>

            {/* Timezone */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'sans-serif', fontWeight: '500' }}>
                Timezone
              </label>
              <Input {...register('timezone')} placeholder="e.g., America/Chicago" />
            </div>

            {/* Privacy Settings */}
            <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Privacy Settings</h3>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'sans-serif', fontWeight: '500', cursor: 'pointer' }}>
                  <input
                    {...register('privacyProfile')}
                    type="checkbox"
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                  Profile Privacy
                </label>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '8px 0 0 26px' }}>
                  When private, only you can see your full profile
                </p>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'sans-serif', fontWeight: '500', cursor: 'pointer' }}>
                  <input
                    {...register('privacyEvents')}
                    type="checkbox"
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                  Event Privacy
                </label>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '8px 0 0 26px' }}>
                  Hide your event attendance from others
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="invite-btn"
              style={{
                width: '100%',
                marginTop: '32px',
                padding: '12px',
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
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
