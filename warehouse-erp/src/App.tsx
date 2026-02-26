import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import WarehousePage from './pages/WarehousePage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import { lazy, Suspense } from 'react';

const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const QuotationsPage = lazy(() => import('./pages/QuotationsPage'));
const SalesOrdersPage = lazy(() => import('./pages/SalesOrdersPage'));
const SalesInvoicesPage = lazy(() => import('./pages/SalesInvoicesPage'));
const SalesReturnsPage = lazy(() => import('./pages/SalesReturnsPage'));
const OtherIncomePage = lazy(() => import('./pages/OtherIncomePage'));
const ReceiptsPage = lazy(() => import('./pages/ReceiptsPage'));
const SuppliersPage = lazy(() => import('./pages/SuppliersPage'));
const PurchaseOrdersPage = lazy(() => import('./pages/PurchaseOrdersPage'));
const PurchaseInvoicesPage = lazy(() => import('./pages/PurchaseInvoicesPage'));
const PurchaseReturnsPage = lazy(() => import('./pages/PurchaseReturnsPage'));
const OtherExpensesPage = lazy(() => import('./pages/OtherExpensesPage'));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const StockTransfersPage = lazy(() => import('./pages/StockTransfersPage'));
const StockAdjustmentsPage = lazy(() => import('./pages/StockAdjustmentsPage'));
const BundleOrdersPage = lazy(() => import('./pages/BundleOrdersPage'));

function RequireAuth({ children }: { children: React.ReactNode }) {
  const currentUser = useStore(s => s.currentUser);
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="warehouse" element={<WarehousePage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="quotations" element={<QuotationsPage />} />
            <Route path="sales-orders" element={<SalesOrdersPage />} />
            <Route path="sales-invoices" element={<SalesInvoicesPage />} />
            <Route path="receipts" element={<ReceiptsPage />} />
            <Route path="sales-returns" element={<SalesReturnsPage />} />
            <Route path="other-income" element={<OtherIncomePage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="purchase-invoices" element={<PurchaseInvoicesPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="purchase-returns" element={<PurchaseReturnsPage />} />
            <Route path="other-expenses" element={<OtherExpensesPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="stock-transfers" element={<StockTransfersPage />} />
            <Route path="stock-adjustments" element={<StockAdjustmentsPage />} />
            <Route path="bundle-orders" element={<BundleOrdersPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
