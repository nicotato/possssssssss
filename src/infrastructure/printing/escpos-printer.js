// ESC/POS Printer integration (WebUSB + fallback HTTP endpoint)
// Nota: WebUSB requiere HTTPS y Chrome/Edge.
// Para impresoras Epson/TM/Thermal compatibles.
const ESC = '\x1B';
const GS = '\x1D';

/** @typedef {{ id:string; createdAt:string; lines:any[]; customerPhone?:string; customerName?:string; subTotal?:number; discountTotal?:number; grandTotal?:number; payments?:any[]; amountPaid?:number; changeDue?:number; paymentStatus?:string; discounts?:any[] }} EscPosOrder */
export class EscPosPrinter {
  /** @param {{ gatewayUrl?:string|null; useWebUSB?:boolean }} [options] */
  constructor(options = {}) {
    this.device = null;
    this.endpointOut = null;
    this.gatewayUrl = options.gatewayUrl || null; // Ej: http://localhost:9100/print
    this.useWebUSB = options.useWebUSB !== false;
  }

  async connectWebUSB() {
    if (!('usb' in navigator)) {
      throw new Error('WebUSB no soportado en este navegador.');
    }
    this.device = await navigator.usb.requestDevice({
      filters: [
        { vendorId: 0x04b8 }, // Epson
        { vendorId: 0x0456 }, // XPrinter u otros (puedes agregar)
        { vendorId: 0x067b }  // Prolific adaptadores
      ]
    });
    await this.device.open();
    if (this.device.configuration === null) {
      await this.device.selectConfiguration(1);
    }
    // Buscar interfaz con endpoints
    const iface = this.device.configuration.interfaces.find(i =>
      i.alternates.some(a => a.interfaceClass === 7) // Printer class
    ) || this.device.configuration.interfaces[0];

    await this.device.claimInterface(iface.interfaceNumber);
    const alt = iface.alternates[0];
    const epOut = alt.endpoints.find(e => e.direction === 'out');
    if (!epOut) throw new Error('No se encontró endpoint OUT en la impresora.');
    this.endpointOut = epOut.endpointNumber;
  }

  /** @param {EscPosOrder} order */
  async printOrder(order, { headerTitle = 'Pizzeria del Barrio', cut = true } = {}) {
    const lines = [];
    lines.push(this.center(headerTitle.toUpperCase()));
    lines.push(this.center('COMPROBANTE'));
    lines.push(this.line());
    lines.push(`ID: ${order.id}`);
    lines.push(`Fecha: ${new Date(order.createdAt).toLocaleString()}`);
    if (order.customerPhone) {
      lines.push(`Cliente: ${order.customerName || ''} (${order.customerPhone})`);
    }
    lines.push(this.line());
    lines.push('Cant  Descripción                Importe');
    lines.push(this.line());

    order.lines.forEach(l => {
      const qty = l.qty.toString().padEnd(4, ' ');
      const name = this.padRight(l.name, 24);
      const total = this.alignRight(l.lineTotal.toFixed(2), 8);
      lines.push(`${qty} ${name}${total}`);
    });

    lines.push(this.line());
    lines.push(this.rowKV('SubTotal', this.money(order.subTotal)));
    if (order.discounts?.length) {
      order.discounts.forEach(d => {
        lines.push(this.rowKV(
          `Desc ${d.label || d.type}`,
          '-' + this.money(d.amount)
        ));
      });
      lines.push(this.rowKV('Desc Total', '-' + this.money(order.discountTotal)));
    }
    lines.push(this.rowKV('TOTAL', this.money(order.grandTotal)));
    lines.push(this.line());
    if (order.payments?.length) {
      lines.push('Pagos:');
      order.payments.forEach(p => {
        lines.push(this.rowKV(` - ${p.method}`, this.money(p.amount)));
      });
      lines.push(this.rowKV('Pagado', this.money(order.amountPaid)));
      if (order.changeDue > 0) {
        lines.push(this.rowKV('Vuelto', this.money(order.changeDue)));
      }
      lines.push(this.rowKV('Estado', order.paymentStatus));
    }
    lines.push(this.line());
    lines.push(this.center('Gracias por su compra'));
    lines.push('\n');

    let buffer = this.encodeText(lines.join('\n'));
    if (cut) {
      buffer = this.concatBuffers(buffer, this.cut());
    }
    await this.send(buffer);
  }

  /** @param {EscPosOrder} order */
  async printKitchen(order, { headerTitle = 'COMANDA COCINA', cut = true } = {}) {
    const lines = [];
    lines.push(this.center(headerTitle));
    lines.push(this.line());
    lines.push(`ID: ${order.id}`);
    lines.push(`Fecha: ${new Date(order.createdAt).toLocaleTimeString()}`);
    lines.push(this.line());
    order.lines.forEach(l => {
      lines.push(`${l.qty}x ${l.name}`);
    });
    lines.push(this.line());
    lines.push(this.center('--- FIN ---'));
    lines.push('\n');
    let buffer = this.encodeText(lines.join('\n'));
    if (cut) buffer = this.concatBuffers(buffer, this.cut());
    await this.send(buffer);
  }

  async send(buffer) {
    if (this.useWebUSB && this.device && this.endpointOut != null) {
      await this.device.transferOut(this.endpointOut, buffer);
    } else if (this.gatewayUrl) {
      // Enviar base64 a un gateway local que lo mande al socket raw de la impresora.
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      await fetch(this.gatewayUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: b64 })
      });
    } else {
      console.warn('No hay destino de impresión configurado.');
    }
  }

  /* ========= Helpers ESC/POS ========= */
  encodeText(str) {
    const encoder = new TextEncoder(); // UTF-8 (algunas impresoras necesitan encoding CP437; se puede adaptar)
    return encoder.encode(str);
  }

  concatBuffers(a, b) {
    const out = new Uint8Array(a.length + b.length);
    out.set(a, 0);
    out.set(b, a.length);
    return out;
  }

  cut() {
    // Full cut
    return new Uint8Array([ESC.charCodeAt(0), 'i'.charCodeAt(0)]);
  }

  line() {
    return '-'.repeat(40);
  }

  center(text) {
    const width = 40;
    const len = text.length;
    if (len >= width) return text;
    const pad = Math.floor((width - len) / 2);
    return ' '.repeat(pad) + text;
  }

  padRight(text, width) {
    return text.length >= width ? text.slice(0, width) : text + ' '.repeat(width - text.length);
  }

  alignRight(text, width) {
    return text.length >= width ? text.slice(0, width) : ' '.repeat(width - text.length) + text;
  }

  rowKV(key, value) {
    const width = 40;
    const left = key;
    const right = value;
    const space = width - (left.length + right.length);
    return left + (space > 0 ? ' '.repeat(space) : '') + right;
  }

  money(n) {
    return '$' + Number(n).toFixed(2);
  }
}