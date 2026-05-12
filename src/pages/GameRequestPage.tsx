import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHero, PageSection } from '../components/ui';
import { GameRequestForm } from '../components/games/GameRequestForm';
import { useCreateGameRequest, useMyGameRequests } from '../hooks/useGames';
import type { GamePageRequestInput } from '../types';

const GameRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateGameRequest();
  const { data: myRequests } = useMyGameRequests();
  const [conflictMessage, setConflictMessage] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();

  const handleSubmit = async (data: GamePageRequestInput) => {
    setConflictMessage(undefined);
    try {
      await createMutation.mutateAsync(data);
      setSuccessMessage(`Your request for "${data.gameName}" has been submitted!`);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (status === 409) {
        setConflictMessage(msg ?? 'A game or request with this name already exists.');
      } else {
        setConflictMessage(msg ?? 'Failed to submit request. Please try again.');
      }
    }
  };

  if (successMessage) {
    return (
      <>
        <PageHero title="Request Submitted" subtitle="Game Page Request" />
        <PageSection>
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <p style={{ marginBottom: '16px' }}>{successMessage}</p>
            {myRequests && myRequests.length > 0 && (
              <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                <h3>Your Requests</h3>
                <ul>
                  {myRequests.map((r) => (
                    <li key={r.id}>
                      <strong>{r.gameName}</strong> — {r.status}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button className="invite-btn" onClick={() => navigate('/games')}>
              Back to Games
            </button>
          </div>
        </PageSection>
      </>
    );
  }

  return (
    <>
      <PageHero
        title="Request a Game Page"
        subtitle="Game Page Request"
        description="Can't find a game our community plays? Submit a request and we'll review it."
      />
      <PageSection>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <GameRequestForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/games')}
            isLoading={createMutation.isPending}
            conflictMessage={conflictMessage}
          />
        </div>
      </PageSection>
    </>
  );
};

export default GameRequestPage;
