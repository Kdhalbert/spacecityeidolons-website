import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

let inputIdCounter = 0;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, className = '', ...props }, ref) => {
    const inputId = React.useMemo(() => props.id || `input-${++inputIdCounter}`, [props.id]);
    const errorId = error ? `${inputId}-error` : undefined;
    const helpTextId = helpText ? `${inputId}-help` : undefined;
    const describedBy = [errorId, !error && helpTextId].filter(Boolean).join(' ') || undefined;

    return (
      <div className="input-field-wrapper">
        {label && (
          <label htmlFor={inputId} className="input-dark-label">
            {label}
          </label>
        )}
        <input
          {...props}
          id={inputId}
          ref={ref}
          aria-describedby={describedBy}
          aria-invalid={error ? 'true' : undefined}
          aria-required={props.required ? 'true' : undefined}
          className={`input-dark${error ? ' input-dark-error' : ''} ${className}`.trim()}
        />
        {error && (
          <p id={errorId} className="input-error-text">{error}</p>
        )}
        {helpText && !error && (
          <p id={helpTextId} className="input-help-text">{helpText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
