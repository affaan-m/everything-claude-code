import { useState } from 'react';
import { useStore } from '../store';
import { genId, today, fmtCurrency, fmtDate, statusColor, statusLabel } from '../utils';
import Modal from '../components/Modal';
import type { Quotation, QuotationItem } from '../types';
import { Plus, Edit3, Trash2, Search, ShoppingCart } from 'lucide-react';

type QuotationStatus = Quotation['status'];

const STATUS_OPTIONS: QuotationStatus[] = ['draft', 'sent', 'accepted', 'rejected', 'converted'];

const emptyItem = (): QuotationItem => ({
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
  date: string;
  validUntil: string;
  taxRate: number;
  status: QuotationStatus;
  note: string;
  items: QuotationItem[];
}

const emptyForm = (): FormState => ({
  code: '',
  customerId: '',
  customerName: '',
  date: today(),
  validUntil: '',
  taxRate: 5,
  status: 'draft',
  note: '',
  items: [emptyItem()],
});

function calcItem(item: QuotationItem): QuotationItem {
  const amount = Math.round(item.qty * item.unitPrice * (1 - item.discount / 100));
  return { ...item, amount };
}

export default function QuotationsPage() {
  const { quotations, customers, products, addQuotation, updateQuotation, deleteQuotation, addSalesOrder } = useStore(s => ({
    quotations: s.quotations,
    customers: s.customers,
    products: s.products,
    addQuotation: s.addQuotation,
    updateQuotation: s.updateQuotation,
    deleteQuotation: s.deleteQuotation,
    addSalesOrder: s.addSalesOrder,
  }));

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Quotation | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());

  const filtered = quotations.filter(q => {
    const qs = search.toLowerCase();
    return (
      q.code.toLowerCase().includes(qs) ||
      q.customerName.toLowerCase().includes(qs)
    );
  });

  const nextCode = () => {
    const nums = quotations.map(q => parseInt(q.code.replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `Q${String(max + 1).padStart(5, '0')}`;
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm({ ...emptyForm(), code: nextCode() });
    setShowModal(true);
  };

  const openEdit = (q: Quotation) => {
    setEditTarget(q);
    setForm({
      code: q.code,
      customerId: q.customerId,
      customerName: q.customerName,
      date: q.date,
      validUntil: q.validUntil,
      taxRate: q.tax > 0 ? Math.round((q.tax / q.subtotal) * 100) : 5,
      status: q.status,
      note: q.note,
      items: q.items,
    });
    setShowModal(true);
  };

  const calcTotals = (items: QuotationItem[], taxRate: number) => {
    const subtotal = items.reduce((s, i) => s + i.amount, 0);
    const tax = Math.round(subtotal * taxRate / 100);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleSave = () => {
    if (!form.customerId || !form.code) return;
    const { subtotal, tax, total } = calcTotals(form.items, form.taxRate);
    if (editTarget) {
      updateQuotation(editTarget.id, { ...form, subtotal, tax, total });
    } else {
      addQuotation({
        ...form,
        id: genId(),
        subtotal,
        tax,
        total,
        createdAt: today(),
      });
    }
    setShowModal(false);
  };

  const handleConvert = (q: Quotation) => {
    if (!confirm('確定要將此報價單轉為訂單？')) return;
    const salesOrders = useStore.getState().salesOrders;
    const nums = salesOrders.map(o => parseInt(o.code.replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    addSalesOrder({
      id: genId(),
      code: `SO${String(max + 1).padStart(5, '0')}`,
      customerId: q.customerId,
      customerName: q.customerName,
      quotationId: q.id,
      date: today(),
      deliveryDate: '',
      items: q.items.map(i => ({ ...i, id: genId() })),
      subtotal: q.subtotal,
      tax: q.tax,
      total: q.total,
      status: 'pending',
      note: q.note,
      warehouseId: '',
      createdAt: today(),
    });
    updateQuotation(q.id, { status: 'converted' });
  };

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除此報價單？')) deleteQuotation(id);
  };

  // Item management
  const setItem = (idx: number, field: keyof QuotationItem, value: string | number) => {
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
    setForm(f => ({ ...f, customerId: id, customerName: c?.name || '' }));
  };

  const { subtotal, tax, total } = calcTotals(form.items, form.taxRate);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="section-title mb-0">報價單管理</h1>
        <button className="btn-primary flex items-center gap-2" onClick={openAdd}>
          <Plus size={16} /> 新增報價單
        </button>
      </div>

      <div className="card">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input-field pl-9"
            placeholder="搜尋報價單號、客戶名稱..."
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
                <th>單號</th>
                <th>客戶</th>
                <th>日期</th>
                <th>有效期限</th>
                <th>金額</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center text-gray-400 py-8">尚無報價單</td></tr>
              )}
              {filtered.map(q => (
                <tr key={q.id}>
                  <td className="font-mono text-xs font-semibold text-blue-600">{q.code}</td>
                  <td className="font-medium">{q.customerName}</td>
                  <td>{fmtDate(q.date)}</td>
                  <td>{fmtDate(q.validUntil)}</td>
                  <td className="text-right font-semibold">{fmtCurrency(q.total)}</td>
                  <td><span className={statusColor(q.status)}>{statusLabel(q.status)}</span></td>
                  <td>
                    <div className="flex items-center gap-1">
                      {q.status === 'accepted' && (
                        <button className="btn-success py-1 px-2 flex items-center gap-1 text-xs" onClick={() => handleConvert(q)}>
                          <ShoppingCart size={12} /> 轉為訂單
                        </button>
                      )}
                      <button className="btn-secondary py-1 px-2" onClick={() => openEdit(q)}><Edit3 size={13} /></button>
                      <button className="btn-danger py-1 px-2" onClick={() => handleDelete(q.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title={editTarget ? '編輯報價單' : '新增報價單'} onClose={() => setShowModal(false)} size="xl">
          <div className="space-y-4">
            {/* Header fields */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="form-label">單號 *</label>
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
                <label className="form-label">狀態</label>
                <select className="select-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as QuotationStatus }))}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">報價日期</label>
                <input className="input-field" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">有效期限</label>
                <input className="input-field" type="date" value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">稅率 (%)</label>
                <input className="input-field" type="number" min={0} max={100} value={form.taxRate} onChange={e => setForm(f => ({ ...f, taxRate: Number(e.target.value) }))} />
              </div>
            </div>

            {/* Items table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="form-label mb-0">品項明細</label>
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
                      <th>數量</th>
                      <th>單價</th>
                      <th>折扣%</th>
                      <th>小計</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.map((item, idx) => {
                      const prod = products.find(p => p.id === item.productId);
                      return (
                        <tr key={item.id}>
                          <td>
                            <select className="select-field" value={item.productId} onChange={e => setItem(idx, 'productId', e.target.value)}>
                              <option value="">請選擇</option>
                              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          </td>
                          <td>
                            <select className="select-field" value={item.specId} onChange={e => setItem(idx, 'specId', e.target.value)} disabled={!prod}>
                              <option value="">請選擇</option>
                              {prod?.specs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          </td>
                          <td><input className="input-field w-20" type="number" min={1} value={item.qty} onChange={e => setItem(idx, 'qty', Number(e.target.value))} /></td>
                          <td><input className="input-field w-28" type="number" min={0} value={item.unitPrice} onChange={e => setItem(idx, 'unitPrice', Number(e.target.value))} /></td>
                          <td><input className="input-field w-20" type="number" min={0} max={100} value={item.discount} onChange={e => setItem(idx, 'discount', Number(e.target.value))} /></td>
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

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-56 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">小計</span><span>{fmtCurrency(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">稅額 ({form.taxRate}%)</span><span>{fmtCurrency(tax)}</span></div>
                <div className="flex justify-between font-bold border-t border-gray-200 pt-1 mt-1"><span>總計</span><span className="text-blue-600">{fmtCurrency(total)}</span></div>
              </div>
            </div>

            <div>
              <label className="form-label">備註</label>
              <textarea className="input-field" rows={2} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
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
