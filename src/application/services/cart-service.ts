import { TaxService, TaxType, TaxCalculation } from './tax-service.js';

export interface CartLine {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  categoryId?: string;
  lineTaxes?: TaxCalculation[];
}

export interface CartSummary {
  subtotal: number;
  lineTaxes: TaxCalculation[];
  globalTaxes: TaxCalculation[];
  totalTax: number;
  total: number;
  lineCount: number;
  itemCount: number;
}

export class CartService {
  private lines = new Map<string, CartLine>();
  private _storageKey: string;
  private _storage: Storage | null;
  private _taxService: TaxService | null = null;
  private _taxes: TaxType[] = [];

  constructor(storageKey = 'app_cart_v1', storage: Storage | null = (typeof localStorage !== 'undefined' ? localStorage : null)) {
    this._storageKey = storageKey;
    this._storage = storage;
    this._load();
  }

  // Configurar el servicio de impuestos
  setTaxService(taxService: TaxService): void {
    this._taxService = taxService;
    this._loadTaxes();
  }

  private async _loadTaxes(): Promise<void> {
    if (this._taxService) {
      try {
        this._taxes = await this._taxService.getActiveTaxes();
      } catch (error) {
        console.error('Error loading taxes:', error);
        this._taxes = [];
      }
    }
  }

  async addProduct(product: any): Promise<void> {
    if (!product || !product.id) return;
    
    const existing = this.lines.get(product.id);
    const unitPrice = typeof product.unitPrice === 'number' ? product.unitPrice 
                    : typeof product.price === 'number' ? product.price 
                    : typeof product.basePrice === 'number' ? product.basePrice 
                    : 0;
    const name = product.name || product.title || product.id;
    const categoryId = product.categoryId || product.category;

    if (existing) {
      existing.qty += 1;
      existing.lineTotal = existing.qty * existing.unitPrice;
      await this._calculateLineTaxes(existing);
    } else {
      const newLine: CartLine = {
        productId: product.id,
        name,
        qty: 1,
        unitPrice,
        lineTotal: unitPrice,
        categoryId,
        lineTaxes: []
      };
      
      await this._calculateLineTaxes(newLine);
      this.lines.set(product.id, newLine);
    }
    
    this._persist();
  }

  async changeQty(productId: string, delta: number): Promise<void> {
    const line = this.lines.get(productId);
    if (!line) return;
    
    line.qty += delta;
    if (line.qty <= 0) {
      this.lines.delete(productId);
    } else {
      line.lineTotal = line.qty * line.unitPrice;
      await this._calculateLineTaxes(line);
    }
    
    this._persist();
  }

  remove(productId: string): void {
    this.lines.delete(productId);
    this._persist();
  }

  clear(): void {
    this.lines.clear();
    this._persist();
  }

  toArray(): CartLine[] {
    return Array.from(this.lines.values());
  }

  // Cálculo básico (sin impuestos) - mantenido para compatibilidad
  total(): number {
    return this.getSummary().total;
  }

  // Nuevo método que devuelve resumen completo con impuestos
  getSummary(): CartSummary {
    const lines = this.toArray();
    const subtotal = lines.reduce((acc, line) => acc + line.lineTotal, 0);
    
    // Recopilar impuestos de línea
    const lineTaxes: TaxCalculation[] = [];
    lines.forEach(line => {
      if (line.lineTaxes) {
        lineTaxes.push(...line.lineTaxes);
      }
    });

    // Calcular impuestos globales
    const globalTaxes = this._taxService ? 
      this._taxService.calculateGlobalTaxes(subtotal, this._taxes) : [];

    // Total de impuestos
    const totalTax = [...lineTaxes, ...globalTaxes].reduce((sum, tax) => sum + tax.amount, 0);

    return {
      subtotal,
      lineTaxes,
      globalTaxes,
      totalTax,
      total: subtotal + totalTax,
      lineCount: lines.length,
      itemCount: lines.reduce((acc, line) => acc + line.qty, 0)
    };
  }

  isEmpty(): boolean {
    return this.lines.size === 0;
  }

  // Método para recalcular todos los impuestos (útil cuando cambian las configuraciones)
  async recalculateTaxes(): Promise<void> {
    await this._loadTaxes();
    for (const line of this.lines.values()) {
      await this._calculateLineTaxes(line);
    }
    this._persist();
  }

  private async _calculateLineTaxes(line: CartLine): Promise<void> {
    if (!this._taxService) {
      line.lineTaxes = [];
      return;
    }

    // Recargar impuestos activos cada vez para asegurar estado actualizado
    try {
      this._taxes = await this._taxService.getActiveTaxes();
    } catch (error) {
      console.error('Error loading taxes for calculation:', error);
      this._taxes = [];
    }

    line.lineTaxes = this._taxService.calculateLineTaxes(
      line.lineTotal, 
      line.categoryId, 
      this._taxes
    );
  }

  private _persist(): void {
    if (!this._storage) return;
    
    try {
      const data = {
        lines: this.toArray(),
        timestamp: Date.now()
      };
      const payload = JSON.stringify(data);
      this._storage.setItem(this._storageKey, payload);
    } catch (error) {
      console.error('Error persisting cart:', error);
    }
  }

  private _load(): void {
    if (!this._storage) return;
    
    try {
      const raw = this._storage.getItem(this._storageKey);
      if (raw) {
        const data = JSON.parse(raw);
        
        // Soporte para formato legacy y nuevo formato
        const linesToLoad = data.lines || data;
        
        if (Array.isArray(linesToLoad)) {
          linesToLoad.forEach((line: CartLine) => {
            // Asegurar que lineTaxes existe
            if (!line.lineTaxes) {
              line.lineTaxes = [];
            }
            this.lines.set(line.productId, line);
          });
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }

  // Método para exportar orden con impuestos calculados
  toOrderData(customerData: any = {}): any {
    const summary = this.getSummary();
    const lines = this.toArray();

    // Consolidar impuestos por código
    const taxLineMap = new Map<string, any>();
    
    [...summary.lineTaxes, ...summary.globalTaxes].forEach(tax => {
      const existing = taxLineMap.get(tax.code);
      if (existing) {
        existing.base += tax.base;
        existing.amount += tax.amount;
      } else {
        taxLineMap.set(tax.code, {
          code: tax.code,
          name: tax.name,
          rate: tax.rate,
          base: tax.base,
          amount: tax.amount,
          scope: tax.scope
        });
      }
    });

    const taxLines = Array.from(taxLineMap.values());

    return {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'completed',
      lines: lines.map(line => ({
        productId: line.productId,
        name: line.name,
        qty: line.qty,
        unitPrice: line.unitPrice,
        lineTotal: line.lineTotal,
        categoryId: line.categoryId,
        lineTaxes: line.lineTaxes || []
      })),
      subTotal: summary.subtotal,
      taxLines,
      taxTotal: summary.totalTax,
      total: summary.total,
      ...customerData
    };
  }
}