import type { OrderDTO } from '../../ui/types/services.d.ts';
import type { InvoicePrinter, KitchenPrinter, EscPosPrinterLike } from '../../ui/types/services.d.ts';
import { logger } from '../../infrastructure/logging/logger.ts';
import { buildMoneyFormatter } from '../../utils/i18n-format.ts';

export type PrintMode = 'auto' | 'escpos' | 'window';
export interface PrintJob { kind: 'invoice' | 'kitchen' | 'both'; order: OrderDTO; markPrinted?(type:'invoice'|'kitchen'): void | Promise<void>; onDone?(): void; attempts?: number; enqueuedAt?: number; }
export interface PrintingMetrics { jobsProcessed:number; jobsFailed:number; escposRetries:number; avgLatencyMs:number; batchCount:number; queuedPeak:number; }

interface QueueItem extends PrintJob { id: number; }

export class PrintingService {
  private invoice?: InvoicePrinter;
  private kitchen?: KitchenPrinter;
  private escpos?: EscPosPrinterLike;
  private queue: QueueItem[] = [];
  private processing = false;
  private idSeq = 0;
  private fallbackWindow = true; // if no target found, open window invoice
  private preferredMode: PrintMode = 'auto';
  private listeners: { [evt:string]: ((data:any)=>void)[] } = {};
  private escposRetryDelays = [250, 500, 1000];
  private metrics: PrintingMetrics = { jobsProcessed:0, jobsFailed:0, escposRetries:0, avgLatencyMs:0, batchCount:0, queuedPeak:0 };
  private batchWindowMs = 50;
  private batchBuffer: QueueItem[] = [];
  private batchTimer: any = null;
  private moneyFmt = buildMoneyFormatter();

  constructor(opts: { invoice?:InvoicePrinter; kitchen?:KitchenPrinter; escpos?:EscPosPrinterLike; fallbackWindow?:boolean }) {
    this.invoice = opts.invoice;
    this.kitchen = opts.kitchen;
    this.escpos = opts.escpos;
    if(opts.fallbackWindow === false) this.fallbackWindow = false;
    
    // load preferences from localStorage
    try { 
      const stored = localStorage.getItem('print_pref'); 
      if(stored==='escpos'||stored==='window'||stored==='auto') this.preferredMode = stored; 
    } catch {}
    
    try {
      const storedFallback = localStorage.getItem('print_fallback_window');
      if(storedFallback !== null) this.fallbackWindow = JSON.parse(storedFallback);
    } catch {}
  }

  enqueue(job: PrintJob): string {
    const item: QueueItem = { ...job, id: ++this.idSeq, attempts: job.attempts||0, enqueuedAt: performance.now() };
    this.queue.push(item);
    if(this.queue.length > this.metrics.queuedPeak) this.metrics.queuedPeak = this.queue.length;
    this.emit('queue', { size:this.queue.length });
    this.run();
    return 'pj_'+item.id;
  }

  async run() {
    if(this.processing) return;
    this.processing = true;
    this.emit('processing', true);
    while(this.queue.length) {
      const job = this.queue.shift()!;
      const start = performance.now();
  await this.execute(job).catch(e=> { logger.error('Print job failed', { error: String(e) }); this.metrics.jobsFailed++; });
      const lat = performance.now() - start;
      // incremental avg
      const n = this.metrics.jobsProcessed + 1;
      this.metrics.avgLatencyMs = ((this.metrics.avgLatencyMs * this.metrics.jobsProcessed) + lat) / n;
      this.metrics.jobsProcessed = n;
      job.onDone?.();
      this.emit('queue', { size:this.queue.length });
      this.emit('metrics', this.metrics);
    }
    this.processing = false;
    this.emit('processing', false);
  }

