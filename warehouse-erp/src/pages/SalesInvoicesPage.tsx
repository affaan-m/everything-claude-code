import { useState } from 'react';
import { useStore } from '../store';
import { genId, today, fmtCurrency, fmtDate, statusColor, statusLabel } from '../utils';
import Modal from '../components/Modal';
import type { SalesInvoice, SalesOrderItem, AccountingReceipt } from '../types';
import { Plus, Edit3, Trash2, Search, DollarSign } from 'lucide-react';

type InvoiceStatus = SalesInvoice['status'];
const STATUS_OPTIONS: InvoiceStatus[] = ['unpaid', 'partial', 'paid', 'overdue'];

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
  orderId: string | null;
  date: string;
  dueDate: string;
  taxRate: number;
  status: InvoiceStatus;
  note: string;
  items: SalesOrderItem[];
}

interface ReceiptFormState {
  amount: number;
  method: AccountingReceipt['method'];
  note: string;
}

const emptyForm = (): FormState => ({
  code: '',
  customerId: '',
  customerName: '',
  orderId: null,
  date: today(),
  dueDate: '',
  taxRate: 5,
  status: 'unpaid',
  note: '',
  items: [emptyItem()],
});

function calcItem(item: SalesOrderItem): SalesOrderItem {
  const amount = Math.round(item.qty * item.unitPrice * (1 - item.discount / 100));
  return { ...item, amount };
}

