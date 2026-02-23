import React from 'react';
import { InviteRequestForm } from '../components/InviteRequestForm';
import { Platform } from '../types';

const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <img
          src="/logo.svg"
          alt="Space City Eidolons"
          className="logo"
          style={{ width: '160px', height: '160px', marginBottom: '24px' }}
        />
        <h1>Space City Eidolons</h1>
        <p className="tagline">Houston's Premier Gaming Community</p>
        <p className="hero-desc">
          Welcome to Space City Eidolons — a vibrant gaming community based in Houston, Texas.
          We bring together gamers of all types to share experiences, organize events, and build lasting friendships.
        </p>
      </section>

      {/* About Section */}
      <section className="content-section">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '48px' }}>
          <div className="dark-card">
            <h2>Who We Are</h2>
            <p>
              Space City Eidolons is a diverse community of gamers who share a passion for gaming
              across all platforms and genres. Whether you're into competitive esports, casual co-op,
              tabletop RPGs, or anything in between, you'll find like-minded players here.
            </p>
            <p style={{ marginTop: '12px' }}>
              We host regular gaming sessions, tournaments, and social events both online and in-person
              around the Houston area. Our community values inclusivity, respect, and having fun together.
            </p>
          </div>
          <div className="dark-card">
            <h2>Our Values</h2>
            <ul>
              <li>
                <span className="gold-bullet">✦</span>
                <span><strong style={{ color: 'var(--gold)' }}>Inclusive:</strong> Gamers of all skill levels, backgrounds, and interests are welcome</span>
              </li>
              <li>
                <span className="gold-bullet">✦</span>
                <span><strong style={{ color: 'var(--gold)' }}>Respectful:</strong> We maintain a positive, harassment-free environment</span>
              </li>
              <li>
                <span className="gold-bullet">✦</span>
                <span><strong style={{ color: 'var(--gold)' }}>Fun-First:</strong> Gaming is about enjoyment and shared experiences</span>
              </li>
              <li>
                <span className="gold-bullet">✦</span>
                <span><strong style={{ color: 'var(--gold)' }}>Community-Driven:</strong> Members help shape events and activities</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section id="join-section" className="join-section">
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 className="section-title">Join Our Community</h2>
          <p className="section-subtitle">
            Connect with us on Discord for real-time chat and gaming coordination,
            or join our Matrix server for a privacy-focused alternative with end-to-end encryption.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', maxWidth: '900px', margin: '0 auto' }}>
            <div className="invite-card-wrapper">
              <InviteRequestForm platform={Platform.DISCORD} />
            </div>
            <div className="invite-card-wrapper">
              <InviteRequestForm platform={Platform.MATRIX} />
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect Section */}
      <section className="content-section">
        <h2 className="section-title">What to Expect</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <div className="dark-card">
            <h3>Gaming Sessions</h3>
            <p>
              Regular organized play sessions across various games, from competitive tournaments
              to casual co-op nights.
            </p>
          </div>
          <div className="dark-card">
            <h3>Community Events</h3>
            <p>
              LAN parties, movie nights, and social gatherings where we connect beyond the screen.
            </p>
          </div>
          <div className="dark-card">
            <h3>Game Discovery</h3>
            <p>
              Find new games to play and groups to join. Members can request dedicated channels
              for their favorite games.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;


