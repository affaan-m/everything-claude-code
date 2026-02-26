import { useStore } from '../store';
import { fmtCurrency, fmtNumber } from '../utils';
import { Warehouse, Package, Users, Truck, TrendingUp, TrendingDown, AlertTriangle, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function DashboardPage() {
  const { warehouses, products, customers, suppliers, salesInvoices, purchaseInvoices, salesOrders } = useStore(s => ({
    warehouses: s.warehouses,
    products: s.products,
    customers: s.customers,
    suppliers: s.suppliers,
    salesInvoices: s.salesInvoices,
    purchaseInvoices: s.purchaseInvoices,
    salesOrders: s.salesOrders,
  }));

  const totalSales = salesInvoices.reduce((a, i) => a + i.total, 0);
  const totalPurchase = purchaseInvoices.reduce((a, i) => a + i.total, 0);
  const unpaidInvoices = salesInvoices.filter(i => i.status !== 'paid').length;
  const lowStockCount = products.reduce((cnt, p) =>
    cnt + p.specs.filter(s => s.quantity <= s.safetyStock).length, 0
  );

  const salesData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const m = `${d.getFullYear()}/${d.getMonth() + 1}`;
    const sales = salesInvoices.filter(inv => inv.date.startsWith(d.toISOString().slice(0, 7))).reduce((a, b) => a + b.total, 0);
    return { month: m, 銷售: sales };
  });

  const pendingOrders = salesOrders.filter(o => o.status === 'pending').length;

  const stats = [
    { label: '倉庫數量', value: fmtNumber(warehouses.length), icon: <Warehouse size={22} className="text-blue-500" />, color: 'bg-blue-50' },
    { label: '商品品項', value: fmtNumber(products.length), icon: <Package size={22} className="text-purple-500" />, color: 'bg-purple-50' },
    { label: '客戶數量', value: fmtNumber(customers.length), icon: <Users size={22} className="text-green-500" />, color: 'bg-green-50' },
    { label: '廠商數量', value: fmtNumber(suppliers.length), icon: <Truck size={22} className="text-orange-500" />, color: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">儀表板</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><TrendingUp size={16} className="text-green-500" />總銷售額</div>
          <p className="text-xl font-bold text-gray-800">{fmtCurrency(totalSales)}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><TrendingDown size={16} className="text-red-500" />總採購額</div>
          <p className="text-xl font-bold text-gray-800">{fmtCurrency(totalPurchase)}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><AlertTriangle size={16} className="text-yellow-500" />未收款發票</div>
          <p className="text-xl font-bold text-gray-800">{unpaidInvoices} 張</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><AlertTriangle size={16} className="text-red-500" />低庫存規格</div>
          <p className="text-xl font-bold text-red-500">{lowStockCount} 項</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-blue-500" />
            <span className="font-semibold text-gray-700">近6個月銷售</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={salesData}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => fmtCurrency(v)} />
              <Bar dataKey="銷售" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-green-500" />
            <span className="font-semibold text-gray-700">銷售趨勢</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={salesData}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => fmtCurrency(v)} />
              <Line type="monotone" dataKey="銷售" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts */}
      {(lowStockCount > 0 || pendingOrders > 0) && (
        <div className="card border-l-4 border-l-yellow-400">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-yellow-500" /> 待處理事項
          </h3>
          <ul className="space-y-2">
            {lowStockCount > 0 && (
              <li className="flex items-center gap-2 text-sm text-red-600">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                {lowStockCount} 個商品規格庫存低於安全存量，請儘快補貨
              </li>
            )}
            {pendingOrders > 0 && (
              <li className="flex items-center gap-2 text-sm text-yellow-600">
                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                {pendingOrders} 筆訂單待確認
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