  private async execute(job: QueueItem) {
    const { order, kind } = job;
    
    logger.info('Executing print job', { 
      jobKind: kind, 
      preferredMode: this.preferredMode, 
      fallbackWindow: this.fallbackWindow,
      escposAvailable: !!this.escpos
    });

    // If preferred mode is window, go directly to fallback
    if (this.preferredMode === 'window') {
      logger.info('Preferred mode is window, using direct fallback');
      if(kind === 'invoice' || kind === 'both') {
        if(this.fallbackWindow) {
          logger.info('Using window for invoice');
          this.windowInvoice(order);
          job.markPrinted?.('invoice');
        } else {
          logger.warn('Window mode selected but fallback disabled');
        }
      }
      if(kind === 'kitchen' || kind === 'both') {
        if(this.kitchen?.openTicket) {
          logger.info('Using kitchen printer');
          this.kitchen.openTicket(order);
          job.markPrinted?.('kitchen');
        }
      }
      return;
    }

    // ESC/POS mode: force ESC/POS only (strict mode)
    if (this.preferredMode === 'escpos') {
      if (this.escpos) {
        logger.info('ESC/POS mode: using ESC/POS printer only (strict mode)');
        try {
          if(kind === 'invoice' || kind === 'both') {
            await this.tryEscposStrict(async ()=> this.escpos!.printOrder(order as any, {}), job);
            job.markPrinted?.('invoice');
          }
          if(kind === 'kitchen' || kind === 'both') {
            await this.tryEscposStrict(async ()=> this.escpos!.printKitchen(order as any, {}), job);
            job.markPrinted?.('kitchen');
          }
        } catch (error) {
          // Handle fallback only for invoices when fallback is enabled
          if (this.fallbackWindow && (kind === 'invoice' || kind === 'both')) {
            logger.info('ESC/POS mode: fallback window enabled, using window after ESC/POS failure');
            this.windowInvoice(order);
            job.markPrinted?.('invoice');
          } else if (kind === 'invoice' || kind === 'both') {
            // No fallback for invoices - strict mode
            logger.error('ESC/POS mode: strict mode failed and no fallback available for invoices');
            throw error;
          }
          
          // For kitchen orders, always try kitchen printer if available (independent of invoice handling)
          if((kind === 'kitchen' || kind === 'both') && this.kitchen?.openTicket) {
            logger.info('ESC/POS mode: using kitchen printer for kitchen orders');
            this.kitchen.openTicket(order);
            job.markPrinted?.('kitchen');
          } else if (kind === 'kitchen') {
            // Kitchen-only job failed and no kitchen printer available
            logger.error('ESC/POS mode: no kitchen printer available');
            throw error;
          }
        }
      } else {
        logger.error('ESC/POS mode selected but no ESC/POS printer available');
        throw new Error('ESC/POS printer not available');
      }
      return;
    }

    // Auto mode: intelligent fallback (ESC/POS -> dedicated -> window)
    if (this.preferredMode === 'auto') {
      logger.info('Auto mode: trying intelligent fallback sequence');
      
      // Try ESC/POS first if available
      if (this.escpos) {
        logger.info('Auto mode: trying ESC/POS first');
        try {
          if(kind === 'invoice' || kind === 'both') {
            await this.tryEscpos(async ()=> this.escpos!.printOrder(order as any, {}), job);
            job.markPrinted?.('invoice');
          }
          if(kind === 'kitchen' || kind === 'both') {
            await this.tryEscpos(async ()=> this.escpos!.printKitchen(order as any, {}), job);
            job.markPrinted?.('kitchen');
          }
          return; // Success with ESC/POS
        } catch (error) {
          logger.info('Auto mode: ESC/POS failed, trying dedicated printers');
        }
      }
      
      // Fallback to dedicated printers
      logger.info('Auto mode: using dedicated adapters');
      if(kind === 'invoice' || kind === 'both') {
        if(this.invoice?.openInvoice) {
          logger.info('Auto mode: using dedicated invoice printer');
          this.invoice.openInvoice(order, ()=> job.markPrinted?.('invoice'));
        } else if(this.fallbackWindow) {
          logger.info('Auto mode: using window fallback');
          this.windowInvoice(order);
          job.markPrinted?.('invoice');
        } else {
          logger.warn('Auto mode: no invoice options available');
        }
      }
      if(kind === 'kitchen' || kind === 'both') {
        if(this.kitchen?.openTicket) {
          logger.info('Auto mode: using kitchen printer');
          this.kitchen.openTicket(order);
          job.markPrinted?.('kitchen');
        } else {
          logger.warn('Auto mode: no kitchen printer available');
        }
      }
      return;
    }

    // This should never be reached if modes are handled correctly above
    logger.error('Unexpected execution path in printing service', { preferredMode: this.preferredMode });
  }

  printInvoice(order: OrderDTO, markPrinted?: (t:'invoice')=>void) { return this.enqueue({ kind:'invoice', order, markPrinted }); }
  printKitchen(order: OrderDTO, markPrinted?: (t:'kitchen')=>void) { return this.enqueue({ kind:'kitchen', order, markPrinted }); }
  printBoth(order: OrderDTO, markPrinted?: (t:'invoice'|'kitchen')=>void) { return this.enqueue({ kind:'both', order, markPrinted }); }

