import React from 'react';
import { PageHero, DarkCard } from '../components/ui';

const LoginPage: React.FC = () => (
  <>
    <PageHero title="Sign In" subtitle="Welcome back" />
    <div className="content-section" style={{ maxWidth: '480px' }}>
      <DarkCard>
        {/* TODO: Add login form */}
        <p style={{ color: 'var(--text-muted)', fontFamily: 'sans-serif', textAlign: 'center', padding: '24px 0' }}>
          Login form coming soon.
        </p>
      </DarkCard>
    </div>
  </>
);

export default LoginPage;
