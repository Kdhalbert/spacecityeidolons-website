import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHero, PageSection, SectionTitle, DarkCard } from '../components/ui';
import { useGames } from '../hooks/useGames';
import { useAuth } from '../hooks/useAuth';

const GamesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: gamesResponse, isLoading, error } = useGames();

  return (
    <>
      <PageHero
        title="Games"
        subtitle="A Gaming Community"
        description="Browse the games we play and request new ones to add."
      />
      <PageSection>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <SectionTitle subtitle="Games our community plays most.">Featured Games</SectionTitle>
          {isAuthenticated && (
            <button className="invite-btn" onClick={() => navigate('/games/request')}>
              + Request a Game
            </button>
          )}
        </div>

        {isLoading && (
          <p style={{ textAlign: 'center', fontFamily: 'Cinzel' }}>Loading games...</p>
        )}

        {error && (
          <p style={{ textAlign: 'center', color: 'red' }}>Failed to load games.</p>
        )}

        {!isLoading && !error && gamesResponse && (
          <>
            {gamesResponse.data.length === 0 ? (
              <DarkCard>
                <div style={{ padding: '32px', textAlign: 'center' }}>
                  <p>No games have been added yet.</p>
                  {isAuthenticated && (
                    <button className="invite-btn" onClick={() => navigate('/games/request')} style={{ marginTop: '16px' }}>
                      Be the first to request one
                    </button>
                  )}
                </div>
              </DarkCard>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
                {gamesResponse.data.map((game) => (
                  <DarkCard key={game.id}>
                    {game.imageUrl && (
                      <img
                        src={game.imageUrl}
                        alt={game.name}
                        style={{ width: '100%', borderRadius: '8px', marginBottom: '12px', objectFit: 'cover', maxHeight: '160px' }}
                      />
                    )}
                    <h3 style={{ color: 'var(--gold)', marginBottom: '8px' }}>{game.name}</h3>
                    {game.category && (
                      <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '8px' }}>{game.category}</p>
                    )}
                    {game.description && (
                      <p style={{ fontSize: '0.9rem', marginBottom: '12px', lineHeight: '1.5' }}>
                        {game.description}
                      </p>
                    )}
                    <button
                      className="invite-btn"
                      onClick={() => navigate(`/games/${game.id}`)}
                      style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                    >
                      View Page
                    </button>
                  </DarkCard>
                ))}
              </div>
            )}
          </>
        )}
      </PageSection>
    </>
  );
};

export default GamesPage;
