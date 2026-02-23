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
    <div className="mb-4 w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={name}
        name={name}
        className={`
          w-full px-3 py-2 border rounded-lg
          bg-white text-gray-900 placeholder-gray-400
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${error ? 'border-red-500' : 'border-gray-300'}
          disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helpText && !error && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
    </div>
  )
);

FormField.displayName = 'FormField';
