import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppState, User, Warehouse, Product, Customer, Quotation, SalesOrder,
  SalesInvoice, SalesReturn, OtherIncome, AccountingReceipt,
  Supplier, PurchaseOrder, PurchaseInvoice, PurchaseReturn,
  OtherExpense, AccountingPayment, StockTransfer, StockAdjustment, BundleOrder
} from '../types';

const defaultAdmin: User = {
  id: 'admin-001',
  username: 'admin',
  password: 'admin123',
  name: '系統管理員',
  role: 'admin',
  permissions: [
    'warehouse.view', 'warehouse.edit', 'warehouse.admin',
    'erp.customer.view', 'erp.customer.edit',
    'erp.supplier.view', 'erp.supplier.edit',
    'erp.product.view', 'erp.product.edit',
    'erp.report.view', 'admin.users'
  ],
  active: true,
  createdAt: new Date().toISOString(),
};

const sampleWarehouse: Warehouse = {
  id: 'wh-001',
  name: '主倉庫 A',
  description: '主要儲存空間',
  shelves: [
    {
      id: 'shelf-001',
      name: 'A-01',
      levels: 4,
      posX: 80,
      posY: 80,
      width: 120,
      height: 60,
      color: '#3b82f6',
      slots: [],
    },
    {
      id: 'shelf-002',
      name: 'A-02',
      levels: 4,
      posX: 240,
      posY: 80,
      width: 120,
      height: 60,
      color: '#10b981',
      slots: [],
    },
    {
      id: 'shelf-003',
      name: 'B-01',
      levels: 3,
      posX: 80,
      posY: 200,
      width: 120,
      height: 60,
      color: '#f59e0b',
      slots: [],
    },
  ],
  createdAt: new Date().toISOString(),
};

