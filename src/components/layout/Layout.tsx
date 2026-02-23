import React from 'react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const scrollToInvite = () => {
    const inviteSection = document.querySelector('#join-section');
    if (inviteSection) {
      inviteSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="site-header">
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        <Link to="/" className="site-title" style={{ fontSize: '1.3rem' }}>
          Space City Eidolons
        </Link>
        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link to="/">Home</Link>
          <Link to="/games">Games</Link>
          <Link to="/events">Events</Link>
          <Link to="/profile">Profile</Link>
          <button onClick={scrollToInvite} className="invite-btn">
            Request Invite
          </button>
        </nav>
      </div>
    </header>
  );
};

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', marginBottom: '32px' }}>
          <div>
            <h3>About</h3>
            <p style={{ fontFamily: 'sans-serif', lineHeight: '1.6' }}>
              Space City Eidolons is a gaming community dedicated to bringing
              people together for shared experiences.
            </p>
          </div>
          <div>
            <h3>Community</h3>
            <ul style={{ listStyle: 'none', padding: 0, fontFamily: 'sans-serif' }}>
              <li style={{ marginBottom: '8px' }}><a href="#">Discord</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#">Forums</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#">Events</a></li>
            </ul>
          </div>
          <div>
            <h3>Legal</h3>
            <ul style={{ listStyle: 'none', padding: 0, fontFamily: 'sans-serif' }}>
              <li style={{ marginBottom: '8px' }}><a href="#">Privacy Policy</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#">Terms of Service</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#">Contact</a></li>
            </ul>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--purple-lighter)', paddingTop: '24px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <p>&copy; {currentYear} Space City Eidolons. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
