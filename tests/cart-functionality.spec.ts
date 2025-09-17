import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CartService } from '../src/application/services/cart-service.js';
import { TaxService } from '../src/application/services/tax-service.js';

describe('Cart Functionality Tests', () => {
  let cartService: CartService;
  let mockTaxService: TaxService;
  let mockStorage: Storage;

  beforeEach(() => {
    // Mock localStorage
    const storage = new Map<string, string>();
    mockStorage = {
      getItem: vi.fn((key: string) => storage.get(key) || null),
      setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
      removeItem: vi.fn((key: string) => storage.delete(key)),
      clear: vi.fn(() => storage.clear()),
      length: 0,
      key: vi.fn((index: number) => null)
    };

    // Mock TaxService
    mockTaxService = {
      getActiveTaxes: vi.fn().mockResolvedValue([]),
      calculateLineTaxes: vi.fn().mockReturnValue([]),
      calculateGlobalTaxes: vi.fn().mockReturnValue([])
    } as any;

    cartService = new CartService('test_cart', mockStorage);
    cartService.setTaxService(mockTaxService);
  });

  describe('Add/Remove Items', () => {
    it('should add item to cart', async () => {
      const product = { id: 'prod1', name: 'Product 1', price: 10.50 };
      await cartService.addProduct(product);
      await cartService.addProduct(product); // Add second one
      
      const lines = cartService.toArray();
      expect(lines).toHaveLength(1);
      expect(lines[0].productId).toBe('prod1');
      expect(lines[0].name).toBe('Product 1');
      expect(lines[0].qty).toBe(2);
      expect(lines[0].unitPrice).toBe(10.50);
      expect(lines[0].lineTotal).toBe(21);
    });

    it('should update quantity when adding same product', async () => {
      const product = { id: 'prod1', name: 'Product 1', price: 10 };
      await cartService.addProduct(product);
      await cartService.addProduct(product);
      await cartService.addProduct(product);
      
      const lines = cartService.toArray();
      expect(lines).toHaveLength(1);
      expect(lines[0].qty).toBe(3);
      expect(lines[0].lineTotal).toBe(30);
    });

    it('should remove item from cart', async () => {
      const product1 = { id: 'prod1', name: 'Product 1', price: 10 };
      const product2 = { id: 'prod2', name: 'Product 2', price: 15 };
      await cartService.addProduct(product1);
      await cartService.addProduct(product2);
      
      cartService.remove('prod1');
      
      const lines = cartService.toArray();
      expect(lines).toHaveLength(1);
      expect(lines[0].productId).toBe('prod2');
    });

    it('should update item quantity', async () => {
      const product = { id: 'prod1', name: 'Product 1', price: 10 };
      await cartService.addProduct(product);
      await cartService.changeQty('prod1', 4); // Add 4 more (total 5)
      
      const lines = cartService.toArray();
      expect(lines[0].qty).toBe(5);
      expect(lines[0].lineTotal).toBe(50);
    });

    it('should remove item when quantity becomes 0 or negative', async () => {
      const product = { id: 'prod1', name: 'Product 1', price: 10 };
      await cartService.addProduct(product);
      await cartService.addProduct(product);
      await cartService.changeQty('prod1', -2); // Remove 2 (total 0)
      
      const lines = cartService.toArray();
      expect(lines).toHaveLength(0);
    });
  });

  describe('Cart Calculations', () => {
    it('should calculate subtotal correctly', async () => {
      const product1 = { id: 'prod1', name: 'Product 1', price: 10 };
      const product2 = { id: 'prod2', name: 'Product 2', price: 15 };
      
      await cartService.addProduct(product1);
      await cartService.addProduct(product1); // 2 x 10 = 20
      await cartService.addProduct(product2);
      await cartService.addProduct(product2);
      await cartService.addProduct(product2); // 3 x 15 = 45
      
      const summary = cartService.getSummary();
      expect(summary.subtotal).toBe(65);
      expect(summary.lineCount).toBe(2);
      expect(summary.itemCount).toBe(5);
    });

    it('should calculate total with taxes', async () => {
      // Configure mock tax service to return taxes
      vi.mocked(mockTaxService.calculateLineTaxes).mockReturnValue([
        { code: 'vat', name: 'VAT', rate: 0.21, amount: 4.20, base: 20, scope: 'line' }
      ]);
      vi.mocked(mockTaxService.calculateGlobalTaxes).mockReturnValue([
        { code: 'service', name: 'Service Fee', rate: 0.05, amount: 3.25, base: 65, scope: 'global' }
      ]);

      const product = { id: 'prod1', name: 'Product 1', price: 20 };
      await cartService.addProduct(product);
      
      const summary = cartService.getSummary();
      expect(summary.subtotal).toBe(20);
      expect(summary.totalTax).toBe(7.45); // 4.20 + 3.25
      expect(summary.total).toBe(27.45);   // 20 + 7.45
    });
  });

  describe('Cart State Management', () => {
    it('should check if cart is empty', async () => {
      expect(cartService.isEmpty()).toBe(true);
      
      const product = { id: 'prod1', name: 'Product 1', price: 10 };
      await cartService.addProduct(product);
      expect(cartService.isEmpty()).toBe(false);
      
      cartService.clear();
      expect(cartService.isEmpty()).toBe(true);
    });

    it('should clear cart', async () => {
      const product1 = { id: 'prod1', name: 'Product 1', price: 10 };
      const product2 = { id: 'prod2', name: 'Product 2', price: 15 };
      await cartService.addProduct(product1);
      await cartService.addProduct(product2);
      
      cartService.clear();
      
      const lines = cartService.toArray();
      expect(lines).toHaveLength(0);
    });

    it('should calculate total correctly', async () => {
      const product = { id: 'prod1', name: 'Product 1', price: 25 };
      await cartService.addProduct(product);
      await cartService.addProduct(product);
      
      expect(cartService.total()).toBe(50);
    });
  });

  describe('Persistence', () => {
    it('should save cart to localStorage', async () => {
      const product = { id: 'prod1', name: 'Product 1', price: 10 };
      await cartService.addProduct(product);
      
      expect(mockStorage.setItem).toHaveBeenCalled();
    });

    it('should load cart from localStorage', () => {
      const cartData = JSON.stringify({
        lines: [
          { productId: 'prod1', name: 'Product 1', qty: 2, unitPrice: 10, lineTotal: 20, lineTaxes: [] }
        ],
        timestamp: Date.now()
      });
      
      vi.mocked(mockStorage.getItem).mockReturnValue(cartData);
      
      const newCartService = new CartService('test_cart', mockStorage);
      const lines = newCartService.toArray();
      
      expect(lines).toHaveLength(1);
      expect(lines[0].productId).toBe('prod1');
    });
  });

  describe('Order Export', () => {
    it('should export cart as order data', async () => {
      const product = { id: 'prod1', name: 'Product 1', price: 25 };
      await cartService.addProduct(product);
      await cartService.addProduct(product);
      
      const orderData = cartService.toOrderData({ customerId: 'cust123' });
      
      expect(orderData.id).toBeDefined();
      expect(orderData.status).toBe('completed');
      expect(orderData.lines).toHaveLength(1);
      expect(orderData.subTotal).toBe(50);
      expect(orderData.customerId).toBe('cust123');
    });
  });
});