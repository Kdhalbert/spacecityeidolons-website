import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfiles, useSearchProfiles, useProfilesByGame } from '../hooks/useProfile';
import { ProfileCard } from '../components/profile/ProfileCard';
import { PageHero, PageSection, DarkCard } from '../components/ui';
import type { Profile } from '../types';

/**
 * ProfilesPage - browse and search community profiles
 */
const ProfilesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'search' | 'game'>('all');

  // Fetch profiles based on current view mode
  const allProfilesQuery = useProfiles(undefined);
  const searchProfilesQuery = useSearchProfiles(searchQuery);
  const gameProfilesQuery = useProfilesByGame(selectedGame);

  let profiles: Profile[] = [];
  let isLoading = false;

  if (viewMode === 'search' && searchQuery) {
    profiles = searchProfilesQuery.data || [];
    isLoading = searchProfilesQuery.isLoading;
  } else if (viewMode === 'game' && selectedGame) {
    profiles = gameProfilesQuery.data || [];
    isLoading = gameProfilesQuery.isLoading;
  } else {
    profiles = allProfilesQuery.data || [];
    isLoading = allProfilesQuery.isLoading;
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      setViewMode('search');
    } else {
      setViewMode('all');
    }
  };

  const handleGameFilter = (game: string) => {
    setSelectedGame(game);
    if (game) {
      setViewMode('game');
    } else {
      setViewMode('all');
    }
  };

  const commonGames = [
    'D&D 5e',
    'Pathfinder 2e',
    'Call of Cthulhu',
    'Vampire: The Masquerade',
    'World of Darkness',
  ];

  return (
    <>
      <PageHero
        title="Community Profiles"
        subtitle="Connect with other players and build your crew"
      />

      <PageSection>
        <DarkCard>
          <div style={{ padding: '24px', marginBottom: '24px' }}>
            <input
              type="text"
              placeholder="Search by display name..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'rgba(88, 101, 242, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontFamily: 'sans-serif',
                fontSize: '1rem',
              }}
            />
          </div>

          {/* Game Filter Chips */}
          <div style={{ padding: '0 24px 24px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              onClick={() => handleGameFilter('')}
              className="invite-btn"
              style={{
                backgroundColor: selectedGame === '' ? 'var(--purple)' : 'rgba(88, 101, 242, 0.2)',
                border: 'none',
                color: selectedGame === '' ? 'white' : 'var(--purple-lighter)',
                padding: '6px 12px',
                borderRadius: '16px',
                cursor: 'pointer',
                fontFamily: 'sans-serif',
              }}
            >
              All Games
            </button>
            {commonGames.map((game) => (
              <button
                key={game}
                onClick={() => handleGameFilter(game)}
                className={selectedGame === game ? 'invite-btn' : ''}
                style={{
                  backgroundColor: selectedGame === game ? 'var(--purple)' : 'rgba(88, 101, 242, 0.2)',
                  border: 'none',
                  color: selectedGame === game ? 'white' : 'var(--purple-lighter)',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontFamily: 'sans-serif',
                }}
              >
                {game}
              </button>
            ))}
          </div>
        </DarkCard>
      </PageSection>

      <PageSection>
        {isLoading ? (
          <DarkCard>
            <div style={{ padding: '32px', textAlign: 'center', fontFamily: 'sans-serif' }}>
              Loading profiles...
            </div>
          </DarkCard>
        ) : profiles.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {profiles.map((profile) => (
              <DarkCard key={profile.userId}>
                <div
                  onClick={() => navigate(`/profile/${profile.userId}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <ProfileCard profile={profile} />
                </div>
              </DarkCard>
            ))}
          </div>
        ) : (
          <DarkCard>
            <div style={{ padding: '32px', textAlign: 'center', fontFamily: 'sans-serif' }}>
              <p>No profiles found. Try a different search or game filter.</p>
            </div>
          </DarkCard>
        )}
      </PageSection>
    </>
  );
};

export default ProfilesPage;
