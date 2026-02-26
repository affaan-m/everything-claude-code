import { useState } from 'react';
import { useStore } from '../store';
import { genId, today, fmtCurrency, fmtDate, statusColor, statusLabel } from '../utils';
import Modal from '../components/Modal';
import type { PurchaseReturn, PurchaseOrderItem } from '../types';
import { Plus, Edit3, Trash2, Search, X } from 'lucide-react';

const STATUSES: PurchaseReturn['status'][] = ['pending', 'approved', 'rejected'];

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

type FormType = Omit<PurchaseReturn, 'id' | 'createdAt' | 'total'>;

const emptyForm = (): FormType => ({
  code: '',
  supplierId: '',
  supplierName: '',
  invoiceId: null,
  date: today(),
  items: [emptyItem()],
  reason: '',
  status: 'pending',
});

export default function PurchaseReturnsPage() {
  const { purchaseReturns, addPurchaseReturn, updatePurchaseReturn, deletePurchaseReturn,
    suppliers, products, purchaseInvoices } = useStore(s => ({
    purchaseReturns: s.purchaseReturns,
    addPurchaseReturn: s.addPurchaseReturn,
    updatePurchaseReturn: s.updatePurchaseReturn,
    deletePurchaseReturn: s.deletePurchaseReturn,
    suppliers: s.suppliers,
    products: s.products,
    purchaseInvoices: s.purchaseInvoices,
  }));

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<PurchaseReturn | null>(null);
  const [form, setForm] = useState<FormType>(emptyForm());

  const filtered = purchaseReturns.filter(r => {
    const q = search.toLowerCase();
    return r.code.toLowerCase().includes(q) || r.supplierName.toLowerCase().includes(q);
  });

  const nextCode = () => {
    const nums = purchaseReturns.map(r => parseInt(r.code.replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `PR${String(max + 1).padStart(5, '0')}`;
  };

  const calcTotal = (items: PurchaseOrderItem[]) => items.reduce((s, i) => s + i.amount, 0);

  const openAdd = () => {
    setEditTarget(null);
    setForm({ ...emptyForm(), code: nextCode() });
    setShowModal(true);
  };

  const openEdit = (r: PurchaseReturn) => {
    setEditTarget(r);
    setForm({
      code: r.code, supplierId: r.supplierId, supplierName: r.supplierName,
      invoiceId: r.invoiceId, date: r.date, items: r.items,
      reason: r.reason, status: r.status,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.code.trim() || !form.supplierId) return;
    const total = calcTotal(form.items);
    if (editTarget) {
      updatePurchaseReturn(editTarget.id, { ...form, total });
    } else {
      addPurchaseReturn({ ...form, total, id: genId(), createdAt: today() });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除此退貨單？')) deletePurchaseReturn(id);
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

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="section-title mb-0">採購退貨</h1>
        <button className="btn-primary flex items-center gap-2" onClick={openAdd}>
          <Plus size={16} /> 新增退貨單
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
                <th>日期</th>
                <th>關聯進貨單</th>
                <th>退貨原因</th>
                <th>總金額</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center text-gray-400 py-8">尚無退貨記錄</td></tr>
              )}
              {filtered.map(r => (
                <tr key={r.id}>
                  <td className="font-mono text-xs font-semibold text-blue-600">{r.code}</td>
                  <td className="font-medium">{r.supplierName}</td>
                  <td className="text-xs">{fmtDate(r.date)}</td>
                  <td className="text-xs font-mono text-gray-500">
                    {r.invoiceId ? purchaseInvoices.find(i => i.id === r.invoiceId)?.code ?? '-' : '-'}
                  </td>
                  <td className="max-w-[160px] truncate text-xs text-gray-600">{r.reason || '-'}</td>
                  <td className="font-medium">{fmtCurrency(r.total)}</td>
                  <td><span className={statusColor(r.status)}>{statusLabel(r.status)}</span></td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button className="btn-secondary py-1 px-2" onClick={() => openEdit(r)}><Edit3 size={13} /></button>
                      <button className="btn-danger py-1 px-2" onClick={() => handleDelete(r.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title={editTarget ? '編輯退貨單' : '新增退貨單'} onClose={() => setShowModal(false)} size="xl">
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
                <label className="form-label">關聯進貨單</label>
                <select className="select-field" value={form.invoiceId ?? ''} onChange={e => setForm(f => ({ ...f, invoiceId: e.target.value || null }))}>
                  <option value="">-- 選擇進貨單 --</option>
                  {purchaseInvoices.filter(i => i.supplierId === form.supplierId || !form.supplierId).map(i => (
                    <option key={i.id} value={i.id}>{i.code}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">退貨日期</label>
                <input className="input-field" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">狀態</label>
                <select className="select-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as PurchaseReturn['status'] }))}>
                  {STATUSES.map(st => <option key={st} value={st}>{statusLabel(st)}</option>)}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="form-label mb-0">退貨項目</label>
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
              <div className="flex justify-end mt-2">
                <div className="bg-gray-50 rounded-lg px-4 py-2 text-sm font-bold">
                  退貨總計：<span className="text-red-600 ml-2">{fmtCurrency(calcTotal(form.items))}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="form-label">退貨原因</label>
              <textarea className="input-field" rows={2} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="請填寫退貨原因..." />
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
