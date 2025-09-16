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
  // load preference
  try { const stored = localStorage.getItem('print_pref'); if(stored==='escpos'||stored==='window'||stored==='auto') this.preferredMode = stored; } catch {}
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
    const hasEscpos = !!this.escpos && (this.preferredMode==='auto' || this.preferredMode==='escpos');
    // If ESC/POS printer present, we can use it for all
    if(hasEscpos) {
      // Attempt batching: collect similar jobs within batchWindowMs
      if(job.kind==='invoice' || job.kind==='both' || job.kind==='kitchen') {
        this.batchBuffer.push(job);
        if(!this.batchTimer) {
          this.batchTimer = setTimeout(async ()=> {
            const batch = this.batchBuffer.splice(0, this.batchBuffer.length);
            this.batchTimer = null;
            if(batch.length>1) { this.metrics.batchCount++; logger.debug('Batch process', { size: batch.length }); }
            // Combine invoices then kitchens
            for(const j of batch) {
              if(j.kind==='invoice' || j.kind==='both') {
                await this.tryEscpos(async ()=> this.escpos!.printOrder(j.order as any, {}), j);
                j.markPrinted?.('invoice');
              }
              if(j.kind==='kitchen' || j.kind==='both') {
                await this.tryEscpos(async ()=> this.escpos!.printKitchen(j.order as any, {}), j);
                j.markPrinted?.('kitchen');
              }
            }
            // Emit updated metrics (batchCount may have changed) so observers can react promptly
            this.emit('metrics', this.metrics);
          }, this.batchWindowMs);
        }
        return; // job handled via batch mechanism
      }
      if(kind === 'invoice' || kind === 'both') {
  await this.tryEscpos(async ()=> this.escpos!.printOrder(order as any, {}), job);
        job.markPrinted?.('invoice');
      }
      if(kind === 'kitchen' || kind === 'both') {
  await this.tryEscpos(async ()=> this.escpos!.printKitchen(order as any, {}), job);
        job.markPrinted?.('kitchen');
      }
      return;
    }

    // Otherwise use dedicated adapters
    if(kind === 'invoice' || kind === 'both') {
      if(this.invoice?.openInvoice) {
  this.invoice.openInvoice(order, ()=> job.markPrinted?.('invoice'));
      } else if(this.fallbackWindow) {
        this.windowInvoice(order);
        job.markPrinted?.('invoice');
      }
    }
    if(kind === 'kitchen' || kind === 'both') {
      if(this.kitchen?.openTicket) {
        this.kitchen.openTicket(order);
        job.markPrinted?.('kitchen');
      }
    }
  }

  printInvoice(order: OrderDTO, markPrinted?: (t:'invoice')=>void) { return this.enqueue({ kind:'invoice', order, markPrinted }); }
  printKitchen(order: OrderDTO, markPrinted?: (t:'kitchen')=>void) { return this.enqueue({ kind:'kitchen', order, markPrinted }); }
  printBoth(order: OrderDTO, markPrinted?: (t:'invoice'|'kitchen')=>void) { return this.enqueue({ kind:'both', order, markPrinted }); }

  private windowInvoice(order: OrderDTO) {
    const linesHtml = (order.lines||[]).map((l: any)=>`<tr><td>${l.qty} x ${l.name}</td><td style="text-align:right">${this.moneyFmt(l.lineTotal)}</td></tr>`).join('');
    const totalFmt = this.moneyFmt(order.total||0);
    const html = `<html><head><title>${order.id}</title><style>body{font-family:monospace;margin:8px;}table{width:100%;font-size:12px;border-collapse:collapse;}td{padding:2px 0;}thead td{border-bottom:1px solid #000;}tfoot td{border-top:1px solid #000;font-weight:bold;}</style></head><body>
    <h3 style='margin:0 0 4px'>Factura ${order.id}</h3>
    <small>${order.createdAt}</small>
    <table><thead><tr><td>Item</td><td style='text-align:right'>Importe</td></tr></thead><tbody>${linesHtml}</tbody><tfoot><tr><td>Total</td><td style='text-align:right'>${totalFmt}</td></tr></tfoot></table>
    </body></html>`;
    const w = window.open('', '_blank', 'width=480,height=640');
    if(!w) return;
    w.document.write(html);
    w.document.close();
    setTimeout(()=> w.print(), 200);
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
    try { await fn(); }
    catch(e) {
      if(job.attempts==null) job.attempts = 0;
      const attempt = job.attempts++;
      if(attempt < this.escposRetryDelays.length) {
        const delay = this.escposRetryDelays[attempt];
  logger.warn('EscPos retry', { delay, attempt });
        this.metrics.escposRetries++;
        await new Promise(r=> setTimeout(r, delay));
        return this.tryEscpos(fn, job);
      }
  logger.error('EscPos giving up after retries', { error:String(e) });
      // fallback to window if allowed
      if(this.fallbackWindow && this.preferredMode!=='escpos') {
        this.windowInvoice(job.order);
      } else throw e;
    }
  }
}
