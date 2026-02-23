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
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
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
          className={`
            w-full px-3 py-2 border rounded-lg
            bg-white text-gray-900 placeholder-gray-400
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${error ? 'border-red-500' : 'border-gray-300'}
            disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50
            ${className}
          `}
        />
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helpText && !error && (
          <p id={helpTextId} className="mt-1 text-sm text-gray-500">{helpText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
