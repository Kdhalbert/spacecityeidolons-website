import React from 'react';
import { PageHero, DarkCard } from '../components/ui';

const RegisterPage: React.FC = () => (
  <>
    <PageHero title="Create Account" subtitle="Join the community" />
    <div className="content-section" style={{ maxWidth: '480px' }}>
      <DarkCard>
        {/* TODO: Add registration form */}
        <p style={{ color: 'var(--text-muted)', fontFamily: 'sans-serif', textAlign: 'center', padding: '24px 0' }}>
          Registration form coming soon.
        </p>
      </DarkCard>
    </div>
  </>
);

export default RegisterPage;
