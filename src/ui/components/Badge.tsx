import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  className = '',
  onClick,
  removable = false,
  onRemove
}) => {
  const baseClasses = 'badge-modern';
  const variantClasses = {
    default: 'badge-modern-default',
    primary: 'badge-modern-primary',
    secondary: 'badge-modern-secondary',
    success: 'badge-modern-success',
    warning: 'badge-modern-warning',
    danger: 'badge-modern-danger',
    info: 'badge-modern-info'
  };
  
  const sizeClasses = {
    small: 'badge-modern-sm',
    medium: 'badge-modern-md',
    large: 'badge-modern-lg'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    onClick && 'badge-modern-clickable',
    className
  ].filter(Boolean).join(' ');

  const BadgeElement = onClick ? 'button' : 'span';

  return (
    <BadgeElement 
      className={classes} 
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {children}
      {removable && (
        <button
          className="badge-modern-remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          type="button"
          aria-label="Remover"
        >
          ×
        </button>
      )}
    </BadgeElement>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusVariants: Record<string, BadgeProps['variant']> = {
    completed: 'success',
    fulfilled: 'info',
    cancelled: 'danger',
    pending: 'warning',
    active: 'primary',
    inactive: 'secondary',
    draft: 'default'
  };

  const statusLabels: Record<string, string> = {
    completed: 'Completado',
    fulfilled: 'Entregado',
    cancelled: 'Cancelado',
    pending: 'Pendiente',
    active: 'Activo',
    inactive: 'Inactivo',
    draft: 'Borrador'
  };

  return (
    <Badge variant={statusVariants[status] || 'default'}>
      {statusLabels[status] || status}
    </Badge>
  );
};