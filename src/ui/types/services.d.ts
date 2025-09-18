// Lightweight type declarations for app services (progressive enhancement)
// Expanded with basic domain DTOs for stronger editor assistance.

export interface RoleDTO { id:string; name:string; description?:string; permissions:string[]; }
export interface UserDTO { id:string; username:string; roleId:string; active:boolean; mustChangePassword?:boolean; }
export interface ProductDTO { id:string; name:string; category?:string; basePrice:number; img?:string; active:boolean; createdAt?:string; }
export interface OrderLineDTO { productId:string; name:string; qty:number; unitPrice:number; lineTotal:number; lineTaxes?:TaxCalculation[]; }
export interface TaxLineDTO { code:string; name:string; base:number; rate:number; amount:number; scope:'line'|'global'; }
export interface TaxCalculation { code:string; name:string; base:number; rate:number; amount:number; scope:'line'|'global'; }
export interface DiscountDTO { type:string; value:number; label?:string; }
export interface PaymentDTO { method:string; amount:number; }
export interface CustomerDTO { phone:string; name:string; address?:string; barrio?:string; }
export interface OrderDTO { 
  id:string; 
  createdAt:string; 
  status:string; 
  lines:OrderLineDTO[]; 
  taxLines?:TaxLineDTO[];
  taxTotal?:number;
  discounts:DiscountDTO[]; 
  payments:PaymentDTO[]; 
  customer?: CustomerDTO;
  customerName?:string;
  customerPhone?:string; 
  total:number; 
  kitchenStatus?: 'pending' | 'in_progress' | 'done';
}
export interface AuthService {
  isAuthenticated(): boolean;
  isFullyAuthenticated?(): boolean;
  hasPermission(p:string): boolean;
  getUsername(): string;
  login(u:string,p:string): Promise<void>;
  logout(): void;
  changeOwnPassword?(oldP:string,newP:string):Promise<void>;
  adminResetPassword?(userId:string,newP:string):Promise<void>;
}

export interface UsersService {
  list(): Promise<UserDTO[]>;
  changeRole(userId:string, roleId:string): Promise<void>;
  deactivate(userId:string): Promise<void>;
  create(data:{ username:string; roleId:string; tempPassword:string }): Promise<void>;
}

export interface RolesService {
  list(): Promise<RoleDTO[]>;
  updateRole(id:string, patch:Partial<Pick<RoleDTO,'permissions'|'description'|'name'>>, user:string): Promise<void>;
  createRole(data:{ name:string; description:string; permissions:string[] }, user:string): Promise<void>;
}

export interface OrdersService {
  finalizeSale(args:{ printKitchen?:boolean; customerData?: CustomerDTO|null; discounts?: DiscountDTO[]; payments?: PaymentDTO[] }): Promise<OrderDTO>;
  cancelOrder(id:string): Promise<void>;
  fulfillOrder(id:string): Promise<void>;
  markPrinted(id:string,type:'invoice'|'kitchen'): Promise<void>;
  orderRepository: { findById(id:string):Promise<OrderDTO|undefined>; listRecent(limit:number):Promise<OrderDTO[]> };
}

export interface PricingResult { subTotal:number; discountTotal:number; grandTotal:number; }
export interface PaymentStatus { amountPaid:number; paymentStatus:'PAID'|'PARTIAL'|'UNPAID'|'OVERPAID'; changeDue:number; }
export interface PricingService { calculate(lines:OrderLineDTO[], discounts:DiscountDTO[]): PricingResult; evaluatePaymentStatus(total:number, payments:PaymentDTO[]): PaymentStatus; }

export interface CartSummary {
  subtotal: number;
  lineTaxes: TaxCalculation[];
  globalTaxes: TaxCalculation[];
  totalTax: number;
  total: number;
  lineCount: number;
  itemCount: number;
}

export interface CartService { 
  toArray(): OrderLineDTO[]; 
  total(): number; 
  getSummary(): CartSummary; 
  addProduct(productId: string): void; 
  changeQty(id: string, d: number): void; 
  remove(id: string): void; 
  clear(): void; 
  isEmpty(): boolean; 
}
export interface AuditService { log(action:string, details:any): Promise<void>; list?(limit:number):Promise<any[]>; }
export interface SalesSummary { date:string; total:number; orders:number; }
export interface TopProduct { productId:string; name:string; qty:number; revenue:number; }
export interface CategoryTotal { category:string; total:number; }
export interface ReportsService { salesByDateRange(f:string,t:string):Promise<SalesSummary[]>; topProducts(f:string,t:string,limit:number):Promise<TopProduct[]>; totalsByCategory(f:string,t:string):Promise<CategoryTotal[]>; }

