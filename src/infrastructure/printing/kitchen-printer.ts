import type { OrderDTO } from '../../ui/types/services.d.ts';

export class KitchenPrinter {
  openTicket(order: OrderDTO) {
    const html = this.buildHTML(order);
    const w = window.open('', '_blank', 'width=420,height=600');
    if(!w){ alert('Permitir popups para imprimir.'); return; }
    w.document.write(html); w.document.close(); w.focus();
    setTimeout(()=> w.print(), 200);
  }
  private buildHTML(order: OrderDTO) {
    const lines = order.lines.map((l: any) => `
      <tr>
        <td>${l.qty}</td>
        <td>${l.name}</td>
        <td>${l.category||''}</td>
      </tr>
    `).join('');
    return `
<!DOCTYPE html>
<html><head><meta charset='utf-8'/>
<title>Comanda ${order.id}</title>
<style>
body { font-family: monospace; padding:8px; }
h2 { margin:0 0 4px; text-align:center; }
table { width:100%; border-collapse:collapse; }
td,th { border-bottom:1px solid #000; padding:4px; font-size:12px; }
th { background:#000; color:#fff; }
</style>
</head>
<body>
<h2>COMANDA COCINA</h2>
<div>ID: ${order.id}<br>Fecha: ${new Date(order.createdAt).toLocaleString()}</div>
<table>
<thead><tr><th>Cant</th><th>Producto</th><th>Cat</th></tr></thead>
<tbody>${lines}</tbody>
</table>
</body></html>`;
  }
}
