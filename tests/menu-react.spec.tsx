/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MenuPage } from '../src/ui/pages/MenuPage.tsx';
import { AppStateProvider } from '../src/ui/AppContext.tsx';
import { ToastProvider } from '../src/ui/components/ToastProvider.tsx';
import { ConfirmProvider } from '../src/ui/components/ConfirmProvider.tsx';
import { FormModalProvider } from '../src/ui/hooks/useFormModal.tsx';
import { render, fireEvent, waitFor } from '@testing-library/react';

// Minimal mock implementation for testing
const createMockServices = () => ({
  costVarianceReport: { summary: vi.fn().mockResolvedValue({ count: 0, totalVariance: 0, top: [] }) },
  analytics: { 
    salesSummary: vi.fn().mockResolvedValue({ count: 0, total: 0, avgTicket: 0, tax: 0, tip: 0 }),
    bestSellers: vi.fn().mockResolvedValue([]),
    notSoldProducts: vi.fn().mockResolvedValue([]),
    customerPerformance: vi.fn().mockResolvedValue([])
  },
  auth: { 
    isAuthenticated: () => true, 
    hasPermission: () => true, 
    getUsername: () => 'test',
    login: vi.fn(),
    logout: vi.fn()
  },
  users: { list: vi.fn().mockResolvedValue([]), changeRole: vi.fn(), deactivate: vi.fn(), create: vi.fn() },
  roles: { list: vi.fn().mockResolvedValue([]), updateRole: vi.fn(), createRole: vi.fn() },
  orders: { 
    finalizeSale: vi.fn().mockResolvedValue({ id: '1', total: 50 }),
    cancelOrder: vi.fn(),
    fulfillOrder: vi.fn(),
    markPrinted: vi.fn(),
    orderRepository: { findById: vi.fn(), listRecent: vi.fn().mockResolvedValue([]) }
  },
  pricing: { 
    calculate: vi.fn().mockReturnValue({ subTotal: 50, discountTotal: 0, grandTotal: 50 }),
    evaluatePaymentStatus: vi.fn().mockReturnValue({ amountPaid: 0, paymentStatus: 'UNPAID', changeDue: 0 })
  },
  cart: { 
    toArray: vi.fn().mockReturnValue([]),
    total: vi.fn().mockReturnValue(50),
    addProduct: vi.fn(),
    changeQty: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
    isEmpty: vi.fn().mockReturnValue(false)
  },
  audit: { log: vi.fn() },
  reports: { 
    salesByDateRange: vi.fn().mockResolvedValue([]),
    topProducts: vi.fn().mockResolvedValue([]),
    totalsByCategory: vi.fn().mockResolvedValue([])
  }
});

describe('MenuPage', () => {
  beforeEach(() => localStorage.clear?.());

  function setup() {
    const mockState = {
      services: createMockServices(),
        repos: {
        products: {
          getAll: vi.fn().mockResolvedValue([{ id: 'p1', name: 'Prod 1', price: 50, toJSON: () => ({ id: 'p1', name: 'Prod 1', price: 50 }) }]),
          findById: vi.fn().mockResolvedValue({ id: 'p1', name: 'Prod 1', price: 50, toJSON: () => ({ id: 'p1', name: 'Prod 1', price: 50 }) }),
          col: {}
        }
      },
      rawState: {}
    };
    
    const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <AppStateProvider value={mockState}>
        <ToastProvider>
          <ConfirmProvider>
            <FormModalProvider>
              {children}
            </FormModalProvider>
          </ConfirmProvider>
        </ToastProvider>
      </AppStateProvider>
    );
    
    const utils = render(<MenuPage />, { wrapper: Wrapper });
    return { ...utils, mockState };
  }

  it('renders product list', async () => {
    const { getByText } = setup();
    await waitFor(() => {
      expect(getByText('Prod 1')).toBeTruthy();
    });
  });

  it('shows menu section', async () => {
    const { container } = setup();
    // Wait for the loading state to finish and the menu section to appear
    await waitFor(() => {
      const menuSections = container.querySelectorAll('.productos-section');
      expect(menuSections.length).toBeGreaterThan(0);
    });
  });

  it('shows cart section', async () => {
    const { container } = setup();
    // Cart section should be available immediately as it doesn't depend on loading
    await waitFor(() => {
      const cartSections = container.querySelectorAll('.carrito');
      expect(cartSections.length).toBeGreaterThan(0);
    });
  });
});
