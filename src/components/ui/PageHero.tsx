import React from 'react';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  showLogo?: boolean;
  children?: React.ReactNode;
}

/**
 * Full-width hero section at the top of a page.
 * Uses the gold h1 heading, tagline, and optional floating logo from the design system.
 *
 * @example
 * <PageHero
 *   title="Games"
 *   subtitle="Explore our game library"
 *   description="Browse games the community plays and request new ones."
 * />
 */
export const PageHero: React.FC<PageHeroProps> = ({
  title,
  subtitle,
  description,
  showLogo = false,
  children,
}) => (
  <section className="hero-section">
    {showLogo && (
      <img
        src="/logo.svg"
        alt="Space City Eidolons"
        className="logo"
        style={{ width: '160px', height: '160px', marginBottom: '24px' }}
      />
    )}
    <h1>{title}</h1>
    {subtitle && <p className="tagline">{subtitle}</p>}
    {description && <p className="hero-desc">{description}</p>}
    {children}
  </section>
);
