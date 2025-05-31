import { forwardRef } from 'react';

const FormInput = forwardRef(
  (
    {
      label,
      name,
      type = 'text',
      placeholder,
      error,
      className = '',
      required = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className={className}>
        {label && (
          <label htmlFor={name} className="form-label">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          name={name}
          id={name}
          placeholder={placeholder}
          className={`form-input ${
            error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
          }`}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;
