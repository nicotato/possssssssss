import React, { forwardRef, useState } from 'react';

export interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  variant?: 'default' | 'floating' | 'outline' | 'filled';
  size?: 'small' | 'medium' | 'large';
  helperText?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      success,
      variant = 'default',
      size = 'medium',
      helperText,
      resize = 'vertical',
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

    const generateId = () => id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const textareaId = generateId();

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    // Determinar clases CSS
    const getTextAreaClasses = () => {
      const baseClasses = 'textarea-modern';
      const variantClasses = {
        default: 'textarea-default',
        floating: 'textarea-floating',
        outline: 'textarea-outline',
        filled: 'textarea-filled',
      };
      const sizeClasses = {
        small: 'textarea-small',
        medium: 'textarea-medium',
        large: 'textarea-large',
      };

      let classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;

      if (error) classes += ' textarea-error';
      if (success) classes += ' textarea-success';
      if (disabled) classes += ' textarea-disabled';
      if (isFocused) classes += ' textarea-focused';
      if (hasValue || isFocused) classes += ' textarea-has-value';

      return `${classes} ${className}`.trim();
    };

    const getContainerClasses = () => {
      let classes = 'textarea-container';
      if (variant === 'floating') classes += ' textarea-container-floating';
      return classes;
    };

    const textAreaStyle = {
      resize: resize,
      ...props.style
    };

    if (variant === 'floating') {
      return (
        <div className={getContainerClasses()}>
          <div className="textarea-wrapper">
            <textarea
              {...props}
              ref={ref}
              id={textareaId}
              className={getTextAreaClasses()}
              style={textAreaStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              disabled={disabled}
              aria-invalid={!!error}
              aria-describedby={
                error ? `${textareaId}-error` :
                success ? `${textareaId}-success` :
                helperText ? `${textareaId}-helper` : undefined
              }
            />
            {label && (
              <label htmlFor={textareaId} className="textarea-label-floating">
                {label}
                {required && <span className="textarea-required">*</span>}
              </label>
            )}
          </div>
          {error && (
            <span id={`${textareaId}-error`} className="textarea-message textarea-error-message">
              {error}
            </span>
          )}
          {success && !error && (
            <span id={`${textareaId}-success`} className="textarea-message textarea-success-message">
              {success}
            </span>
          )}
          {helperText && !error && !success && (
            <span id={`${textareaId}-helper`} className="textarea-message textarea-helper-text">
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
          <label htmlFor={textareaId} className="textarea-label">
            {label}
            {required && <span className="textarea-required">*</span>}
          </label>
        )}
        <div className="textarea-wrapper">
          <textarea
            {...props}
            ref={ref}
            id={textareaId}
            className={getTextAreaClasses()}
            style={textAreaStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${textareaId}-error` :
              success ? `${textareaId}-success` :
              helperText ? `${textareaId}-helper` : undefined
            }
          />
        </div>
        {error && (
          <span id={`${textareaId}-error`} className="textarea-message textarea-error-message">
            {error}
          </span>
        )}
        {success && !error && (
          <span id={`${textareaId}-success`} className="textarea-message textarea-success-message">
            {success}
          </span>
        )}
        {helperText && !error && !success && (
          <span id={`${textareaId}-helper`} className="textarea-message textarea-helper-text">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