export interface BasePrinter {
  id?: string;
  name?: string;
  isConnected?(): boolean;
}

export interface InvoicePrinter extends BasePrinter {
  openInvoice(order: OrderDTO, onPrinted?: ()=>void): void;
}

export interface KitchenPrinter extends BasePrinter {
  openTicket(order: OrderDTO): void;
}

export interface EscPosPrinterLike extends BasePrinter {
  printOrder(order: any, opts?: any): Promise<void>|void;
  printKitchen(order: any, opts?: any): Promise<void>|void;
}

export interface PrintingMetrics {
  jobsProcessed: number;
  jobsFailed: number;
  escposRetries: number;
  avgLatencyMs: number;
  batchCount: number;
  queuedPeak: number;
}

export interface PrintingService {
  printInvoice(order: OrderDTO, markPrinted?: (t:'invoice')=>void): void;
  printKitchen(order: OrderDTO, markPrinted?: (t:'kitchen')=>void): void;
  printBoth(order: OrderDTO, markPrinted?: (t:'invoice'|'kitchen')=>void): void;
  setPreferredMode(mode:'auto'|'escpos'|'window'): void;
  getPreferredMode(): 'auto'|'escpos'|'window';
  setFallbackWindow(enabled: boolean): void;
  getFallbackWindow(): boolean;
  on(evt:string, cb:(data:any)=>void): void;
  off(evt:string, cb:(data:any)=>void): void;
  getMetrics(): PrintingMetrics;
  cancelJob(id:string): boolean;
  cancelAll(): number; // returns count cancelled
}
export interface AnalyticsService {
  salesSummary(from: string, to: string): Promise<{ count: number; total: number; avgTicket: number; tax: number; tip: number }>;
  bestSellers(from: string, to: string, limit: number): Promise<{ name: string; qty: number; revenue: number }[]>;
  notSoldProducts(from: string, to: string): Promise<{ name: string }[]>;
  customerPerformance(from: string, to: string): Promise<{ phone: string; name: string; total: number; orders: number }[]>;
}

export interface CostVarianceReportService {
  summary(from: string, to: string): Promise<{ count: number; totalVariance: number; top: { name: string; variance: number }[] }>;
}

export interface TaxService {
  getAllTaxes(): Promise<any[]>;
  getActiveTaxes(): Promise<any[]>;
  createTax(tax: any): Promise<any>;
  updateTax(id: string, updates: any): Promise<any>;
  deleteTax(id: string): Promise<void>;
  permanentlyDeleteTax(id: string): Promise<void>;
  createDefaultTaxes(): Promise<void>;
  calculate?(lines: OrderLineDTO[]): Promise<TaxCalculation[]>;
}

export interface WasteService {
  reportWaste(data: { ingredientId: string; qty: number; reason: string; notes?: string }): Promise<any>;
  getWasteHistory(limit?: number): Promise<any[]>;
}

export interface PriceExperimentService {
  recordExperiment(data: { productId: string; scenarios: any[]; base: any }): Promise<any>;
  getExperiments(limit?: number): Promise<any[]>;
}

export interface PromotionService {
  applyPromotions?(lines: OrderLineDTO[], activePromotions: any[]): Promise<any>;
}

export interface ServicesRegistry {
  costVarianceReport: CostVarianceReportService;
  analytics: AnalyticsService;
  auth: AuthService;
  users: UsersService;
  roles: RolesService;
  orders: OrdersService;
  pricing: PricingService;
  cart: CartService;
  audit: AuditService;
  reports: ReportsService;
  tax: TaxService;
  waste?: WasteService;
  priceExperiments?: PriceExperimentService;
  promotions?: PromotionService;
  config?: any; // ConfigurationService
  printer?: InvoicePrinter;
  kitchenPrinter?: KitchenPrinter;
  escposPrinter?: EscPosPrinterLike; // optional advanced thermal printer
  printing?: PrintingService;
}
