import React from 'react';
import { PageHero, PageSection, SectionTitle, DarkCard } from '../components/ui';

const EventsPage: React.FC = () => (
  <>
    <PageHero
      title="Events"
      subtitle="Gaming Sessions & Gatherings"
      description="Upcoming events and gaming sessions you can join."
    />
    <PageSection>
      <SectionTitle subtitle="Sign up for upcoming events.">Upcoming Events</SectionTitle>
      {/* TODO: Add events list and calendar */}
      <DarkCard>
        <h2>No Upcoming Events</h2>
        <p>Check back soon — we'll post gaming sessions, tournaments, and social events here.</p>
      </DarkCard>
    </PageSection>
  </>
);

export default EventsPage;
