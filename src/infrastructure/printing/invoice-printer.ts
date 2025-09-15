import { buildMoneyFormatter } from '../../utils/i18n-format.ts';
import type { OrderDTO } from '../../react/types/services.d.ts';

export class InvoicePrinter {
  private money = buildMoneyFormatter();
  openInvoice(order: OrderDTO & { customerPhone?:string; customerName?:string }, onPrinted?: ()=>void) {
    const html = this.buildInvoiceHTML(order);
    const w = window.open('', '_blank', 'width=480,height=640');
    if (!w) { alert('Permite popups para imprimir.'); return; }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(()=> { w.print(); onPrinted?.(); }, 300);
  }
  private buildInvoiceHTML(order: OrderDTO & { customerPhone?:string; customerName?:string }) {
    const linesHtml = order.lines.map(l=>`<tr><td>${l.qty}</td><td>${l.name}</td><td style='text-align:right;'>${this.money(l.unitPrice)}</td><td style='text-align:right;'>${this.money(l.lineTotal)}</td></tr>`).join('');
    return `<!DOCTYPE html><html><head><meta charset='utf-8'/><title>Factura ${order.id}</title><style>body{font-family:Arial,sans-serif;padding:10px;}h2{margin:0;}table{width:100%;border-collapse:collapse;margin-top:8px;}th,td{padding:4px;border-bottom:1px solid #ddd;font-size:12px;}th{background:#f77f00;color:#fff;text-align:left;}.tot{font-weight:bold;}</style></head><body><h2>Pizzería del Barrio</h2><div><strong>Factura:</strong> ${order.id}<br/><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleString()}<br/>${order.customerPhone?`<strong>Cliente:</strong> ${order.customerName||''} (${order.customerPhone})<br/>`:''}</div><table><thead><tr><th>Cant</th><th>Producto</th><th>Precio</th><th>Total</th></tr></thead><tbody>${linesHtml}</tbody><tfoot><tr><td colspan='3' class='tot' style='text-align:right;'>TOTAL</td><td class='tot' style='text-align:right;'>${this.money(order.total)}</td></tr></tfoot></table><p style='font-size:11px;'>Gracias por su compra.</p></body></html>`;
  }
}
