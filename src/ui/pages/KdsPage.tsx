import React, { useState, useEffect } from 'react';
import { useServices } from '../hooks/useServices.ts';
import { useToasts } from '../components/ToastProvider.tsx';
import { Button, Card, CardHeader, CardBody, Badge } from '../components/index.js';
import type { OrderDTO } from '../types/services.d.ts';
import '../styles/kds.css';

const KdsPage: React.FC = () => {
  const { orders, auth } = useServices();
  const { push } = useToasts();
  const [kitchenOrders, setKitchenOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Permisos
  const canViewKitchen = auth.hasPermission('KITCHEN_VIEW');
  const canManageKitchen = auth.hasPermission('KITCHEN_MANAGE');

  const loadKitchenOrders = async () => {
    if (!canViewKitchen) return;
    
    try {
      const recentOrders = await orders.orderRepository.listRecent(50);
      // Filtrar solo órdenes de cocina pendientes o en progreso
      const kitchenActive = recentOrders.filter(order => 
        order.kitchenStatus === 'pending' || order.kitchenStatus === 'in_progress'
      );
      setKitchenOrders(kitchenActive);
    } catch (error) {
      console.error('Error loading kitchen orders:', error);
      push({ type: 'error', message: 'Error cargando órdenes de cocina' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKitchenOrders();
  }, [canViewKitchen]);

  // Auto refresh cada 10 segundos
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadKitchenOrders();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, canViewKitchen]);

  const startOrder = async (orderId: string) => {
    if (!canManageKitchen) return;
    
    try {
      // Aquí iría la llamada al servicio para cambiar estado
      // Por ahora simularemos el cambio local
      setKitchenOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, kitchenStatus: 'in_progress' as const }
            : order
        )
      );
      push({ type: 'success', message: 'Orden iniciada en cocina' });
      loadKitchenOrders(); // Recargar datos reales
    } catch (error) {
      push({ type: 'error', message: 'Error iniciando orden' });
    }
  };

  const completeOrder = async (orderId: string) => {
    if (!canManageKitchen) return;
    
    try {
      // Aquí iría la llamada al servicio para completar
      setKitchenOrders(prev => 
        prev.filter(order => order.id !== orderId)
      );
      push({ type: 'success', message: 'Orden completada' });
      loadKitchenOrders(); // Recargar datos reales
    } catch (error) {
      push({ type: 'error', message: 'Error completando orden' });
    }
  };

  const getOrderTime = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Ahora';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    return `${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m`;
  };

  const getStatusColor = (status: string, createdAt: string) => {
    const diffMinutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60));
    
    if (status === 'pending') {
      if (diffMinutes > 15) return 'danger';
      if (diffMinutes > 10) return 'warning';
      return 'info';
    }
    if (status === 'in_progress') {
      if (diffMinutes > 30) return 'danger';
      if (diffMinutes > 20) return 'warning';
      return 'primary';
    }
    return 'success';
  };

  const getOrderPriority = (createdAt: string, status: string) => {
    const diffMinutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60));
    
    if (status === 'pending' && diffMinutes > 15) return 'high';
    if (status === 'in_progress' && diffMinutes > 30) return 'high';
    if (status === 'pending' && diffMinutes > 10) return 'medium';
    if (status === 'in_progress' && diffMinutes > 20) return 'medium';
    return 'normal';
  };

  const getBadgeClass = (status: string, createdAt: string) => {
    const diffMinutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60));
    
    if (status === 'pending') {
      if (diffMinutes > 15) return 'badge-urgent';
      return 'badge-pending';
    }
    return 'badge-in-progress';
  };

  if (!canViewKitchen) {
    return (
      <div className="kds-page">
        <div className="kds-empty">
          <div className="empty-icon">🔒</div>
          <h2 className="empty-title">Kitchen Display System</h2>
          <p className="empty-description">No tienes permisos para ver las órdenes de cocina.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="kds-page">
        <div className="kds-empty">
          <div className="empty-icon">⏳</div>
          <h2 className="empty-title">Cargando KDS...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="kds-page">
      {/* Auto-refresh indicator */}
      <div className={`auto-refresh-indicator ${!autoRefresh ? 'paused' : ''}`}>
        {autoRefresh ? '🔄 Auto-refresh' : '⏸️ Pausado'}
      </div>

      {/* Header */}
      <div className="kds-header">
        <div>
          <h1 className="kds-title">
            <span className="emoji">🍳</span>
            Kitchen Display System
          </h1>
          <p className="kds-subtitle">
            {kitchenOrders.length} órdenes activas • Actualización cada 10s
          </p>
        </div>
        <div className="kds-controls">
          <Button
            variant="outline"
            size="small"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? '⏸️ Pausar' : '▶️ Auto'}
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={loadKitchenOrders}
          >
            🔄 Actualizar
          </Button>
        </div>
      </div>

      {/* Orders Grid */}
      {kitchenOrders.length === 0 ? (
        <div className="kds-empty">
          <div className="empty-icon">🎉</div>
          <h2 className="empty-title">¡Todas las órdenes completadas!</h2>
          <p className="empty-description">No hay órdenes pendientes en cocina.</p>
        </div>
      ) : (
        <div className="orders-grid">
          {kitchenOrders.map(order => {
            const priority = getOrderPriority(order.createdAt, order.kitchenStatus || 'pending');
            const badgeClass = getBadgeClass(order.kitchenStatus || 'pending', order.createdAt);
            
            return (
              <div key={order.id} className={`kitchen-order-card priority-${priority}`}>
                {/* Card Header */}
                <div className="card-header">
                  <div className="order-header">
                    <div className="order-info">
                      <h3 className="order-id">
                        Orden #{order.id.slice(-6)}
                      </h3>
                      <p className="order-meta">
                        {order.customerName && (
                          <span className="customer-name">{order.customerName}</span>
                        )}
                        <span className="order-time">
                          {getOrderTime(order.createdAt)}
                        </span>
                      </p>
                    </div>
                    <div className={`order-badge ${badgeClass}`}>
                      {(order.kitchenStatus || 'pending') === 'pending' ? '🕒 Pendiente' : '👨‍🍳 En Progreso'}
                    </div>
                  </div>
                </div>
                
                {/* Card Body */}
                <div className="card-body">
                  {/* Order Items */}
                  <div className="order-items">
                    {order.lines.map((item, idx) => (
                      <div key={idx} className="item-row">
                        <div className="item-info">
                          <span className="item-name">
                            {item.name}
                          </span>
                          <span className="item-category">
                            Producto
                          </span>
                        </div>
                        <div className="item-quantity">
                          {item.qty}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  {canManageKitchen && (
                    <div className="order-actions">
                      {(order.kitchenStatus || 'pending') === 'pending' && (
                        <button
                          className="btn btn-primary"
                          onClick={() => startOrder(order.id)}
                        >
                          <span className="btn-icon">👨‍🍳</span>
                          Iniciar
                        </button>
                      )}
                      {order.kitchenStatus === 'in_progress' && (
                        <button
                          className="btn btn-success"
                          onClick={() => completeOrder(order.id)}
                        >
                          <span className="btn-icon">✅</span>
                          Completar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KdsPage;
