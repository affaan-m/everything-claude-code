import { useState } from 'react';
import { useStore } from '../store';
import { genId, today, fmtCurrency, fmtDate, statusColor, statusLabel } from '../utils';
import Modal from '../components/Modal';
import type { SalesReturn, SalesOrderItem } from '../types';
import { Plus, Edit3, Trash2, Search } from 'lucide-react';

type ReturnStatus = SalesReturn['status'];
const STATUS_OPTIONS: ReturnStatus[] = ['pending', 'approved', 'rejected'];

const emptyItem = (): SalesOrderItem => ({
  id: genId(),
  productId: '',
  productName: '',
  specId: '',
  specName: '',
  qty: 1,
  unitPrice: 0,
  discount: 0,
  amount: 0,
});

interface FormState {
  code: string;
  customerId: string;
  customerName: string;
  invoiceId: string | null;
  date: string;
  reason: string;
  status: ReturnStatus;
  items: SalesOrderItem[];
}

const emptyForm = (): FormState => ({
  code: '',
  customerId: '',
  customerName: '',
  invoiceId: null,
  date: today(),
  reason: '',
  status: 'pending',
  items: [emptyItem()],
});

function calcItem(item: SalesOrderItem): SalesOrderItem {
  const amount = Math.round(item.qty * item.unitPrice * (1 - item.discount / 100));
  return { ...item, amount };
}

