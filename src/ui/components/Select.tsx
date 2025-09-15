import React, { forwardRef, useState } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  variant?: 'default' | 'floating' | 'outline' | 'filled';
  size?: 'small' | 'medium' | 'large';
  helperText?: string;
  placeholder?: string;
  options?: SelectOption[];
  children?: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      success,
      variant = 'default',
      size = 'medium',
      helperText,
      placeholder,
      options,
      children,
      className = '',
      disabled,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

    const generateId = () => id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const selectId = generateId();

    const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    // Determinar clases CSS
    const getSelectClasses = () => {
      const baseClasses = 'select-modern';
      const variantClasses = {
        default: 'select-default',
        floating: 'select-floating',
        outline: 'select-outline',
        filled: 'select-filled',
      };
      const sizeClasses = {
        small: 'select-small',
        medium: 'select-medium',
        large: 'select-large',
      };

      let classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;

      if (error) classes += ' select-error';
      if (success) classes += ' select-success';
      if (disabled) classes += ' select-disabled';
      if (isFocused) classes += ' select-focused';
      if (hasValue || isFocused) classes += ' select-has-value';

      return `${classes} ${className}`.trim();
    };

    const getContainerClasses = () => {
      let classes = 'select-container';
      if (variant === 'floating') classes += ' select-container-floating';
      return classes;
    };

    const renderOptions = () => {
      if (children) return children;
      
      return (
        <>
          {placeholder && !props.value && !props.defaultValue && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options?.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </>
      );
    };

    if (variant === 'floating') {
      return (
        <div className={getContainerClasses()}>
          <div className="select-wrapper">
            <select
              {...props}
              ref={ref}
              id={selectId}
              className={getSelectClasses()}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              disabled={disabled}
              aria-invalid={!!error}
              aria-describedby={
                error ? `${selectId}-error` :
                success ? `${selectId}-success` :
                helperText ? `${selectId}-helper` : undefined
              }
            >
              {renderOptions()}
            </select>
            <span className="select-arrow">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path
                  d="M1 1.5L6 6.5L11 1.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {label && (
              <label htmlFor={selectId} className="select-label-floating">
                {label}
                {required && <span className="select-required">*</span>}
              </label>
            )}
          </div>
          {error && (
            <span id={`${selectId}-error`} className="select-message select-error-message">
              {error}
            </span>
          )}
          {success && !error && (
            <span id={`${selectId}-success`} className="select-message select-success-message">
              {success}
            </span>
          )}
          {helperText && !error && !success && (
            <span id={`${selectId}-helper`} className="select-message select-helper-text">
              {helperText}
            </span>
          )}
        </div>
      );
    }

    // Para variantes no-floating
    return (
      <div className={getContainerClasses()}>
        {label && (
          <label htmlFor={selectId} className="select-label">
            {label}
            {required && <span className="select-required">*</span>}
          </label>
        )}
        <div className="select-wrapper">
          <select
            {...props}
            ref={ref}
            id={selectId}
            className={getSelectClasses()}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${selectId}-error` :
              success ? `${selectId}-success` :
              helperText ? `${selectId}-helper` : undefined
            }
          >
            {renderOptions()}
          </select>
          <span className="select-arrow">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path
                d="M1 1.5L6 6.5L11 1.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
        {error && (
          <span id={`${selectId}-error`} className="select-message select-error-message">
            {error}
          </span>
        )}
        {success && !error && (
          <span id={`${selectId}-success`} className="select-message select-success-message">
            {success}
          </span>
        )}
        {helperText && !error && !success && (
          <span id={`${selectId}-helper`} className="select-message select-helper-text">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
