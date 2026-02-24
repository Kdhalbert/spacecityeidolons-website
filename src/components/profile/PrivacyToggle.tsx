import React from 'react';

interface PrivacyToggleProps {
  fieldName: string;
  isPrivate: boolean;
  onChange: (isPrivate: boolean) => void;
  description?: string;
}

/**
 * PrivacyToggle component - allows users to control field-level privacy
 */
export const PrivacyToggle: React.FC<PrivacyToggleProps> = ({
  fieldName,
  isPrivate,
  onChange,
  description,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        backgroundColor: 'rgba(88, 101, 242, 0.05)',
        borderRadius: '8px',
        marginTop: '8px',
      }}
    >
      <div style={{ flex: 1 }}>
        <label
          htmlFor={`privacy-${fieldName}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontFamily: 'sans-serif',
          }}
        >
          <input
            type="checkbox"
            id={`privacy-${fieldName}`}
            checked={isPrivate}
            onChange={(e) => onChange(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ fontSize: '1rem' }}>{isPrivate ? '🔒' : '🌍'}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isPrivate ? 'Private' : 'Public'}
          </span>
        </label>
        {description && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0', fontFamily: 'sans-serif' }}>
          {description}
        </p>}
      </div>
    </div>
  );
};

export default PrivacyToggle;
