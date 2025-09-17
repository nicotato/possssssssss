import { RxTaxRepository } from '../../infrastructure/repositories/rx-tax-repository.js';
import { logger } from '../../infrastructure/logging/logger.js';

export interface TaxType {
  id: string;
  code: string;
  name: string;
  rate: number;
  scope: 'line' | 'global';
  appliesToCategories: string[];
  active: boolean;
}

export interface TaxCalculation {
  code: string;
  name: string;
  base: number;
  rate: number;
  amount: number;
  scope: 'line' | 'global';
}

export class TaxService {
  constructor(private taxRepo: RxTaxRepository) {}

  async getAllTaxes(): Promise<TaxType[]> {
    return await this.taxRepo.all();
  }

  async getActiveTaxes(): Promise<TaxType[]> {
    return await this.taxRepo.allActive();
  }

  async createTax(tax: Omit<TaxType, 'id'>): Promise<TaxType> {
    const id = `tax_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTax: TaxType = {
      ...tax,
      id,
      rate: tax.rate / 100 // Convertir porcentaje a decimal
    };

    logger.info('Creating tax', { tax: newTax });
    return await this.taxRepo.create(newTax);
  }

  async updateTax(id: string, updates: Partial<TaxType>): Promise<TaxType | null> {
    if (updates.rate !== undefined) {
      updates.rate = updates.rate / 100; // Convertir porcentaje a decimal
    }
    
    logger.info('Updating tax', { id, updates });
    return await this.taxRepo.update(id, updates);
  }

  async deleteTax(id: string): Promise<void> {
    logger.info('Deactivating tax', { id });
    await this.taxRepo.update(id, { active: false });
  }

  async permanentlyDeleteTax(id: string): Promise<void> {
    logger.info('Permanently deleting tax', { id });
    await this.taxRepo.delete(id);
  }

  /**
   * Calcula impuestos para líneas de productos
   */
  calculateLineTaxes(
    lineTotal: number, 
    categoryId: string | undefined, 
    taxes: TaxType[]
  ): TaxCalculation[] {
    const applicableTaxes = taxes.filter(tax => 
      tax.active && 
      tax.scope === 'line' &&
      (tax.appliesToCategories.length === 0 || 
       (categoryId && tax.appliesToCategories.includes(categoryId)))
    );

    return applicableTaxes.map(tax => ({
      code: tax.code,
      name: tax.name,
      base: lineTotal,
      rate: tax.rate,
      amount: lineTotal * tax.rate,
      scope: 'line' as const
    }));
  }

  /**
   * Calcula impuestos globales sobre el subtotal
   */
  calculateGlobalTaxes(subtotal: number, taxes: TaxType[]): TaxCalculation[] {
    const globalTaxes = taxes.filter(tax => 
      tax.active && tax.scope === 'global'
    );

    return globalTaxes.map(tax => ({
      code: tax.code,
      name: tax.name,
      base: subtotal,
      rate: tax.rate,
      amount: subtotal * tax.rate,
      scope: 'global' as const
    }));
  }

  /**
   * Calcula todos los impuestos para una orden completa
   */
  calculateOrderTaxes(
    lines: Array<{ total: number; categoryId?: string }>,
    taxes: TaxType[]
  ): { lineTaxes: TaxCalculation[]; globalTaxes: TaxCalculation[]; totalTax: number } {
    const lineTaxes: TaxCalculation[] = [];
    
    // Calcular impuestos por línea
    lines.forEach(line => {
      const lineCalculations = this.calculateLineTaxes(line.total, line.categoryId, taxes);
      lineTaxes.push(...lineCalculations);
    });

    // Calcular subtotal después de impuestos de línea
    const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
    
    // Calcular impuestos globales
    const globalTaxes = this.calculateGlobalTaxes(subtotal, taxes);

    // Total de impuestos
    const totalTax = [...lineTaxes, ...globalTaxes].reduce((sum, tax) => sum + tax.amount, 0);

    logger.debug('Tax calculation complete', {
      subtotal,
      lineTaxesCount: lineTaxes.length,
      globalTaxesCount: globalTaxes.length,
      totalTax
    });

    return {
      lineTaxes,
      globalTaxes,
      totalTax
    };
  }

  /**
   * Crea impuestos predeterminados para Argentina
   */
  async createDefaultTaxes(): Promise<void> {
    const defaultTaxes = [
      {
        code: 'IVA21',
        name: 'IVA 21%',
        rate: 21, // Como porcentaje, será convertido por createTax
        scope: 'line' as const,
        appliesToCategories: [],
        active: true
      },
      {
        code: 'IVA105',
        name: 'IVA 10.5%',
        rate: 10.5, // Como porcentaje, será convertido por createTax
        scope: 'line' as const,
        appliesToCategories: [],
        active: true
      },
      {
        code: 'EXENTO',
        name: 'Exento',
        rate: 0, // 0% sigue siendo 0
        scope: 'line' as const,
        appliesToCategories: [],
        active: true
      }
    ];

    for (const tax of defaultTaxes) {
      const existing = await this.taxRepo.all();
      if (!existing.find((t: TaxType) => t.code === tax.code)) {
        await this.createTax(tax);
      }
    }

    logger.info('Default taxes created');
  }
}