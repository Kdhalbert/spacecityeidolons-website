import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => (
  <section className="hero-section">
    <h1 style={{ fontSize: '5rem', letterSpacing: '4px' }}>404</h1>
    <p className="tagline">Page Not Found</p>
    <p className="hero-desc">
      The page you're looking for doesn't exist or may have moved.
    </p>
    <Link to="/" className="chat-link">
      Go Home
    </Link>
  </section>
);

export default NotFoundPage;
