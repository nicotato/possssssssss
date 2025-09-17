import React from 'react';
import type { CartSummary } from '../../application/services/cart-service.js';

interface TaxBreakdownProps {
  summary: CartSummary;
  showDetails?: boolean;
}

export function TaxBreakdown({ summary, showDetails = false }: TaxBreakdownProps) {
  const { lineTaxes, globalTaxes, totalTax, subtotal, total } = summary;
  
  if (totalTax === 0) {
    return null; // No mostrar si no hay impuestos
  }

  // Consolidar impuestos por código
  const taxMap = new Map();
  [...lineTaxes, ...globalTaxes].forEach(tax => {
    const existing = taxMap.get(tax.code);
    if (existing) {
      existing.amount += tax.amount;
      existing.base += tax.base;
    } else {
      taxMap.set(tax.code, { ...tax });
    }
  });

  const consolidatedTaxes = Array.from(taxMap.values());

  if (!showDetails) {
    // Vista simple: solo el total de impuestos
    return (
      <div className="tax-breakdown-simple">
        <div className="tax-summary-line">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="tax-summary-line">
          <span>Impuestos:</span>
          <span>${totalTax.toFixed(2)}</span>
        </div>
        <div className="tax-summary-line tax-total">
          <strong>
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </strong>
        </div>
      </div>
    );
  }

  // Vista detallada: desglose completo
  return (
    <div className="tax-breakdown-detailed">
      <div className="tax-section">
        <h4>Desglose de Impuestos</h4>
        
        <div className="tax-summary-line">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {consolidatedTaxes.map((tax, index) => (
          <div key={tax.code || index} className="tax-detail-line">
            <span className="tax-name">
              {tax.name} ({(tax.rate * 100).toFixed(1)}%)
              <small className="tax-scope">
                {tax.scope === 'line' ? ' - Por línea' : ' - Global'}
              </small>
            </span>
            <span className="tax-amount">${tax.amount.toFixed(2)}</span>
          </div>
        ))}

        <div className="tax-summary-line tax-subtotal">
          <span>Total impuestos:</span>
          <span>${totalTax.toFixed(2)}</span>
        </div>

        <div className="tax-summary-line tax-total">
          <strong>
            <span>Total a pagar:</span>
            <span>${total.toFixed(2)}</span>
          </strong>
        </div>
      </div>
    </div>
  );
}