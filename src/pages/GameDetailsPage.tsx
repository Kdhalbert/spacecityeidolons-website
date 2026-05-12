import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGames';
import { PageHero, PageSection, DarkCard } from '../components/ui';

const GameDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: game, isLoading, error } = useGame(id ?? '');

  if (isLoading) {
    return (
      <>
        <PageHero title="Game" />
        <PageSection>
          <DarkCard>
            <div style={{ padding: '32px', textAlign: 'center', fontFamily: 'Cinzel' }}>
              Loading game...
            </div>
          </DarkCard>
        </PageSection>
      </>
    );
  }

  if (error || !game) {
    return (
      <>
        <PageHero title="Game Not Found" />
        <PageSection>
          <DarkCard>
            <div style={{ padding: '32px', textAlign: 'center', fontFamily: 'Cinzel' }}>
              <p style={{ marginBottom: '16px' }}>We couldn't find that game.</p>
              <button className="invite-btn" onClick={() => navigate('/games')}>
                Browse All Games
              </button>
            </div>
          </DarkCard>
        </PageSection>
      </>
    );
  }

  return (
    <>
      <PageHero
        title={game.name}
        subtitle={game.category ?? undefined}
        description={game.description ?? undefined}
      />
      <PageSection>
        <DarkCard>
          <div style={{ padding: '32px' }}>
            {game.content && (
              <div
                style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7' }}
                dangerouslySetInnerHTML={{ __html: game.content }}
              />
            )}
            {game.tags && game.tags.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <strong>Tags:</strong>{' '}
                {game.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      display: 'inline-block',
                      background: 'var(--primary-purple)',
                      border: '1px solid var(--gold)',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      marginRight: '6px',
                      fontSize: '0.875rem',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div style={{ marginTop: '32px' }}>
              <button className="invite-btn" onClick={() => navigate('/games')}>
                ← Back to Games
              </button>
            </div>
          </div>
        </DarkCard>
      </PageSection>
    </>
  );
};

export default GameDetailsPage;
