import React, { forwardRef, useState } from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  variant?: 'default' | 'floating' | 'outline' | 'filled';
  size?: 'small' | 'medium' | 'large';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      variant = 'default',
      size = 'medium',
      leftIcon,
      rightIcon,
      helperText,
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

    const generateId = () => id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const inputId = generateId();

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    // Determinar clases CSS
    const getInputClasses = () => {
      const baseClasses = 'input-modern';
      const variantClasses = {
        default: 'input-default',
        floating: 'input-floating',
        outline: 'input-outline',
        filled: 'input-filled',
      };
      const sizeClasses = {
        small: 'input-small',
        medium: 'input-medium',
        large: 'input-large',
      };

      let classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;

      if (error) classes += ' input-error';
      if (success) classes += ' input-success';
      if (disabled) classes += ' input-disabled';
      if (isFocused) classes += ' input-focused';
      if (hasValue || isFocused) classes += ' input-has-value';
      if (leftIcon) classes += ' input-with-left-icon';
      if (rightIcon) classes += ' input-with-right-icon';

      return `${classes} ${className}`.trim();
    };

    const getContainerClasses = () => {
      let classes = 'input-container';
      if (variant === 'floating') classes += ' input-container-floating';
      return classes;
    };

    if (variant === 'floating') {
      return (
        <div className={getContainerClasses()}>
          <div className="input-wrapper">
            {leftIcon && <span className="input-icon-left">{leftIcon}</span>}
            <input
              {...props}
              ref={ref}
              id={inputId}
              className={getInputClasses()}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              disabled={disabled}
              aria-invalid={!!error}
              aria-describedby={
                error ? `${inputId}-error` :
                success ? `${inputId}-success` :
                helperText ? `${inputId}-helper` : undefined
              }
            />
            {rightIcon && <span className="input-icon-right">{rightIcon}</span>}
            {label && (
              <label htmlFor={inputId} className="input-label-floating">
                {label}
                {required && <span className="input-required">*</span>}
              </label>
            )}
          </div>
          {error && (
            <span id={`${inputId}-error`} className="input-message input-error-message">
              {error}
            </span>
          )}
          {success && !error && (
            <span id={`${inputId}-success`} className="input-message input-success-message">
              {success}
            </span>
          )}
          {helperText && !error && !success && (
            <span id={`${inputId}-helper`} className="input-message input-helper-text">
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
          <label htmlFor={inputId} className="input-label">
            {label}
            {required && <span className="input-required">*</span>}
          </label>
        )}
        <div className="input-wrapper">
          {leftIcon && <span className="input-icon-left">{leftIcon}</span>}
          <input
            {...props}
            ref={ref}
            id={inputId}
            className={getInputClasses()}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` :
              success ? `${inputId}-success` :
              helperText ? `${inputId}-helper` : undefined
            }
          />
          {rightIcon && <span className="input-icon-right">{rightIcon}</span>}
        </div>
        {error && (
          <span id={`${inputId}-error`} className="input-message input-error-message">
            {error}
          </span>
        )}
        {success && !error && (
          <span id={`${inputId}-success`} className="input-message input-success-message">
            {success}
          </span>
        )}
        {helperText && !error && !success && (
          <span id={`${inputId}-helper`} className="input-message input-helper-text">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
