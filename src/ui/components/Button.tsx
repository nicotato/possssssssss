import React, { forwardRef } from 'react';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'medium',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'btn-modern';
    const variantClasses = {
      primary: 'btn-modern-primary',
      secondary: 'btn-modern-secondary', 
      outline: 'btn-modern-outline',
      ghost: 'btn-modern-ghost',
      danger: 'btn-modern-danger',
      success: 'btn-modern-success',
      warning: 'btn-modern-warning'
    };
    
    const sizeClasses = {
      small: 'btn-modern-sm',
      medium: 'btn-modern-md',
      large: 'btn-modern-lg'
    };

    const classes = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && 'btn-modern-full-width',
      loading && 'btn-modern-loading',
      className
    ].filter(Boolean).join(' ');

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <span className="btn-modern-spinner" aria-hidden="true">
            ⏳
          </span>
        )}
        {!loading && leftIcon && (
          <span className="btn-modern-left-icon" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <span className={loading ? 'btn-modern-text-loading' : ''}>
          {children}
        </span>
        {!loading && rightIcon && (
          <span className="btn-modern-right-icon" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
