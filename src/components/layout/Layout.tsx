import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../types';

export const Header: React.FC = () => {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  const scrollToInvite = () => {
    const inviteSection = document.querySelector('#join-section');
    if (inviteSection) {
      inviteSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const getDiscordAvatarUrl = () => {
    if (user?.discordId && user?.discordAvatar) {
      return `https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png`;
    }
    return null;
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="site-title">
          Space City Eidolons
        </Link>
        <nav className="header-nav">
          <Link to="/">Home</Link>
          <Link to="/games">Games</Link>
          <Link to="/events">Events</Link>
          <Link to="/profiles">Profiles</Link>
          {isAuthenticated && user && <Link to={`/profile/${user.id}`}>My Profile</Link>}
          {isAuthenticated && user?.role === Role.GUEST && (
            <Link
              to="/membership/request"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--gold)',
                border: '1px solid var(--gold)',
                borderRadius: '999px',
                padding: '4px 10px',
                fontSize: '0.85rem',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  background: 'var(--gold)',
                  color: '#1b1330',
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                !
              </span>
              Request Member Access
            </Link>
          )}
          {isAuthenticated && user?.role === Role.ADMIN && (
            <Link to="/admin/users" style={{ color: 'var(--purple-lighter)' }}>Admin</Link>
          )}

          {!isLoading && (
            <>
              {isAuthenticated ? (
                <div className="header-auth">
                  <div className="header-user">
                    {getDiscordAvatarUrl() && (
                      <img
                        src={getDiscordAvatarUrl()!}
                        alt={user?.discordUsername}
                        className="header-avatar"
                      />
                    )}
                    <span className="header-username">
                      {user?.discordUsername}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="invite-btn"
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid var(--purple-lighter)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <button onClick={scrollToInvite} className="invite-btn">
                    Request Invite
                  </button>
                  <Link to="/login" className="invite-btn" style={{ textDecoration: 'none' }}>
                    Login
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <h3>About</h3>
            <p className="footer-copy">
              Space City Eidolons is a gaming community dedicated to bringing
              people together for shared experiences.
            </p>
          </div>
          <div>
            <h3>Community</h3>
            <ul className="footer-links">
              <li><a href="#">Discord</a></li>
              <li><a href="#">Forums</a></li>
              <li><a href="#">Events</a></li>
              <li><Link to="/roadmap">Roadmap</Link></li>
            </ul>
          </div>
          <div>
            <h3>Legal</h3>
            <ul className="footer-links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {currentYear} Space City Eidolons. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