export default function SalesReturnsPage() {
  const {
    salesReturns, customers, salesInvoices, products,
    addSalesReturn, updateSalesReturn, deleteSalesReturn,
  } = useStore(s => ({
    salesReturns: s.salesReturns,
    customers: s.customers,
    salesInvoices: s.salesInvoices,
    products: s.products,
    addSalesReturn: s.addSalesReturn,
    updateSalesReturn: s.updateSalesReturn,
    deleteSalesReturn: s.deleteSalesReturn,
  }));

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<SalesReturn | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());

  const filtered = salesReturns.filter(r => {
    const q = search.toLowerCase();
    return r.code.toLowerCase().includes(q) || r.customerName.toLowerCase().includes(q);
  });

  const nextCode = () => {
    const nums = salesReturns.map(r => parseInt(r.code.replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `SR${String(max + 1).padStart(5, '0')}`;
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm({ ...emptyForm(), code: nextCode() });
    setShowModal(true);
  };

  const openEdit = (r: SalesReturn) => {
    setEditTarget(r);
    setForm({
      code: r.code,
      customerId: r.customerId,
      customerName: r.customerName,
      invoiceId: r.invoiceId,
      date: r.date,
      reason: r.reason,
      status: r.status,
      items: r.items,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.customerId || !form.code) return;
    const total = form.items.reduce((s, i) => s + i.amount, 0);
    if (editTarget) {
      updateSalesReturn(editTarget.id, { ...form, total });
    } else {
      addSalesReturn({
        ...form,
        id: genId(),
        total,
        createdAt: today(),
      });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除此退貨單？')) deleteSalesReturn(id);
  };

  const setItemField = (idx: number, field: keyof SalesOrderItem, value: string | number) => {
    setForm(f => {
      const items = f.items.map((item, i) => {
        if (i !== idx) return item;
        let updated = { ...item, [field]: value };
        if (field === 'productId') {
          const prod = products.find(p => p.id === value);
          updated = { ...updated, productName: prod?.name || '', specId: '', specName: '', unitPrice: 0 };
        }
        if (field === 'specId') {
          const prod = products.find(p => p.id === item.productId);
          const spec = prod?.specs.find(s => s.id === value);
          updated = { ...updated, specName: spec?.name || '', unitPrice: spec?.specialPrice || 0 };
        }
        return calcItem(updated);
      });
      return { ...f, items };
    });
  };

  const addItemRow = () => setForm(f => ({ ...f, items: [...f.items, emptyItem()] }));
  const removeItemRow = (idx: number) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const setCustomer = (id: string) => {
    const c = customers.find(c => c.id === id);
    setForm(f => ({ ...f, customerId: id, customerName: c?.name || '', invoiceId: null }));
  };

  const totalAmount = form.items.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="section-title mb-0">銷售退貨</h1>
        <button className="btn-primary flex items-center gap-2" onClick={openAdd}>
          <Plus size={16} /> 新增退貨單
        </button>
      </div>

      <div className="card">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input-field pl-9"
            placeholder="搜尋退貨單號、客戶名稱..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card p-0">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>退貨單號</th>
                <th>客戶</th>
                <th>退貨日期</th>
                <th>關聯發票</th>
                <th>退貨金額</th>
                <th>退貨原因</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center text-gray-400 py-8">尚無退貨記錄</td></tr>
              )}
              {filtered.map(r => {
                const invoice = r.invoiceId ? salesInvoices.find(i => i.id === r.invoiceId) : null;
                return (
                  <tr key={r.id}>
                    <td className="font-mono text-xs font-semibold text-blue-600">{r.code}</td>
                    <td className="font-medium">{r.customerName}</td>
                    <td>{fmtDate(r.date)}</td>
                    <td className="font-mono text-xs text-gray-500">{invoice?.code || '-'}</td>
                    <td className="text-right font-semibold">{fmtCurrency(r.total)}</td>
                    <td className="max-w-[180px] truncate text-gray-600">{r.reason || '-'}</td>
                    <td><span className={statusColor(r.status)}>{statusLabel(r.status)}</span></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="btn-secondary py-1 px-2" onClick={() => openEdit(r)}><Edit3 size={13} /></button>
                        <button className="btn-danger py-1 px-2" onClick={() => handleDelete(r.id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title={editTarget ? '編輯退貨單' : '新增退貨單'} onClose={() => setShowModal(false)} size="xl">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="form-label">退貨單號 *</label>
                <input className="input-field" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">客戶 *</label>
                <select className="select-field" value={form.customerId} onChange={e => setCustomer(e.target.value)}>
                  <option value="">請選擇客戶</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">關聯發票</label>
                <select
                  className="select-field"
                  value={form.invoiceId || ''}
                  onChange={e => setForm(f => ({ ...f, invoiceId: e.target.value || null }))}
                >
                  <option value="">無</option>
                  {salesInvoices.filter(i => !form.customerId || i.customerId === form.customerId).map(i => (
                    <option key={i.id} value={i.id}>{i.code} - {i.customerName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">退貨日期</label>
                <input className="input-field" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">狀態</label>
                <select className="select-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ReturnStatus }))}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">退貨原因</label>
              <textarea className="input-field" rows={2} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="form-label mb-0">退貨品項</label>
                <button className="btn-secondary py-1 px-3 text-xs flex items-center gap-1" onClick={addItemRow}>
                  <Plus size={12} /> 新增品項
                </button>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>商品</th>
                      <th>規格</th>
                      <th>退貨數量</th>
                      <th>單價</th>
                      <th>折扣%</th>
                      <th>金額</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.map((item, idx) => {
                      const prod = products.find(p => p.id === item.productId);
                      return (
                        <tr key={item.id}>
                          <td>
                            <select className="select-field" value={item.productId} onChange={e => setItemField(idx, 'productId', e.target.value)}>
                              <option value="">請選擇</option>
                              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          </td>
                          <td>
                            <select className="select-field" value={item.specId} onChange={e => setItemField(idx, 'specId', e.target.value)} disabled={!prod}>
                              <option value="">請選擇</option>
                              {prod?.specs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          </td>
                          <td><input className="input-field w-20" type="number" min={1} value={item.qty} onChange={e => setItemField(idx, 'qty', Number(e.target.value))} /></td>
                          <td><input className="input-field w-28" type="number" min={0} value={item.unitPrice} onChange={e => setItemField(idx, 'unitPrice', Number(e.target.value))} /></td>
                          <td><input className="input-field w-20" type="number" min={0} max={100} value={item.discount} onChange={e => setItemField(idx, 'discount', Number(e.target.value))} /></td>
                          <td className="text-right font-semibold">{fmtCurrency(item.amount)}</td>
                          <td>
                            <button className="btn-danger py-1 px-2" onClick={() => removeItemRow(idx)} disabled={form.items.length <= 1}>
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="w-48 text-sm border-t border-gray-200 pt-2">
                <div className="flex justify-between font-bold">
                  <span>退貨總金額</span>
                  <span className="text-red-600">{fmtCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <button className="btn-secondary" onClick={() => setShowModal(false)}>取消</button>
            <button className="btn-primary" onClick={handleSave}>儲存</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
