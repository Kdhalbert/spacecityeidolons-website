import React from 'react';
import { FormProvider, type UseFormReturn } from 'react-hook-form';

interface FormProps<T extends Record<string, any>>
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  methods: UseFormReturn<T>;
  onSubmit: (data: T) => Promise<void> | void;
  children: React.ReactNode;
}

export const Form = React.forwardRef<
  HTMLFormElement,
  FormProps<any>
>(({ methods, onSubmit, children, ...props }, ref) => {
  const handleSubmit = methods.handleSubmit(onSubmit);

  return (
    <FormProvider {...methods}>
      <form ref={ref} onSubmit={handleSubmit} {...props}>
        {children}
      </form>
    </FormProvider>
  );
});

Form.displayName = 'Form';

// ============================================================================
// FORM FIELD COMPONENT
// ============================================================================

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  error?: string;
  helpText?: string;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ name, label, error, helpText, className = '', ...props }, ref) => (
    <div className="input-field-wrapper">
      {label && (
        <label htmlFor={name} className="input-dark-label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={name}
        name={name}
        className={`input-dark${error ? ' input-dark-error' : ''} ${className}`.trim()}
        {...props}
      />
      {error && <p className="input-error-text">{error}</p>}
      {helpText && !error && <p className="input-help-text">{helpText}</p>}
    </div>
  )
);

FormField.displayName = 'FormField';