  private windowInvoice(order: OrderDTO) {
    const linesHtml = (order.lines||[]).map((l: any)=>`<tr><td>${l.qty} x ${l.name}</td><td style="text-align:right">${this.moneyFmt(l.lineTotal)}</td></tr>`).join('');
    
    // Calcular totales para factura con impuestos
    const subtotal = (order.lines||[]).reduce((sum: number, l: any) => sum + (l.lineTotal || 0), 0);
    const taxTotal = (order.taxTotal || 0);
    const totalFmt = this.moneyFmt(order.total||0);
    const subtotalFmt = this.moneyFmt(subtotal);
    const taxTotalFmt = this.moneyFmt(taxTotal);
    
    // HTML para impuestos detallados
    let taxHtml = '';
    if (order.taxLines && order.taxLines.length > 0) {
      // Consolidar impuestos por código
      const taxMap = new Map();
      order.taxLines.forEach((tax: any) => {
        const existing = taxMap.get(tax.code);
        if (existing) {
          existing.amount += tax.amount;
        } else {
          taxMap.set(tax.code, { ...tax });
        }
      });
      
      const consolidatedTaxes = Array.from(taxMap.values());
      taxHtml = consolidatedTaxes.map((tax: any) => 
        `<tr><td style="padding-left: 10px;">${tax.name || tax.code} (${(tax.rate * 100).toFixed(1)}%)</td><td style="text-align:right">+${this.moneyFmt(tax.amount)}</td></tr>`
      ).join('');
    }
    
    const html = `<html><head><title>Factura ${order.id}</title><style>
      body{font-family: 'Courier New', monospace; margin: 12px; font-size: 14px;}
      .header {text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px;}
      .business-name {font-size: 18px; font-weight: bold; margin: 0;}
      .business-info {font-size: 12px; margin: 2px 0;}
      table{width:100%; font-size: 13px; border-collapse:collapse; margin: 8px 0;}
      .invoice-info {margin-bottom: 12px; font-size: 12px;}
      .items-table td{padding: 3px 0; border-bottom: 1px dotted #ccc;}
      .items-header td{border-bottom: 1px solid #000; font-weight: bold; padding: 4px 0;}
      .subtotal-section {border-top: 1px solid #000; margin-top: 8px;}
      .subtotal-section td{padding: 2px 0;}
      .tax-line {font-size: 12px; color: #666;}
      .total-line {border-top: 2px solid #000; font-weight: bold; font-size: 15px;}
      .footer {text-align: center; margin-top: 20px; font-size: 11px; color: #666;}
      .customer-info {margin: 8px 0; font-size: 12px; border: 1px solid #ddd; padding: 6px;}
    </style></head><body>
    
    <div class="header">
      <div class="business-name">Pizzería del Barrio</div>
      <div class="business-info">Sistema POS - Factura de Venta</div>
    </div>
    
    <div class="invoice-info">
      <strong>Factura:</strong> ${order.id}<br>
      <strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleString('es-AR')}<br>
      ${order.customerName ? `<strong>Cliente:</strong> ${order.customerName}<br>` : ''}
      ${order.customerPhone ? `<strong>Teléfono:</strong> ${order.customerPhone}<br>` : ''}
    </div>
    
    ${order.customer ? `
    <div class="customer-info">
      <strong>📞 ${order.customer.phone || order.customerPhone || ''}</strong><br>
      ${order.customer.name || order.customerName || ''}<br>
      ${order.customer.address || ''} ${order.customer.barrio ? `- ${order.customer.barrio}` : ''}
    </div>
    ` : ''}
    
    <table class="items-table">
      <tr class="items-header">
        <td><strong>Descripción</strong></td>
        <td style="text-align:right"><strong>Importe</strong></td>
      </tr>
      ${linesHtml}
    </table>
    
    <table class="subtotal-section">
      <tr>
        <td><strong>Subtotal</strong></td>
        <td style="text-align:right"><strong>${subtotalFmt}</strong></td>
      </tr>
      ${taxHtml}
      ${taxTotal > 0 ? `
      <tr>
        <td><strong>Total Impuestos</strong></td>
        <td style="text-align:right"><strong>${taxTotalFmt}</strong></td>
      </tr>
      ` : ''}
      <tr class="total-line">
        <td><strong>TOTAL A PAGAR</strong></td>
        <td style="text-align:right"><strong>${totalFmt}</strong></td>
      </tr>
    </table>
    
    ${order.payments && order.payments.length > 0 ? `
    <table style="margin-top: 12px;">
      <tr><td colspan="2"><strong>Forma de Pago:</strong></td></tr>
      ${order.payments.map((p: any) => `<tr><td>${p.method}</td><td style="text-align:right">${this.moneyFmt(p.amount)}</td></tr>`).join('')}
    </table>
    ` : ''}
    
    <div class="footer">
      <p>¡Gracias por su compra!</p>
      <p>POS Sistema - ${new Date().getFullYear()}</p>
    </div>
    
    </body></html>`;
    
    const w = window.open('', '_blank', 'width=480,height=640,scrollbars=yes');
    if(!w) return;
    w.document.write(html);
    w.document.close();
    setTimeout(()=> w.print(), 300);
  }

