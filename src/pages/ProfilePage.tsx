import React from 'react';
import { PageHero, PageSection, DarkCard } from '../components/ui';

const ProfilePage: React.FC = () => (
  <>
    <PageHero title="Your Profile" subtitle="Manage your account" />
    <PageSection>
      {/* TODO: Add profile form and settings */}
      <DarkCard>
        <h2>Profile Settings</h2>
        <p>Profile management coming soon.</p>
      </DarkCard>
    </PageSection>
  </>
);

export default ProfilePage;
