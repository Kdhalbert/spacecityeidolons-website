import React from 'react';

interface PageSectionProps {
  children: React.ReactNode;
  /**
   * dark=true uses the blue-tinted navy background (for "Join" style highlight sections).
   * dark=false (default) is the standard content section with dark card backgrounds.
   */
  dark?: boolean;
  id?: string;
  style?: React.CSSProperties;
}

/**
 * Page content section with centred max-width container.
 * Use dark=true for alternate-background sections (e.g. the Join section).
 *
 * @example
 * <PageSection>
 *   <SectionTitle>Our Values</SectionTitle>
 *   <DarkCard>...</DarkCard>
 * </PageSection>
 *
 * <PageSection dark id="join-section">
 *   <SectionTitle subtitle="...">Join Us</SectionTitle>
 * </PageSection>
 */
export const PageSection: React.FC<PageSectionProps> = ({
  children,
  dark = false,
  id,
  style,
}) => (
  <section id={id} className={dark ? 'join-section' : 'content-section'} style={style}>
    {dark ? (
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {children}
      </div>
    ) : (
      children
    )}
  </section>
);
