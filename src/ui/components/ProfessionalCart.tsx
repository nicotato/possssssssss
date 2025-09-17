import React from 'react';
import type { CartSummary } from '../../application/services/cart-service.js';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  category?: string;
  lineTaxes: Array<{
    code: string;
    name: string;
    base: number;
    rate: number;
    amount: number;
    scope: 'line' | 'global';
  }>;
}

interface ProfessionalCartProps {
  items: CartItem[];
  summary: CartSummary;
  onChangeQty: (id: string, delta: number) => Promise<void>;
  onRemoveItem: (id: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

export function ProfessionalCart({ 
  items, 
  summary, 
  onChangeQty, 
  onRemoveItem, 
  onClear,
  disabled = false 
}: ProfessionalCartProps) {
  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-icon">🛒</div>
        <p>El carrito está vacío</p>
        <span className="cart-empty-hint">Selecciona productos del menú para agregar</span>
      </div>
    );
  }

  // Consolidar impuestos por código para el resumen
  const taxMap = new Map();
  [...summary.lineTaxes, ...summary.globalTaxes].forEach(tax => {
    const existing = taxMap.get(tax.code);
    if (existing) {
      existing.amount += tax.amount;
    } else {
      taxMap.set(tax.code, { ...tax });
    }
  });
  const consolidatedTaxes = Array.from(taxMap.values());

  return (
    <div className="professional-cart">
      {/* Header del Carrito */}
      <div className="cart-header">
        <div className="cart-title">
          <h3>🛒 Pedido</h3>
          <span className="cart-items-count">({items.length} productos)</span>
        </div>
        <button 
          className="cart-clear-btn"
          onClick={onClear}
          disabled={disabled}
          title="Vaciar carrito"
        >
          🗑️
        </button>
      </div>

      {/* Lista de Productos */}
      <div className="cart-items">
        {items.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-main">
              <div className="cart-item-info">
                <h4 className="cart-item-name">{item.name}</h4>
                {item.category && (
                  <span className="cart-item-category">{item.category}</span>
                )}
              </div>
              
              <div className="cart-item-controls">
                <div className="cart-item-qty">
                  <button
                    className="qty-btn qty-decrease"
                    onClick={async () => {
                      try {
                        await onChangeQty(item.id, -1);
                      } catch (error) {
                        console.error('Error decreasing quantity:', error);
                      }
                    }}
                    disabled={disabled || item.qty <= 1}
                  >
                    −
                  </button>
                  <span className="qty-display">{item.qty}</span>
                  <button
                    className="qty-btn qty-increase"
                    onClick={async () => {
                      try {
                        await onChangeQty(item.id, 1);
                      } catch (error) {
                        console.error('Error increasing quantity:', error);
                      }
                    }}
                    disabled={disabled}
                  >
                    +
                  </button>
                </div>
                
                <div className="cart-item-price">
                  <div className="unit-price">${item.unitPrice.toFixed(2)} c/u</div>
                  <div className="line-total">${item.lineTotal.toFixed(2)}</div>
                </div>
                
                <button
                  className="cart-item-remove"
                  onClick={() => onRemoveItem(item.id)}
                  disabled={disabled}
                  title="Eliminar producto"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Mostrar impuestos por línea si aplican */}
            {item.lineTaxes && item.lineTaxes.length > 0 && (
              <div className="cart-item-taxes">
                {item.lineTaxes
                  .filter(tax => tax.scope === 'line' && tax.amount > 0)
                  .map((tax, idx) => (
                    <div key={idx} className="cart-item-tax">
                      <span>{tax.name} ({(tax.rate * 100).toFixed(1)}%)</span>
                      <span>+${tax.amount.toFixed(2)}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resumen de Totales */}
      <div className="cart-summary">
        <div className="cart-summary-section">
          <div className="cart-summary-line">
            <span>Subtotal</span>
            <span className="amount">${summary.subtotal.toFixed(2)}</span>
          </div>

          {/* Impuestos detallados */}
          {consolidatedTaxes.length > 0 && (
            <div className="cart-tax-section">
              <div className="cart-tax-header">Impuestos aplicados</div>
              {consolidatedTaxes.map((tax) => (
                <div key={tax.code} className="cart-summary-line cart-tax-line">
                  <span className="tax-detail">
                    {tax.name} ({(tax.rate * 100).toFixed(1)}%)
                    <small className={`tax-scope tax-scope--${tax.scope}`}>
                      {tax.scope === 'line' ? 'por línea' : 'global'}
                    </small>
                  </span>
                  <span className="amount">+${tax.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Total Final */}
          <div className="cart-summary-line cart-total-line">
            <span className="total-label">Total a Pagar</span>
            <span className="total-amount">${summary.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}