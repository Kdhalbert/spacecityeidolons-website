import React from 'react';

interface SectionTitleProps {
  children: React.ReactNode;
  /** Optional muted subtitle line rendered below the heading */
  subtitle?: string;
}

/**
 * Gold centred section heading with optional muted subtitle.
 * Always use this for h2-level section headings on dark-background pages.
 *
 * @example
 * <SectionTitle subtitle="Connect with us on Discord or Matrix">
 *   Join Our Community
 * </SectionTitle>
 */
export const SectionTitle: React.FC<SectionTitleProps> = ({ children, subtitle }) => (
  <>
    <h2 className="section-title">{children}</h2>
    {subtitle && <p className="section-subtitle">{subtitle}</p>}
  </>
);
