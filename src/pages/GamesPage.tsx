import React from 'react';
import { PageHero, PageSection, SectionTitle, DarkCard } from '../components/ui';

const GamesPage: React.FC = () => (
  <>
    <PageHero
      title="Games"
      subtitle="A Gaming Community"
      description="Browse the games we play and request new ones to add."
    />
    <PageSection>
      <SectionTitle subtitle="Games our community plays most.">Featured Games</SectionTitle>
      {/* TODO: Add games list and request form */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {[0, 1, 2].map((i) => (
          <DarkCard key={i}>
            <h3>Coming Soon</h3>
            <p>Game listings will appear here once populated.</p>
          </DarkCard>
        ))}
      </div>
    </PageSection>
  </>
);

export default GamesPage;