export default function SalesInvoicesPage() {
  const {
    salesInvoices, customers, salesOrders, products,
    addSalesInvoice, updateSalesInvoice, deleteSalesInvoice, addAccountingReceipt,
  } = useStore(s => ({
    salesInvoices: s.salesInvoices,
    customers: s.customers,
    salesOrders: s.salesOrders,
    products: s.products,
    addSalesInvoice: s.addSalesInvoice,
    updateSalesInvoice: s.updateSalesInvoice,
    deleteSalesInvoice: s.deleteSalesInvoice,
    addAccountingReceipt: s.addAccountingReceipt,
  }));

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<SalesInvoice | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptTarget, setReceiptTarget] = useState<SalesInvoice | null>(null);
  const [receiptForm, setReceiptForm] = useState<ReceiptFormState>({ amount: 0, method: 'transfer', note: '' });

  const filtered = salesInvoices.filter(inv => {
    const q = search.toLowerCase();
    return inv.code.toLowerCase().includes(q) || inv.customerName.toLowerCase().includes(q);
  });

  const nextCode = () => {
    const nums = salesInvoices.map(i => parseInt(i.code.replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `INV${String(max + 1).padStart(5, '0')}`;
  };

  const nextReceiptCode = () => {
    const receipts = useStore.getState().accountingReceipts;
    const nums = receipts.map(r => parseInt(r.code.replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `REC${String(max + 1).padStart(5, '0')}`;
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm({ ...emptyForm(), code: nextCode() });
    setShowModal(true);
  };

  const openEdit = (inv: SalesInvoice) => {
    setEditTarget(inv);
    const subtotal = inv.items.reduce((s, i) => s + i.amount, 0);
    const taxRate = subtotal > 0 ? Math.round((inv.tax / subtotal) * 100) : 5;
    setForm({
      code: inv.code,
      customerId: inv.customerId,
      customerName: inv.customerName,
      orderId: inv.orderId,
      date: inv.date,
      dueDate: inv.dueDate,
      taxRate,
      status: inv.status,
      note: inv.note,
      items: inv.items,
    });
    setShowModal(true);
  };

  const openReceipt = (inv: SalesInvoice) => {
    setReceiptTarget(inv);
    const remaining = inv.total - inv.paidAmount;
    setReceiptForm({ amount: remaining > 0 ? remaining : inv.total, method: 'transfer', note: '' });
    setShowReceiptModal(true);
  };

  const calcTotals = (items: SalesOrderItem[], taxRate: number) => {
    const subtotal = items.reduce((s, i) => s + i.amount, 0);
    const tax = Math.round(subtotal * taxRate / 100);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleSave = () => {
    if (!form.customerId || !form.code) return;
    const { subtotal, tax, total } = calcTotals(form.items, form.taxRate);
    if (editTarget) {
      updateSalesInvoice(editTarget.id, { ...form, subtotal, tax, total });
    } else {
      addSalesInvoice({
        ...form,
        id: genId(),
        subtotal,
        tax,
        total,
        paidAmount: 0,
        createdAt: today(),
      });
    }
    setShowModal(false);
  };

  const handleSaveReceipt = () => {
    if (!receiptTarget || receiptForm.amount <= 0) return;
    addAccountingReceipt({
      id: genId(),
      code: nextReceiptCode(),
      customerId: receiptTarget.customerId,
      customerName: receiptTarget.customerName,
      invoiceId: receiptTarget.id,
      date: today(),
      amount: receiptForm.amount,
      method: receiptForm.method,
      note: receiptForm.note,
      createdAt: today(),
    });
    const newPaid = receiptTarget.paidAmount + receiptForm.amount;
    const newStatus: InvoiceStatus = newPaid >= receiptTarget.total ? 'paid' : 'partial';
    updateSalesInvoice(receiptTarget.id, { paidAmount: newPaid, status: newStatus });
    setShowReceiptModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除此銷貨單？')) deleteSalesInvoice(id);
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
    setForm(f => ({ ...f, customerId: id, customerName: c?.name || '' }));
  };

  const { subtotal, tax, total } = calcTotals(form.items, form.taxRate);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="section-title mb-0">銷貨單管理</h1>
        <button className="btn-primary flex items-center gap-2" onClick={openAdd}>
          <Plus size={16} /> 新增銷貨單
        </button>
      </div>

      <div className="card">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input-field pl-9"
            placeholder="搜尋單號、客戶名稱..."
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
                <th>到期日</th>
                <th>總金額</th>
                <th>已收金額</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center text-gray-400 py-8">尚無銷貨單</td></tr>
              )}
              {filtered.map(inv => (
                <tr key={inv.id}>
                  <td className="font-mono text-xs font-semibold text-blue-600">{inv.code}</td>
                  <td className="font-medium">{inv.customerName}</td>
                  <td>{fmtDate(inv.date)}</td>
                  <td>{fmtDate(inv.dueDate)}</td>
                  <td className="text-right font-semibold">{fmtCurrency(inv.total)}</td>
                  <td className="text-right text-green-600">{fmtCurrency(inv.paidAmount)}</td>
                  <td><span className={statusColor(inv.status)}>{statusLabel(inv.status)}</span></td>
                  <td>
                    <div className="flex items-center gap-1">
                      {inv.status !== 'paid' && (
                        <button
                          className="btn-success py-1 px-2 flex items-center gap-1 text-xs"
                          onClick={() => openReceipt(inv)}
                        >
                          <DollarSign size={12} /> 收款
                        </button>
                      )}
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

      {/* Invoice Modal */}
      {showModal && (
        <Modal title={editTarget ? '編輯銷貨單' : '新增銷貨單'} onClose={() => setShowModal(false)} size="xl">
          <div className="space-y-4">
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
                <label className="form-label">關聯訂單</label>
                <select className="select-field" value={form.orderId || ''} onChange={e => setForm(f => ({ ...f, orderId: e.target.value || null }))}>
                  <option value="">無</option>
                  {salesOrders.filter(o => o.customerId === form.customerId).map(o => (
                    <option key={o.id} value={o.id}>{o.code}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">開單日期</label>
                <input className="input-field" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">到期日</label>
                <input className="input-field" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">狀態</label>
                <select className="select-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as InvoiceStatus }))}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">稅率 (%)</label>
                <input className="input-field" type="number" min={0} max={100} value={form.taxRate} onChange={e => setForm(f => ({ ...f, taxRate: Number(e.target.value) }))} />
              </div>
            </div>

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

      {/* Receipt Modal */}
      {showReceiptModal && receiptTarget && (
        <Modal title="登記收款" onClose={() => setShowReceiptModal(false)} size="sm">
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">客戶</span><span className="font-medium">{receiptTarget.customerName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">發票號碼</span><span className="font-mono">{receiptTarget.code}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">總金額</span><span className="font-semibold">{fmtCurrency(receiptTarget.total)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">已收金額</span><span className="text-green-600">{fmtCurrency(receiptTarget.paidAmount)}</span></div>
              <div className="flex justify-between border-t border-gray-200 pt-1"><span className="text-gray-500">待收金額</span><span className="font-bold text-red-600">{fmtCurrency(receiptTarget.total - receiptTarget.paidAmount)}</span></div>
            </div>
            <div>
              <label className="form-label">收款金額 *</label>
              <input
                className="input-field"
                type="number"
                min={1}
                value={receiptForm.amount}
                onChange={e => setReceiptForm(f => ({ ...f, amount: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="form-label">收款方式</label>
              <select className="select-field" value={receiptForm.method} onChange={e => setReceiptForm(f => ({ ...f, method: e.target.value as AccountingReceipt['method'] }))}>
                <option value="cash">現金</option>
                <option value="transfer">轉帳</option>
                <option value="check">支票</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div>
              <label className="form-label">備註</label>
              <textarea className="input-field" rows={2} value={receiptForm.note} onChange={e => setReceiptForm(f => ({ ...f, note: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <button className="btn-secondary" onClick={() => setShowReceiptModal(false)}>取消</button>
            <button className="btn-primary" onClick={handleSaveReceipt}>確認收款</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