  // Preference API
  setPreferredMode(mode: PrintMode) {
    this.preferredMode = mode;
    try { localStorage.setItem('print_pref', mode); } catch {}
    this.emit('mode', mode);
  }
  
  getPreferredMode(): PrintMode { return this.preferredMode; }
  
  setFallbackWindow(enabled: boolean) {
    this.fallbackWindow = enabled;
    try { localStorage.setItem('print_fallback_window', JSON.stringify(enabled)); } catch {}
    this.emit('fallback', enabled);
  }
  
  getFallbackWindow(): boolean { return this.fallbackWindow; }
  
  getMetrics(): PrintingMetrics { return { ...this.metrics }; }

  cancelJob(publicId:string) {
    const num = parseInt(publicId.replace('pj_',''),10);
    const idx = this.queue.findIndex(q=> q.id===num);
    if(idx>=0) { this.queue.splice(idx,1); this.emit('queue', { size:this.queue.length }); return true; }
    const bidx = this.batchBuffer.findIndex(q=> q.id===num);
    if(bidx>=0) { this.batchBuffer.splice(bidx,1); return true; }
    return false;
  }
  cancelAll(): number {
    const count = this.queue.length + this.batchBuffer.length;
    this.queue.length = 0;
    this.batchBuffer.length = 0;
    if(this.batchTimer) { clearTimeout(this.batchTimer); this.batchTimer=null; }
    this.emit('queue', { size:0 });
    return count;
  }

  // Events
  on(evt:string, cb:(data:any)=>void) { (this.listeners[evt] ||= []).push(cb); }
  off(evt:string, cb:(data:any)=>void) { this.listeners[evt] = (this.listeners[evt]||[]).filter(f=>f!==cb); }
  private emit(evt:string, data:any) { (this.listeners[evt]||[]).forEach(f=> { try { f(data);} catch(e){ logger.error('Listener error', { evt, error:String(e) }); } }); }

  private async tryEscpos(fn:()=>Promise<void>, job:QueueItem): Promise<void> {
    try { 
      await fn(); 
    } catch(e) {
      if(job.attempts==null) job.attempts = 0;
      const attempt = job.attempts++;
      if(attempt < this.escposRetryDelays.length) {
        const delay = this.escposRetryDelays[attempt];
        logger.warn('EscPos retry', { delay, attempt });
        this.metrics.escposRetries++;
        await new Promise(r=> setTimeout(r, delay));
        return this.tryEscpos(fn, job);
      }
      
      logger.error('EscPos failed after retries', { error:String(e), preferredMode: this.preferredMode, fallbackWindow: this.fallbackWindow });
      
      // Use fallback window if enabled, regardless of preferred mode
      if(this.fallbackWindow) {
        logger.info('Using fallback window after ESC/POS failure');
        this.windowInvoice(job.order);
        return; // Success via fallback
      } 
      
      // No fallback available, throw error
      throw new Error(`ESC/POS printing failed: ${String(e)}`);
    }
  }

  private async tryEscposStrict(fn:()=>Promise<void>, job:QueueItem): Promise<void> {
    try { 
      await fn(); 
    } catch(e) {
      if(job.attempts==null) job.attempts = 0;
      const attempt = job.attempts++;
      if(attempt < this.escposRetryDelays.length) {
        const delay = this.escposRetryDelays[attempt];
        logger.warn('EscPos retry (strict mode)', { delay, attempt });
        this.metrics.escposRetries++;
        await new Promise(r=> setTimeout(r, delay));
        return this.tryEscposStrict(fn, job);
      }
      
      logger.error('EscPos failed after retries (strict mode)', { error:String(e), preferredMode: this.preferredMode, fallbackWindow: this.fallbackWindow });
      
      // In strict mode, do NOT use automatic fallback - let the caller handle it
      throw new Error(`ESC/POS printing failed (strict mode): ${String(e)}`);
    }
  }
}
