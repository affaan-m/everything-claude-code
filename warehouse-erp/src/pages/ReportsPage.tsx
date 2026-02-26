import { useState } from 'react';
import { useStore } from '../store';
import { fmtCurrency, fmtNumber, fmtDate } from '../utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, Package, DollarSign, Download, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const COLORS_PIE = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'];

type ReportTab = 'financial' | 'inventory' | 'sales';

export default function ReportsPage() {
  const [tab, setTab] = useState<ReportTab>('financial');
  const store = useStore(s => s);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">報表中心</h1>
        <button onClick={() => window.print()} className="btn-secondary flex items-center gap-1 no-print">
          <Printer size={15} />列印
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit no-print">
        {([['financial','財務報表'],['inventory','進銷存報表'],['sales','銷售報表']] as [ReportTab,string][]).map(([t, l]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'financial' && <FinancialReport store={store} />}
      {tab === 'inventory' && <InventoryReport store={store} />}
      {tab === 'sales' && <SalesReport store={store} />}
    </div>
  );
}

function FinancialReport({ store }: { store: ReturnType<typeof useStore> }) {
  const { salesInvoices, purchaseInvoices, otherIncomes, otherExpenses, accountingReceipts, accountingPayments } = store;

  const totalRevenue = salesInvoices.reduce((a, i) => a + i.total, 0);
  const totalCost = purchaseInvoices.reduce((a, i) => a + i.total, 0);
  const totalOtherIncome = otherIncomes.reduce((a, i) => a + i.amount, 0);
  const totalOtherExpense = otherExpenses.reduce((a, i) => a + i.amount, 0);
  const totalReceived = accountingReceipts.reduce((a, r) => a + r.amount, 0);
  const totalPaid = accountingPayments.reduce((a, p) => a + p.amount, 0);
  const grossProfit = totalRevenue - totalCost;
  const netProfit = grossProfit + totalOtherIncome - totalOtherExpense;

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, '0');
    const year = new Date().getFullYear();
    const prefix = `${year}-${m}`;
    const rev = salesInvoices.filter(inv => inv.date.startsWith(prefix)).reduce((a, b) => a + b.total, 0);
    const cost = purchaseInvoices.filter(inv => inv.date.startsWith(prefix)).reduce((a, b) => a + b.total, 0);
    return { month: `${i+1}月`, 收入: rev, 支出: cost, 毛利: rev - cost };
  });

  const exportXLSX = () => {
    const ws = XLSX.utils.json_to_sheet([
      { 項目: '銷售收入', 金額: totalRevenue },
      { 項目: '採購成本', 金額: totalCost },
      { 項目: '其他收入', 金額: totalOtherIncome },
      { 項目: '其他支出', 金額: totalOtherExpense },
      { 項目: '毛利', 金額: grossProfit },
      { 項目: '淨利', 金額: netProfit },
      { 項目: '已收款', 金額: totalReceived },
      { 項目: '已付款', 金額: totalPaid },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '財務報表');
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `財務報表_${new Date().toLocaleDateString('zh-TW')}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end no-print">
        <button onClick={exportXLSX} className="btn-success flex items-center gap-1"><Download size={15} />匯出Excel</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: '銷售收入', v: totalRevenue, cls: 'text-green-600', icon: <TrendingUp size={20} className="text-green-500" /> },
          { l: '採購成本', v: totalCost, cls: 'text-red-600', icon: <TrendingDown size={20} className="text-red-500" /> },
          { l: '毛利', v: grossProfit, cls: grossProfit >= 0 ? 'text-blue-600' : 'text-red-600', icon: <DollarSign size={20} className="text-blue-500" /> },
          { l: '淨利', v: netProfit, cls: netProfit >= 0 ? 'text-green-600' : 'text-red-600', icon: <BarChart3 size={20} className="text-purple-500" /> },
        ].map(s => (
          <div key={s.l} className="card">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">{s.icon}{s.l}</div>
            <p className={`text-xl font-bold ${s.cls}`}>{fmtCurrency(s.v)}</p>
          </div>
        ))}
      </div>

      {/* Monthly chart */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-4">月度收支對比</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyData}>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => fmtCurrency(v)} />
            <Legend />
            <Bar dataKey="收入" fill="#10b981" radius={[4,4,0,0]} />
            <Bar dataKey="支出" fill="#ef4444" radius={[4,4,0,0]} />
            <Bar dataKey="毛利" fill="#3b82f6" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Receivables & Payables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-3">應收帳款</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">總銷售額</span><span className="font-semibold">{fmtCurrency(totalRevenue)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">已收款</span><span className="font-semibold text-green-600">{fmtCurrency(totalReceived)}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="text-gray-700 font-medium">未收款</span><span className="font-bold text-red-500">{fmtCurrency(totalRevenue - totalReceived)}</span>
            </div>
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-3">應付帳款</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">總採購額</span><span className="font-semibold">{fmtCurrency(totalCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">已付款</span><span className="font-semibold text-green-600">{fmtCurrency(totalPaid)}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="text-gray-700 font-medium">未付款</span><span className="font-bold text-red-500">{fmtCurrency(totalCost - totalPaid)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InventoryReport({ store }: { store: ReturnType<typeof useStore> }) {
  const { products, warehouses } = store;

  const allSpecs = products.flatMap(p => p.specs.map(s => ({
    productName: p.name, category: p.category, supplier: p.supplierName,
    specName: s.name, sku: s.sku, quantity: s.quantity,
    safetyStock: s.safetyStock, cost: s.cost, value: s.quantity * s.cost,
    isLow: s.quantity <= s.safetyStock,
  })));

  const totalValue = allSpecs.reduce((a, s) => a + s.value, 0);
  const lowStockItems = allSpecs.filter(s => s.isLow);

  const categoryData = products.reduce<Record<string, number>>((acc, p) => {
    const val = p.specs.reduce((a, s) => a + s.quantity * s.cost, 0);
    acc[p.category] = (acc[p.category] || 0) + val;
    return acc;
  }, {});
  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  const exportXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(allSpecs.map(s => ({
      商品名稱: s.productName, 分類: s.category, 廠商: s.supplier,
      規格: s.specName, SKU: s.sku, 庫存: s.quantity,
      安全存量: s.safetyStock, 成本: s.cost, 庫存價值: s.value,
      狀態: s.isLow ? '低庫存' : '正常',
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '進銷存報表');
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `進銷存報表_${new Date().toLocaleDateString('zh-TW')}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end no-print">
        <button onClick={exportXLSX} className="btn-success flex items-center gap-1"><Download size={15} />匯出Excel</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card"><p className="text-xs text-gray-500 mb-1">商品品項</p><p className="text-2xl font-bold text-gray-800">{fmtNumber(products.length)}</p></div>
        <div className="card"><p className="text-xs text-gray-500 mb-1">總庫存價值</p><p className="text-2xl font-bold text-blue-600">{fmtCurrency(totalValue)}</p></div>
        <div className="card"><p className="text-xs text-gray-500 mb-1">低庫存品項</p><p className={`text-2xl font-bold ${lowStockItems.length > 0 ? 'text-red-500' : 'text-green-600'}`}>{fmtNumber(lowStockItems.length)}</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-4">分類庫存佔比</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => fmtCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-3 text-red-500">低庫存警示</h3>
          {lowStockItems.length === 0 ? (
            <p className="text-sm text-green-500">所有商品庫存正常</p>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {lowStockItems.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm p-2 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{item.productName}</p>
                    <p className="text-xs text-gray-500">{item.specName} · {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-500">{item.quantity}</p>
                    <p className="text-xs text-gray-400">安全:{item.safetyStock}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full inventory table */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-4">完整庫存明細</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>商品</th><th>分類</th><th>規格</th><th>SKU</th>
                <th>庫存</th><th>安全存量</th><th>成本</th><th>庫存價值</th><th>狀態</th>
              </tr>
            </thead>
            <tbody>
              {allSpecs.map((s, i) => (
                <tr key={i}>
                  <td className="font-medium">{s.productName}</td>
                  <td><span className="badge badge-blue">{s.category}</span></td>
                  <td>{s.specName}</td><td className="text-gray-500">{s.sku}</td>
                  <td className={`font-semibold ${s.isLow ? 'text-red-500' : ''}`}>{fmtNumber(s.quantity)}</td>
                  <td>{fmtNumber(s.safetyStock)}</td>
                  <td>{fmtCurrency(s.cost)}</td>
                  <td className="font-medium">{fmtCurrency(s.value)}</td>
                  <td>{s.isLow ? <span className="badge badge-red">低庫存</span> : <span className="badge badge-green">正常</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SalesReport({ store }: { store: ReturnType<typeof useStore> }) {
  const { salesInvoices, salesOrders, customers, products } = store;

  const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, '0');
    const prefix = `${new Date().getFullYear()}-${m}`;
    const total = salesInvoices.filter(inv => inv.date.startsWith(prefix)).reduce((a, b) => a + b.total, 0);
    return { month: `${i+1}月`, 銷售額: total };
  });

  // Top customers
  const custRevenue = customers.map(c => ({
    name: c.name,
    total: salesInvoices.filter(i => i.customerId === c.id).reduce((a, b) => a + b.total, 0)
  })).sort((a, b) => b.total - a.total).slice(0, 5);

  // Top products
  const prodRevenue = products.map(p => ({
    name: p.name,
    total: salesInvoices.flatMap(i => i.items).filter(item => item.productId === p.id).reduce((a, b) => a + b.amount, 0)
  })).sort((a, b) => b.total - a.total).slice(0, 5);

  const totalRevenue = salesInvoices.reduce((a, i) => a + i.total, 0);
  const totalOrders = salesOrders.length;
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const exportXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(salesInvoices.map(i => ({
      單號: i.code, 客戶: i.customerName, 日期: fmtDate(i.date),
      到期日: fmtDate(i.dueDate), 金額: i.total,
      已收: i.paidAmount, 狀態: i.status,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '銷售報表');
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `銷售報表_${new Date().toLocaleDateString('zh-TW')}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end no-print">
        <button onClick={exportXLSX} className="btn-success flex items-center gap-1"><Download size={15} />匯出Excel</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card"><p className="text-xs text-gray-500 mb-1">總銷售額</p><p className="text-2xl font-bold text-green-600">{fmtCurrency(totalRevenue)}</p></div>
        <div className="card"><p className="text-xs text-gray-500 mb-1">訂單數</p><p className="text-2xl font-bold text-gray-800">{fmtNumber(totalOrders)}</p></div>
        <div className="card"><p className="text-xs text-gray-500 mb-1">平均訂單金額</p><p className="text-2xl font-bold text-blue-600">{fmtCurrency(avgOrder)}</p></div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-4">月度銷售趨勢</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={monthlyRevenue}>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => fmtCurrency(v)} />
            <Line type="monotone" dataKey="銷售額" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-4">Top 5 客戶</h3>
          <div className="space-y-2">
            {custRevenue.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">{i+1}</span>
                <span className="flex-1 text-sm text-gray-700 truncate">{c.name}</span>
                <span className="text-sm font-semibold text-gray-800">{fmtCurrency(c.total)}</span>
              </div>
            ))}
            {custRevenue.length === 0 && <p className="text-sm text-gray-400">暫無資料</p>}
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-4">Top 5 商品</h3>
          <div className="space-y-2">
            {prodRevenue.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">{i+1}</span>
                <span className="flex-1 text-sm text-gray-700 truncate">{p.name}</span>
                <span className="text-sm font-semibold text-gray-800">{fmtCurrency(p.total)}</span>
              </div>
            ))}
            {prodRevenue.length === 0 && <p className="text-sm text-gray-400">暫無資料</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
