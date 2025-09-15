import React from 'react';

export interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  title?: string;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  size = 'medium',
  className = '',
  dismissible = false,
  onDismiss,
  icon,
  title
}) => {
  const baseClasses = 'alert-modern';
  const variantClasses = {
    info: 'alert-modern-info',
    success: 'alert-modern-success',
    warning: 'alert-modern-warning',
    danger: 'alert-modern-danger'
  };
  
  const sizeClasses = {
    small: 'alert-modern-sm',
    medium: 'alert-modern-md',
    large: 'alert-modern-lg'
  };

  const defaultIcons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    danger: '❌'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  const displayIcon = icon || defaultIcons[variant];

  return (
    <div className={classes} role="alert">
      <div className="alert-modern-content">
        {displayIcon && (
          <div className="alert-modern-icon">
            {displayIcon}
          </div>
        )}
        <div className="alert-modern-body">
          {title && (
            <div className="alert-modern-title">
              {title}
            </div>
          )}
          <div className="alert-modern-text">
            {children}
          </div>
        </div>
      </div>
      {dismissible && (
        <button
          className="alert-modern-dismiss"
          onClick={onDismiss}
          type="button"
          aria-label="Cerrar alerta"
        >
          ×
        </button>
      )}
    </div>
  );
};

// Specific alert variants for common use cases
export const InfoAlert: React.FC<Omit<AlertProps, 'variant'>> = (props) => (
  <Alert {...props} variant="info" />
);

export const SuccessAlert: React.FC<Omit<AlertProps, 'variant'>> = (props) => (
  <Alert {...props} variant="success" />
);

export const WarningAlert: React.FC<Omit<AlertProps, 'variant'>> = (props) => (
  <Alert {...props} variant="warning" />
);

export const DangerAlert: React.FC<Omit<AlertProps, 'variant'>> = (props) => (
  <Alert {...props} variant="danger" />
);