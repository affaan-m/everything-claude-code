import { useState } from 'react';
import { useStore } from '../store';
import { genId, today, fmtCurrency, fmtDate, statusColor, statusLabel } from '../utils';
import Modal from '../components/Modal';
import type { PurchaseInvoice, PurchaseOrderItem } from '../types';
import { Plus, Edit3, Trash2, Search, X } from 'lucide-react';

const STATUSES: PurchaseInvoice['status'][] = ['unpaid', 'partial', 'paid', 'overdue'];

const emptyItem = (): PurchaseOrderItem => ({
  id: genId(),
  productId: '',
  productName: '',
  specId: '',
  specName: '',
  qty: 1,
  unitCost: 0,
  amount: 0,
});

type FormType = Omit<PurchaseInvoice, 'id' | 'createdAt' | 'subtotal' | 'total'>;

const emptyForm = (): FormType => ({
  code: '',
  supplierId: '',
  supplierName: '',
  orderId: null,
  date: today(),
  dueDate: '',
  items: [emptyItem()],
  tax: 5,
  paidAmount: 0,
  status: 'unpaid',
  warehouseId: '',
  note: '',
});

export default function PurchaseInvoicesPage() {
  const { purchaseInvoices, addPurchaseInvoice, updatePurchaseInvoice, deletePurchaseInvoice,
    suppliers, products, warehouses, purchaseOrders } = useStore(s => ({
    purchaseInvoices: s.purchaseInvoices,
    addPurchaseInvoice: s.addPurchaseInvoice,
    updatePurchaseInvoice: s.updatePurchaseInvoice,
    deletePurchaseInvoice: s.deletePurchaseInvoice,
    suppliers: s.suppliers,
    products: s.products,
    warehouses: s.warehouses,
    purchaseOrders: s.purchaseOrders,
  }));

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<PurchaseInvoice | null>(null);
  const [form, setForm] = useState<FormType>(emptyForm());

  const filtered = purchaseInvoices.filter(inv => {
    const q = search.toLowerCase();
    return inv.code.toLowerCase().includes(q) || inv.supplierName.toLowerCase().includes(q);
  });

  const nextCode = () => {
    const nums = purchaseInvoices.map(i => parseInt(i.code.replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `PI${String(max + 1).padStart(5, '0')}`;
  };

  const calcTotals = (items: PurchaseOrderItem[], taxPct: number) => {
    const subtotal = items.reduce((s, i) => s + i.amount, 0);
    const total = subtotal * (1 + taxPct / 100);
    return { subtotal, total };
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm({ ...emptyForm(), code: nextCode() });
    setShowModal(true);
  };

  const openEdit = (inv: PurchaseInvoice) => {
    setEditTarget(inv);
    setForm({
      code: inv.code, supplierId: inv.supplierId, supplierName: inv.supplierName,
      orderId: inv.orderId, date: inv.date, dueDate: inv.dueDate,
      items: inv.items, tax: inv.tax, paidAmount: inv.paidAmount,
      status: inv.status, warehouseId: inv.warehouseId, note: inv.note,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.code.trim() || !form.supplierId) return;
    const { subtotal, total } = calcTotals(form.items, form.tax);
    if (editTarget) {
      updatePurchaseInvoice(editTarget.id, { ...form, subtotal, total });
    } else {
      addPurchaseInvoice({ ...form, subtotal, total, id: genId(), createdAt: today() });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除此進貨單？')) deletePurchaseInvoice(id);
  };

  const setSupplier = (id: string) => {
    const s = suppliers.find(s => s.id === id);
    setForm(f => ({ ...f, supplierId: id, supplierName: s?.name ?? '' }));
  };

  const updateItem = (idx: number, key: keyof PurchaseOrderItem, val: string | number) => {
    setForm(f => {
      const items = f.items.map((item, i) => {
        if (i !== idx) return item;
        const updated = { ...item, [key]: val };
        if (key === 'productId') {
          const p = products.find(p => p.id === val);
          updated.productName = p?.name ?? '';
          updated.specId = '';
          updated.specName = '';
        }
        if (key === 'specId') {
          const p = products.find(p => p.id === item.productId);
          const sp = p?.specs.find(s => s.id === val);
          updated.specName = sp?.name ?? '';
          if (sp) updated.unitCost = sp.cost;
        }
        if (key === 'qty' || key === 'unitCost') {
          updated.amount = updated.qty * updated.unitCost;
        }
        return updated;
      });
      return { ...f, items };
    });
  };

  const addItemRow = () => setForm(f => ({ ...f, items: [...f.items, emptyItem()] }));
  const removeItemRow = (idx: number) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const { subtotal, total } = calcTotals(form.items, form.tax);

  const unpaidBalance = (inv: PurchaseInvoice) => inv.total - inv.paidAmount;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="section-title mb-0">進貨單管理</h1>
        <button className="btn-primary flex items-center gap-2" onClick={openAdd}>
          <Plus size={16} /> 新增進貨單
        </button>
      </div>

      <div className="card">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input-field pl-9" placeholder="搜尋單號、供應商..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card p-0">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>單號</th>
                <th>供應商</th>
                <th>進貨日期</th>
                <th>到期日</th>
                <th>採購單</th>
                <th>總金額</th>
                <th>已付</th>
                <th>未付</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="text-center text-gray-400 py-8">尚無進貨單</td></tr>
              )}
              {filtered.map(inv => (
                <tr key={inv.id}>
                  <td className="font-mono text-xs font-semibold text-blue-600">{inv.code}</td>
                  <td className="font-medium">{inv.supplierName}</td>
                  <td className="text-xs">{fmtDate(inv.date)}</td>
                  <td className="text-xs">{fmtDate(inv.dueDate)}</td>
                  <td className="text-xs font-mono text-gray-500">
                    {inv.orderId ? purchaseOrders.find(o => o.id === inv.orderId)?.code ?? '-' : '-'}
                  </td>
                  <td className="font-medium">{fmtCurrency(inv.total)}</td>
                  <td className="text-green-600">{fmtCurrency(inv.paidAmount)}</td>
                  <td className={unpaidBalance(inv) > 0 ? 'text-red-600 font-medium' : 'text-gray-400'}>
                    {fmtCurrency(unpaidBalance(inv))}
                  </td>
                  <td><span className={statusColor(inv.status)}>{statusLabel(inv.status)}</span></td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button className="btn-secondary py-1 px-2" onClick={() => openEdit(inv)}><Edit3 size={13} /></button>
                      <button className="btn-danger py-1 px-2" onClick={() => handleDelete(inv.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title={editTarget ? '編輯進貨單' : '新增進貨單'} onClose={() => setShowModal(false)} size="xl">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="form-label">單號 *</label>
                <input className="input-field" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">供應商 *</label>
                <select className="select-field" value={form.supplierId} onChange={e => setSupplier(e.target.value)}>
                  <option value="">-- 選擇供應商 --</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">關聯採購單</label>
                <select className="select-field" value={form.orderId ?? ''} onChange={e => setForm(f => ({ ...f, orderId: e.target.value || null }))}>
                  <option value="">-- 選擇採購單 --</option>
                  {purchaseOrders.map(o => <option key={o.id} value={o.id}>{o.code}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">進貨日期</label>
                <input className="input-field" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">到期日</label>
                <input className="input-field" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">狀態</label>
                <select className="select-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as PurchaseInvoice['status'] }))}>
                  {STATUSES.map(st => <option key={st} value={st}>{statusLabel(st)}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">倉庫</label>
                <select className="select-field" value={form.warehouseId} onChange={e => setForm(f => ({ ...f, warehouseId: e.target.value }))}>
                  <option value="">-- 選擇倉庫 --</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">已付金額</label>
                <input className="input-field" type="number" min={0} value={form.paidAmount} onChange={e => setForm(f => ({ ...f, paidAmount: Number(e.target.value) }))} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="form-label mb-0">進貨項目</label>
                <button className="btn-secondary py-1 px-2 text-xs flex items-center gap-1" onClick={addItemRow}>
                  <Plus size={12} /> 新增行
                </button>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr><th>產品</th><th>規格</th><th>數量</th><th>單價</th><th>小計</th><th></th></tr>
                  </thead>
                  <tbody>
                    {form.items.map((item, idx) => {
                      const prod = products.find(p => p.id === item.productId);
                      return (
                        <tr key={item.id}>
                          <td>
                            <select className="select-field text-xs py-1" value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)}>
                              <option value="">-- 選擇 --</option>
                              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          </td>
                          <td>
                            <select className="select-field text-xs py-1" value={item.specId} onChange={e => updateItem(idx, 'specId', e.target.value)} disabled={!prod}>
                              <option value="">-- 規格 --</option>
                              {prod?.specs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          </td>
                          <td><input className="input-field text-xs py-1 w-20" type="number" min={1} value={item.qty} onChange={e => updateItem(idx, 'qty', Number(e.target.value))} /></td>
                          <td><input className="input-field text-xs py-1 w-24" type="number" min={0} value={item.unitCost} onChange={e => updateItem(idx, 'unitCost', Number(e.target.value))} /></td>
                          <td className="font-medium text-right">{fmtCurrency(item.amount)}</td>
                          <td><button className="text-red-400 hover:text-red-600" onClick={() => removeItemRow(idx)}><X size={14} /></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">備註</label>
                <textarea className="input-field" rows={2} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="form-label mb-0 w-16">稅率 %</label>
                  <input className="input-field w-24" type="number" min={0} max={100} value={form.tax} onChange={e => setForm(f => ({ ...f, tax: Number(e.target.value) }))} />
                </div>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">小計</span><span>{fmtCurrency(subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">稅額 ({form.tax}%)</span><span>{fmtCurrency(subtotal * form.tax / 100)}</span></div>
                  <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-1 mt-1"><span>總計</span><span className="text-blue-600">{fmtCurrency(total)}</span></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
            <button className="btn-secondary" onClick={() => setShowModal(false)}>取消</button>
            <button className="btn-primary" onClick={handleSave}>儲存</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
