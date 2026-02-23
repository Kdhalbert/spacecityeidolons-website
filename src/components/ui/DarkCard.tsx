import React from 'react';

interface DarkCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Deep purple card with gold border — the primary content container on dark pages.
 * Use this instead of any white/gray card from a generic UI library.
 *
 * h2/h3 headings inside DarkCard are automatically styled gold.
 * Paragraphs and list items use the light text color.
 *
 * @example
 * <DarkCard>
 *   <h2>Who We Are</h2>
 *   <p>Some description text...</p>
 * </DarkCard>
 */
export const DarkCard: React.FC<DarkCardProps> = ({ children, style, className = '' }) => (
  <div className={`dark-card ${className}`.trim()} style={style}>
    {children}
  </div>
);
