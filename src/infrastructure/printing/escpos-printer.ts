// TypeScript ESC/POS printer
const ESC = '\x1B';
const GS = '\x1D';
import type { OrderDTO } from '../../react/types/services.d.ts';

export class EscPosPrinter {
  private device: any = null;
  private endpointOut: any = null;
  private gatewayUrl: string | null;
  private useWebUSB: boolean;
  constructor(options: { gatewayUrl?:string|null; useWebUSB?:boolean } = {}) {
    this.gatewayUrl = options.gatewayUrl || null;
    this.useWebUSB = options.useWebUSB !== false;
  }
  async connectWebUSB() {
    if(!('usb' in navigator)) throw new Error('WebUSB no soportado');
    // @ts-ignore
    this.device = await navigator.usb.requestDevice({ filters:[ { vendorId:0x04b8 }, { vendorId:0x0456 }, { vendorId:0x067b } ] });
    await this.device.open();
    if(this.device.configuration==null) await this.device.selectConfiguration(1);
    const iface = this.device.configuration.interfaces.find((i:any)=> i.alternates.some((a:any)=> a.interfaceClass===7)) || this.device.configuration.interfaces[0];
    await this.device.claimInterface(iface.interfaceNumber);
    const alt = iface.alternates[0];
    const epOut = alt.endpoints.find((e:any)=> e.direction==='out');
    if(!epOut) throw new Error('No endpoint OUT');
    this.endpointOut = epOut.endpointNumber;
  }
  async printOrder(order: any, { headerTitle='Pizzeria del Barrio', cut=true }={}) {
    const lines: string[] = [];
    lines.push(this.center(headerTitle.toUpperCase()));
    lines.push(this.center('COMPROBANTE'));
    lines.push(this.line());
    lines.push(`ID: ${order.id}`);
    lines.push(`Fecha: ${new Date(order.createdAt).toLocaleString()}`);
    if(order.customerPhone) lines.push(`Cliente: ${order.customerName||''} (${order.customerPhone})`);
    lines.push(this.line());
    lines.push('Cant  Descripción                Importe');
    lines.push(this.line());
    (order.lines||[]).forEach((l:any)=> {
      const qty = String(l.qty).padEnd(4,' ');
      const name = this.padRight(l.name,24);
      const total = this.alignRight(Number(l.lineTotal).toFixed(2),8);
      lines.push(`${qty} ${name}${total}`);
    });
    lines.push(this.line());
    lines.push(this.rowKV('TOTAL', this.money(order.total||order.grandTotal)));
    lines.push(this.center('Gracias por su compra'));
    lines.push('\n');
    let buffer = this.encodeText(lines.join('\n'));
    if(cut) buffer = this.concatBuffers(buffer, this.cut());
    await this.send(buffer);
  }
  async printKitchen(order:any, { headerTitle='COMANDA COCINA', cut=true }={}) {
    const lines: string[] = [];
    lines.push(this.center(headerTitle));
    lines.push(this.line());
    lines.push(`ID: ${order.id}`);
    lines.push(`Fecha: ${new Date(order.createdAt).toLocaleTimeString()}`);
    lines.push(this.line());
    (order.lines||[]).forEach((l:any)=> { lines.push(`${l.qty}x ${l.name}`); });
    lines.push(this.center('--- FIN ---'));
    lines.push('\n');
    let buffer = this.encodeText(lines.join('\n'));
    if(cut) buffer = this.concatBuffers(buffer, this.cut());
    await this.send(buffer);
  }
  private async send(buffer: Uint8Array) {
    if(this.useWebUSB && this.device && this.endpointOut!=null) {
      await this.device.transferOut(this.endpointOut, buffer);
    } else if(this.gatewayUrl) {
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      await fetch(this.gatewayUrl, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ data:b64 }) });
    } else {
      console.warn('No hay destino de impresión configurado.');
    }
  }
  private encodeText(str:string) { return new TextEncoder().encode(str); }
  private concatBuffers(a:Uint8Array,b:Uint8Array) { const out = new Uint8Array(a.length+b.length); out.set(a,0); out.set(b,a.length); return out; }
  private cut(){ return new Uint8Array([ESC.charCodeAt(0), 'i'.charCodeAt(0)]); }
  private line(){ return '-'.repeat(40); }
  private center(t:string){ const w=40; if(t.length>=w) return t; const pad=Math.floor((w-t.length)/2); return ' '.repeat(pad)+t; }
  private padRight(t:string,w:number){ return t.length>=w? t.slice(0,w): t+' '.repeat(w-t.length); }
  private alignRight(t:string,w:number){ return t.length>=w? t.slice(0,w): ' '.repeat(w-t.length)+t; }
  private rowKV(k:string,v:string){ const w=40; const space=w-(k.length+v.length); return k + (space>0? ' '.repeat(space):'') + v; }
  private money(n:any){ return '$'+ Number(n||0).toFixed(2); }
}
