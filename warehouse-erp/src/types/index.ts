// ===== AUTH =====
export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'manager' | 'staff' | 'viewer';
  permissions: Permission[];
  active: boolean;
  createdAt: string;
}

export type Permission =
  | 'warehouse.view' | 'warehouse.edit' | 'warehouse.admin'
  | 'erp.customer.view' | 'erp.customer.edit'
  | 'erp.supplier.view' | 'erp.supplier.edit'
  | 'erp.product.view' | 'erp.product.edit'
  | 'erp.report.view'
  | 'admin.users';

// ===== WAREHOUSE =====
export interface ProductSpec {
  id: string;
  name: string;
  sku: string;
  originalPrice: number;
  specialPrice: number;
  cost: number;
  safetyStock: number;
  quantity: number;
  unit: string;
  netWeight: number;
  length: number;
  width: number;
  height: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  supplierName: string;
  description: string;
  specs: ProductSpec[];
  createdAt: string;
  updatedAt: string;
}

export interface ShelfSlot {
  id: string;
  level: number;
  productId: string | null;
  specId: string | null;
  quantity: number;
  note: string;
}

export interface Shelf {
  id: string;
  name: string;
  levels: number;
  slots: ShelfSlot[];
  posX: number;
  posY: number;
  width: number;
  height: number;
  color: string;
}

export interface Warehouse {
  id: string;
  name: string;
  description: string;
  shelves: Shelf[];
  createdAt: string;
}

// ===== ERP - CUSTOMER =====
export interface Customer {
  id: string;
  code: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  taxId: string;
  paymentTerms: string;
  creditLimit: number;
  balance: number;
  note: string;
  createdAt: string;
}

export interface QuotationItem {
  id: string;
  productId: string;
  productName: string;
  specId: string;
  specName: string;
  qty: number;
  unitPrice: number;
  discount: number;
  amount: number;
}

export interface Quotation {
  id: string;
  code: string;
  customerId: string;
  customerName: string;
  date: string;
  validUntil: string;
  items: QuotationItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted';
  note: string;
  createdAt: string;
}

export interface SalesOrderItem {
  id: string;
  productId: string;
  productName: string;
  specId: string;
  specName: string;
  qty: number;
  unitPrice: number;
  discount: number;
  amount: number;
}

export interface SalesOrder {
  id: string;
  code: string;
  customerId: string;
  customerName: string;
  quotationId: string | null;
  date: string;
  deliveryDate: string;
  items: SalesOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  note: string;
  warehouseId: string;
  createdAt: string;
}

export interface SalesInvoice {
  id: string;
  code: string;
  customerId: string;
  customerName: string;
  orderId: string | null;
  date: string;
  dueDate: string;
  items: SalesOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  status: 'unpaid' | 'partial' | 'paid' | 'overdue';
  note: string;
  createdAt: string;
}

export interface SalesReturn {
  id: string;
  code: string;
  customerId: string;
  customerName: string;
  invoiceId: string | null;
  date: string;
  items: SalesOrderItem[];
  total: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface OtherIncome {
  id: string;
  code: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  note: string;
  createdAt: string;
}

export interface AccountingReceipt {
  id: string;
  code: string;
  customerId: string;
  customerName: string;
  invoiceId: string | null;
  date: string;
  amount: number;
  method: 'cash' | 'transfer' | 'check' | 'other';
  note: string;
  createdAt: string;
}

// ===== ERP - SUPPLIER =====
export interface Supplier {
  id: string;
  code: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  taxId: string;
  paymentTerms: string;
  balance: number;
  note: string;
  createdAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  specId: string;
  specName: string;
  qty: number;
  unitCost: number;
  amount: number;
}

export interface PurchaseOrder {
  id: string;
  code: string;
  supplierId: string;
  supplierName: string;
  date: string;
  expectedDate: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  warehouseId: string;
  note: string;
  createdAt: string;
}

export interface PurchaseInvoice {
  id: string;
  code: string;
  supplierId: string;
  supplierName: string;
  orderId: string | null;
  date: string;
  dueDate: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  status: 'unpaid' | 'partial' | 'paid' | 'overdue';
  warehouseId: string;
  note: string;
  createdAt: string;
}

export interface PurchaseReturn {
  id: string;
  code: string;
  supplierId: string;
  supplierName: string;
  invoiceId: string | null;
  date: string;
  items: PurchaseOrderItem[];
  total: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface OtherExpense {
  id: string;
  code: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  note: string;
  createdAt: string;
}

export interface AccountingPayment {
  id: string;
  code: string;
  supplierId: string;
  supplierName: string;
  invoiceId: string | null;
  date: string;
  amount: number;
  method: 'cash' | 'transfer' | 'check' | 'other';
  note: string;
  createdAt: string;
}

// ===== ERP - PRODUCT OPERATIONS =====
export interface StockTransfer {
  id: string;
  code: string;
  date: string;
  fromWarehouseId: string;
  fromWarehouseName: string;
  toWarehouseId: string;
  toWarehouseName: string;
  items: { productId: string; productName: string; specId: string; specName: string; qty: number }[];
  status: 'pending' | 'completed' | 'cancelled';
  note: string;
  createdAt: string;
}

export interface StockAdjustment {
  id: string;
  code: string;
  date: string;
  warehouseId: string;
  warehouseName: string;
  items: { productId: string; productName: string; specId: string; specName: string; qtyBefore: number; qtyAfter: number; diff: number }[];
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface BundleOrder {
  id: string;
  code: string;
  date: string;
  warehouseId: string;
  bundleProductId: string;
  bundleProductName: string;
  qty: number;
  components: { productId: string; productName: string; specId: string; specName: string; qtyPerUnit: number; totalQty: number }[];
  type: 'assemble' | 'disassemble';
  status: 'pending' | 'completed' | 'cancelled';
  note: string;
  createdAt: string;
}

// ===== APP STATE =====
export interface AppState {
  currentUser: User | null;
  users: User[];
  warehouses: Warehouse[];
  products: Product[];
  customers: Customer[];
  quotations: Quotation[];
  salesOrders: SalesOrder[];
  salesInvoices: SalesInvoice[];
  salesReturns: SalesReturn[];
  otherIncomes: OtherIncome[];
  accountingReceipts: AccountingReceipt[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  purchaseInvoices: PurchaseInvoice[];
  purchaseReturns: PurchaseReturn[];
  otherExpenses: OtherExpense[];
  accountingPayments: AccountingPayment[];
  stockTransfers: StockTransfer[];
  stockAdjustments: StockAdjustment[];
  bundleOrders: BundleOrder[];
}