const sampleProduct: Product = {
  id: 'prod-001',
  name: '靈魂之星舍利',
  category: '舍利類',
  supplierName: '心靈企業有限公司',
  description: '高品質靈魂之星舍利，多種規格可選',
  specs: [
    { id: 'spec-001', name: '5mm 粉色', sku: 'SSL-5P', originalPrice: 500, specialPrice: 450, cost: 200, safetyStock: 10, quantity: 50, unit: '顆', netWeight: 2, length: 0.5, width: 0.5, height: 0.5 },
    { id: 'spec-002', name: '8mm 白色', sku: 'SSL-8W', originalPrice: 800, specialPrice: 720, cost: 320, safetyStock: 8, quantity: 35, unit: '顆', netWeight: 5, length: 0.8, width: 0.8, height: 0.8 },
    { id: 'spec-003', name: '10mm 金色', sku: 'SSL-10G', originalPrice: 1200, specialPrice: 1080, cost: 480, safetyStock: 5, quantity: 20, unit: '顆', netWeight: 8, length: 1.0, width: 1.0, height: 1.0 },
    { id: 'spec-004', name: '12mm 紫色', sku: 'SSL-12V', originalPrice: 1800, specialPrice: 1620, cost: 720, safetyStock: 3, quantity: 15, unit: '顆', netWeight: 12, length: 1.2, width: 1.2, height: 1.2 },
    { id: 'spec-005', name: '5mm 藍色', sku: 'SSL-5B', originalPrice: 500, specialPrice: 450, cost: 200, safetyStock: 10, quantity: 42, unit: '顆', netWeight: 2, length: 0.5, width: 0.5, height: 0.5 },
    { id: 'spec-006', name: '8mm 紅色', sku: 'SSL-8R', originalPrice: 800, specialPrice: 720, cost: 320, safetyStock: 8, quantity: 28, unit: '顆', netWeight: 5, length: 0.8, width: 0.8, height: 0.8 },
    { id: 'spec-007', name: '10mm 黑色', sku: 'SSL-10K', originalPrice: 1200, specialPrice: 1080, cost: 480, safetyStock: 5, quantity: 18, unit: '顆', netWeight: 8, length: 1.0, width: 1.0, height: 1.0 },
    { id: 'spec-008', name: '12mm 白色', sku: 'SSL-12W', originalPrice: 1800, specialPrice: 1620, cost: 720, safetyStock: 3, quantity: 10, unit: '顆', netWeight: 12, length: 1.2, width: 1.2, height: 1.2 },
    { id: 'spec-009', name: '15mm 金色', sku: 'SSL-15G', originalPrice: 2500, specialPrice: 2250, cost: 1000, safetyStock: 2, quantity: 8, unit: '顆', netWeight: 20, length: 1.5, width: 1.5, height: 1.5 },
    { id: 'spec-010', name: '20mm 彩虹', sku: 'SSL-20R', originalPrice: 3500, specialPrice: 3150, cost: 1400, safetyStock: 2, quantity: 5, unit: '顆', netWeight: 35, length: 2.0, width: 2.0, height: 2.0 },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const sampleCustomer: Customer = {
  id: 'cust-001',
  code: 'C001',
  name: '陽光貿易有限公司',
  contact: '王小明',
  phone: '02-1234-5678',
  email: 'sun@trade.com',
  address: '台北市信義區信義路五段100號',
  taxId: '12345678',
  paymentTerms: 'Net 30',
  creditLimit: 500000,
  balance: 50000,
  note: '',
  createdAt: new Date().toISOString(),
};

const sampleSupplier: Supplier = {
  id: 'supp-001',
  code: 'S001',
  name: '心靈企業有限公司',
  contact: '李大華',
  phone: '04-9876-5432',
  email: 'spirit@enterprise.com',
  address: '台中市西屯區工業路50號',
  taxId: '87654321',
  paymentTerms: 'Net 60',
  balance: 20000,
  note: '',
  createdAt: new Date().toISOString(),
};

interface Store extends AppState {
  // Auth
  login: (username: string, password: string) => boolean;
  logout: () => void;
  setCurrentUser: (user: User | null) => void;

  // Users
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Warehouses
  addWarehouse: (w: Warehouse) => void;
  updateWarehouse: (id: string, updates: Partial<Warehouse>) => void;
  deleteWarehouse: (id: string) => void;

  // Products
  addProduct: (p: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Customers
  addCustomer: (c: Customer) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Quotations
  addQuotation: (q: Quotation) => void;
  updateQuotation: (id: string, updates: Partial<Quotation>) => void;
  deleteQuotation: (id: string) => void;

  // Sales Orders
  addSalesOrder: (o: SalesOrder) => void;
  updateSalesOrder: (id: string, updates: Partial<SalesOrder>) => void;
  deleteSalesOrder: (id: string) => void;

  // Sales Invoices
  addSalesInvoice: (inv: SalesInvoice) => void;
  updateSalesInvoice: (id: string, updates: Partial<SalesInvoice>) => void;
  deleteSalesInvoice: (id: string) => void;

  // Sales Returns
  addSalesReturn: (r: SalesReturn) => void;
  updateSalesReturn: (id: string, updates: Partial<SalesReturn>) => void;
  deleteSalesReturn: (id: string) => void;

  // Other Income
  addOtherIncome: (i: OtherIncome) => void;
  updateOtherIncome: (id: string, updates: Partial<OtherIncome>) => void;
  deleteOtherIncome: (id: string) => void;

  // Receipts
  addAccountingReceipt: (r: AccountingReceipt) => void;
  updateAccountingReceipt: (id: string, updates: Partial<AccountingReceipt>) => void;
  deleteAccountingReceipt: (id: string) => void;

  // Suppliers
  addSupplier: (s: Supplier) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  // Purchase Orders
  addPurchaseOrder: (o: PurchaseOrder) => void;
  updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => void;
  deletePurchaseOrder: (id: string) => void;

  // Purchase Invoices
  addPurchaseInvoice: (inv: PurchaseInvoice) => void;
  updatePurchaseInvoice: (id: string, updates: Partial<PurchaseInvoice>) => void;
  deletePurchaseInvoice: (id: string) => void;

  // Purchase Returns
  addPurchaseReturn: (r: PurchaseReturn) => void;
  updatePurchaseReturn: (id: string, updates: Partial<PurchaseReturn>) => void;
  deletePurchaseReturn: (id: string) => void;

  // Other Expenses
  addOtherExpense: (e: OtherExpense) => void;
  updateOtherExpense: (id: string, updates: Partial<OtherExpense>) => void;
  deleteOtherExpense: (id: string) => void;

  // Payments
  addAccountingPayment: (p: AccountingPayment) => void;
  updateAccountingPayment: (id: string, updates: Partial<AccountingPayment>) => void;
  deleteAccountingPayment: (id: string) => void;

  // Stock Transfers
  addStockTransfer: (t: StockTransfer) => void;
  updateStockTransfer: (id: string, updates: Partial<StockTransfer>) => void;
  deleteStockTransfer: (id: string) => void;

  // Stock Adjustments
  addStockAdjustment: (a: StockAdjustment) => void;
  updateStockAdjustment: (id: string, updates: Partial<StockAdjustment>) => void;
  deleteStockAdjustment: (id: string) => void;

  // Bundle Orders
  addBundleOrder: (b: BundleOrder) => void;
  updateBundleOrder: (id: string, updates: Partial<BundleOrder>) => void;
  deleteBundleOrder: (id: string) => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      users: [defaultAdmin],
      warehouses: [sampleWarehouse],
      products: [sampleProduct],
      customers: [sampleCustomer],
      quotations: [],
      salesOrders: [],
      salesInvoices: [],
      salesReturns: [],
      otherIncomes: [],
      accountingReceipts: [],
      suppliers: [sampleSupplier],
      purchaseOrders: [],
      purchaseInvoices: [],
      purchaseReturns: [],
      otherExpenses: [],
      accountingPayments: [],
      stockTransfers: [],
      stockAdjustments: [],
      bundleOrders: [],

      // Auth
      login: (username, password) => {
        const user = get().users.find(u => u.username === username && u.password === password && u.active);
        if (user) { set({ currentUser: user }); return true; }
        return false;
      },
      logout: () => set({ currentUser: null }),
      setCurrentUser: (user) => set({ currentUser: user }),

      // Users CRUD
      addUser: (u) => set(s => ({ users: [...s.users, u] })),
      updateUser: (id, upd) => set(s => ({ users: s.users.map(u => u.id === id ? { ...u, ...upd } : u) })),
      deleteUser: (id) => set(s => ({ users: s.users.filter(u => u.id !== id) })),

      // Warehouses CRUD
      addWarehouse: (w) => set(s => ({ warehouses: [...s.warehouses, w] })),
      updateWarehouse: (id, upd) => set(s => ({ warehouses: s.warehouses.map(w => w.id === id ? { ...w, ...upd } : w) })),
      deleteWarehouse: (id) => set(s => ({ warehouses: s.warehouses.filter(w => w.id !== id) })),

      // Products CRUD
      addProduct: (p) => set(s => ({ products: [...s.products, p] })),
      updateProduct: (id, upd) => set(s => ({ products: s.products.map(p => p.id === id ? { ...p, ...upd } : p) })),
      deleteProduct: (id) => set(s => ({ products: s.products.filter(p => p.id !== id) })),

      // Customers CRUD
      addCustomer: (c) => set(s => ({ customers: [...s.customers, c] })),
      updateCustomer: (id, upd) => set(s => ({ customers: s.customers.map(c => c.id === id ? { ...c, ...upd } : c) })),
      deleteCustomer: (id) => set(s => ({ customers: s.customers.filter(c => c.id !== id) })),

      // Quotations CRUD
      addQuotation: (q) => set(s => ({ quotations: [...s.quotations, q] })),
      updateQuotation: (id, upd) => set(s => ({ quotations: s.quotations.map(q => q.id === id ? { ...q, ...upd } : q) })),
      deleteQuotation: (id) => set(s => ({ quotations: s.quotations.filter(q => q.id !== id) })),

      // Sales Orders CRUD
      addSalesOrder: (o) => set(s => ({ salesOrders: [...s.salesOrders, o] })),
      updateSalesOrder: (id, upd) => set(s => ({ salesOrders: s.salesOrders.map(o => o.id === id ? { ...o, ...upd } : o) })),
      deleteSalesOrder: (id) => set(s => ({ salesOrders: s.salesOrders.filter(o => o.id !== id) })),

      // Sales Invoices CRUD
      addSalesInvoice: (inv) => set(s => ({ salesInvoices: [...s.salesInvoices, inv] })),
      updateSalesInvoice: (id, upd) => set(s => ({ salesInvoices: s.salesInvoices.map(i => i.id === id ? { ...i, ...upd } : i) })),
      deleteSalesInvoice: (id) => set(s => ({ salesInvoices: s.salesInvoices.filter(i => i.id !== id) })),

      // Sales Returns CRUD
      addSalesReturn: (r) => set(s => ({ salesReturns: [...s.salesReturns, r] })),
      updateSalesReturn: (id, upd) => set(s => ({ salesReturns: s.salesReturns.map(r => r.id === id ? { ...r, ...upd } : r) })),
      deleteSalesReturn: (id) => set(s => ({ salesReturns: s.salesReturns.filter(r => r.id !== id) })),

      // Other Income CRUD
      addOtherIncome: (i) => set(s => ({ otherIncomes: [...s.otherIncomes, i] })),
      updateOtherIncome: (id, upd) => set(s => ({ otherIncomes: s.otherIncomes.map(i => i.id === id ? { ...i, ...upd } : i) })),
      deleteOtherIncome: (id) => set(s => ({ otherIncomes: s.otherIncomes.filter(i => i.id !== id) })),

      // Receipts CRUD
      addAccountingReceipt: (r) => set(s => ({ accountingReceipts: [...s.accountingReceipts, r] })),
      updateAccountingReceipt: (id, upd) => set(s => ({ accountingReceipts: s.accountingReceipts.map(r => r.id === id ? { ...r, ...upd } : r) })),
      deleteAccountingReceipt: (id) => set(s => ({ accountingReceipts: s.accountingReceipts.filter(r => r.id !== id) })),

      // Suppliers CRUD
      addSupplier: (s_) => set(s => ({ suppliers: [...s.suppliers, s_] })),
      updateSupplier: (id, upd) => set(s => ({ suppliers: s.suppliers.map(sup => sup.id === id ? { ...sup, ...upd } : sup) })),
      deleteSupplier: (id) => set(s => ({ suppliers: s.suppliers.filter(sup => sup.id !== id) })),

      // Purchase Orders CRUD
      addPurchaseOrder: (o) => set(s => ({ purchaseOrders: [...s.purchaseOrders, o] })),
      updatePurchaseOrder: (id, upd) => set(s => ({ purchaseOrders: s.purchaseOrders.map(o => o.id === id ? { ...o, ...upd } : o) })),
      deletePurchaseOrder: (id) => set(s => ({ purchaseOrders: s.purchaseOrders.filter(o => o.id !== id) })),

      // Purchase Invoices CRUD
      addPurchaseInvoice: (inv) => set(s => ({ purchaseInvoices: [...s.purchaseInvoices, inv] })),
      updatePurchaseInvoice: (id, upd) => set(s => ({ purchaseInvoices: s.purchaseInvoices.map(i => i.id === id ? { ...i, ...upd } : i) })),
      deletePurchaseInvoice: (id) => set(s => ({ purchaseInvoices: s.purchaseInvoices.filter(i => i.id !== id) })),

      // Purchase Returns CRUD
      addPurchaseReturn: (r) => set(s => ({ purchaseReturns: [...s.purchaseReturns, r] })),
      updatePurchaseReturn: (id, upd) => set(s => ({ purchaseReturns: s.purchaseReturns.map(r => r.id === id ? { ...r, ...upd } : r) })),
      deletePurchaseReturn: (id) => set(s => ({ purchaseReturns: s.purchaseReturns.filter(r => r.id !== id) })),

      // Other Expenses CRUD
      addOtherExpense: (e) => set(s => ({ otherExpenses: [...s.otherExpenses, e] })),
      updateOtherExpense: (id, upd) => set(s => ({ otherExpenses: s.otherExpenses.map(e => e.id === id ? { ...e, ...upd } : e) })),
      deleteOtherExpense: (id) => set(s => ({ otherExpenses: s.otherExpenses.filter(e => e.id !== id) })),

      // Payments CRUD
      addAccountingPayment: (p_) => set(s => ({ accountingPayments: [...s.accountingPayments, p_] })),
      updateAccountingPayment: (id, upd) => set(s => ({ accountingPayments: s.accountingPayments.map(p => p.id === id ? { ...p, ...upd } : p) })),
      deleteAccountingPayment: (id) => set(s => ({ accountingPayments: s.accountingPayments.filter(p => p.id !== id) })),

      // Stock Transfers CRUD
      addStockTransfer: (t) => set(s => ({ stockTransfers: [...s.stockTransfers, t] })),
      updateStockTransfer: (id, upd) => set(s => ({ stockTransfers: s.stockTransfers.map(t => t.id === id ? { ...t, ...upd } : t) })),
      deleteStockTransfer: (id) => set(s => ({ stockTransfers: s.stockTransfers.filter(t => t.id !== id) })),

      // Stock Adjustments CRUD
      addStockAdjustment: (a) => set(s => ({ stockAdjustments: [...s.stockAdjustments, a] })),
      updateStockAdjustment: (id, upd) => set(s => ({ stockAdjustments: s.stockAdjustments.map(a => a.id === id ? { ...a, ...upd } : a) })),
      deleteStockAdjustment: (id) => set(s => ({ stockAdjustments: s.stockAdjustments.filter(a => a.id !== id) })),

      // Bundle Orders CRUD
      addBundleOrder: (b) => set(s => ({ bundleOrders: [...s.bundleOrders, b] })),
      updateBundleOrder: (id, upd) => set(s => ({ bundleOrders: s.bundleOrders.map(b => b.id === id ? { ...b, ...upd } : b) })),
      deleteBundleOrder: (id) => set(s => ({ bundleOrders: s.bundleOrders.filter(b => b.id !== id) })),
    }),
    {
      name: 'warehouse-erp-storage',
      partialize: (state) => {
        // Don't persist currentUser for security
        const { currentUser: _cu, ...rest } = state;
        return rest;
      },
    }
  )
);
