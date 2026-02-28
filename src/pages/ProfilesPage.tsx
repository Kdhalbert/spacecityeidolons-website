import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfiles, useSearchProfiles, useProfilesByGame } from '../hooks/useProfile';
import { ProfileCard } from '../components/profile/ProfileCard';
import { PageHero, PageSection, DarkCard } from '../components/ui';

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

  let profiles = [];
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

  // Dynamically extract all unique games from all profiles
  const availableGames = useMemo(() => {
    if (!allProfilesQuery.data) return [];
    
    const gamesSet = new Set<string>();
    allProfilesQuery.data.forEach((profile) => {
      if (profile.gamesPlayed && Array.isArray(profile.gamesPlayed)) {
        profile.gamesPlayed.forEach((game) => {
          if (game && game.trim()) {
            gamesSet.add(game.trim());
          }
        });
      }
    });
    
    // Convert to array and sort alphabetically
    return Array.from(gamesSet).sort((a, b) => a.localeCompare(b));
  }, [allProfilesQuery.data]);

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
              className={selectedGame === '' ? 'invite-btn' : 'invite-btn'}
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
            {availableGames.map((game) => (
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
          <div style={{ 
            backgroundColor: 'rgba(13, 27, 42, 0.8)',
            borderRadius: '12px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px' 
          }}>
            {profiles.map((profile) => (
              <div
                key={profile.userId}
                onClick={() => navigate(`/profile/${profile.userId}`)}
                style={{ cursor: 'pointer', marginLeft: '12px', marginRight: '12px' }}
              >
                <ProfileCard profile={profile} />
              </div>
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
