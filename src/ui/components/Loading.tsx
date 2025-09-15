import React from 'react';

export interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  className?: string;
  text?: string;
  centered?: boolean;
  overlay?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  variant = 'spinner',
  className = '',
  text = '',
  centered = false,
  overlay = false
}) => {
  const baseClasses = 'loading-modern';
  const sizeClasses = {
    small: 'loading-modern-sm',
    medium: 'loading-modern-md',
    large: 'loading-modern-lg'
  };

  const variantClasses = {
    spinner: 'loading-modern-spinner',
    dots: 'loading-modern-dots',
    pulse: 'loading-modern-pulse',
    skeleton: 'loading-modern-skeleton'
  };

  const classes = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    centered && 'loading-modern-centered',
    overlay && 'loading-modern-overlay',
    className
  ].filter(Boolean).join(' ');

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="loading-modern-dots-container">
            <div className="loading-modern-dot"></div>
            <div className="loading-modern-dot"></div>
            <div className="loading-modern-dot"></div>
          </div>
        );
      case 'pulse':
        return <div className="loading-modern-pulse-circle"></div>;
      case 'skeleton':
        return (
          <div className="loading-modern-skeleton-container">
            <div className="loading-modern-skeleton-line"></div>
            <div className="loading-modern-skeleton-line short"></div>
            <div className="loading-modern-skeleton-line"></div>
          </div>
        );
      default: // spinner
        return <div className="loading-modern-spinner-circle">⏳</div>;
    }
  };

  return (
    <div className={classes}>
      <div className="loading-modern-content">
        {renderLoader()}
        {text && (
          <div className="loading-modern-text">
            {text}
          </div>
        )}
      </div>
    </div>
  );
};

export const LoadingOverlay: React.FC<Omit<LoadingProps, 'overlay'>> = (props) => (
  <Loading {...props} overlay={true} />
);

export const LoadingSkeleton: React.FC<{ 
  lines?: number; 
  width?: string;
  height?: string;
  className?: string; 
}> = ({ 
  lines = 3, 
  width = '100%',
  height = '1rem',
  className = '' 
}) => (
  <div className={`loading-modern-skeleton-wrapper ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="loading-modern-skeleton-line"
        style={{
          width: i === lines - 1 ? '70%' : width,
          height
        }}
      />
    ))}
  </div>
);