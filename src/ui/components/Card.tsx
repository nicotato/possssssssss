import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'medium',
  onClick,
  hoverable = false
}) => {
  const baseClasses = 'card-modern';
  const variantClasses = {
    default: 'card-modern-default',
    elevated: 'card-modern-elevated',
    outlined: 'card-modern-outlined',
    filled: 'card-modern-filled'
  };
  
  const paddingClasses = {
    none: 'card-modern-padding-none',
    small: 'card-modern-padding-sm',
    medium: 'card-modern-padding-md',
    large: 'card-modern-padding-lg'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    hoverable && 'card-modern-hoverable',
    onClick && 'card-modern-clickable',
    className
  ].filter(Boolean).join(' ');

  const CardElement = onClick ? 'button' : 'div';

  return (
    <CardElement 
      className={classes} 
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {children}
    </CardElement>
  );
};

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  actions
}) => {
  return (
    <div className={`card-modern-header ${className}`}>
      <div className="card-modern-header-content">
        {children}
      </div>
      {actions && (
        <div className="card-modern-header-actions">
          {actions}
        </div>
      )}
    </div>
  );
};

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`card-modern-body ${className}`}>
      {children}
    </div>
  );
};

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
  align = 'right'
}) => {
  const alignClasses = {
    left: 'card-modern-footer-left',
    center: 'card-modern-footer-center',
    right: 'card-modern-footer-right',
    between: 'card-modern-footer-between'
  };

  return (
    <div className={`card-modern-footer ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  );
};