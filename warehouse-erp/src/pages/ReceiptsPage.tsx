import { useState } from 'react';
import { useStore } from '../store';
import { genId, today, fmtCurrency, fmtDate, paymentMethodLabel } from '../utils';
import Modal from '../components/Modal';
import type { AccountingReceipt } from '../types';
import { Plus, Edit3, Trash2, Search } from 'lucide-react';

const PAYMENT_METHODS: AccountingReceipt['method'][] = ['cash', 'transfer', 'check', 'other'];

interface FormState {
  code: string;
  customerId: string;
  customerName: string;
  invoiceId: string | null;
  date: string;
  amount: number;
  method: AccountingReceipt['method'];
  note: string;
}

const emptyForm = (): FormState => ({
  code: '',
  customerId: '',
  customerName: '',
  invoiceId: null,
  date: today(),
  amount: 0,
  method: 'transfer',
  note: '',
});

export default function ReceiptsPage() {
  const {
    accountingReceipts, customers, salesInvoices,
    addAccountingReceipt, updateAccountingReceipt, deleteAccountingReceipt,
  } = useStore(s => ({
    accountingReceipts: s.accountingReceipts,
    customers: s.customers,
    salesInvoices: s.salesInvoices,
    addAccountingReceipt: s.addAccountingReceipt,
    updateAccountingReceipt: s.updateAccountingReceipt,
    deleteAccountingReceipt: s.deleteAccountingReceipt,
  }));

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<AccountingReceipt | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [filterMethod, setFilterMethod] = useState('');

  const filtered = accountingReceipts.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = r.code.toLowerCase().includes(q) || r.customerName.toLowerCase().includes(q);
    const matchMethod = !filterMethod || r.method === filterMethod;
    return matchSearch && matchMethod;
  });

  const totalAmount = filtered.reduce((s, r) => s + r.amount, 0);

  const nextCode = () => {
    const nums = accountingReceipts.map(r => parseInt(r.code.replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `REC${String(max + 1).padStart(5, '0')}`;
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm({ ...emptyForm(), code: nextCode() });
    setShowModal(true);
  };

  const openEdit = (r: AccountingReceipt) => {
    setEditTarget(r);
    setForm({
      code: r.code,
      customerId: r.customerId,
      customerName: r.customerName,
      invoiceId: r.invoiceId,
      date: r.date,
      amount: r.amount,
      method: r.method,
      note: r.note,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.customerId || !form.code || form.amount <= 0) return;
    if (editTarget) {
      updateAccountingReceipt(editTarget.id, form);
    } else {
      addAccountingReceipt({
        ...form,
        id: genId(),
        createdAt: today(),
      });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除此收款記錄？')) deleteAccountingReceipt(id);
  };

  const setCustomer = (id: string) => {
    const c = customers.find(c => c.id === id);
    setForm(f => ({ ...f, customerId: id, customerName: c?.name || '', invoiceId: null }));
  };

  const set = (k: keyof FormState, v: string | number | null) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="section-title mb-0">收款記錄</h1>
        <button className="btn-primary flex items-center gap-2" onClick={openAdd}>
          <Plus size={16} /> 新增收款
        </button>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input-field pl-9"
              placeholder="搜尋單號、客戶名稱..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="w-40">
            <select className="select-field" value={filterMethod} onChange={e => setFilterMethod(e.target.value)}>
              <option value="">全部方式</option>
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{paymentMethodLabel(m)}</option>)}
            </select>
          </div>
          {filtered.length > 0 && (
            <div className="ml-auto text-sm text-gray-500">
              篩選合計：<span className="font-semibold text-blue-600">{fmtCurrency(totalAmount)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="card p-0">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>收款單號</th>
                <th>客戶</th>
                <th>收款日期</th>
                <th>關聯發票</th>
                <th>收款金額</th>
                <th>收款方式</th>
                <th>備註</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center text-gray-400 py-8">尚無收款記錄</td></tr>
              )}
              {filtered.map(r => {
                const invoice = r.invoiceId ? salesInvoices.find(i => i.id === r.invoiceId) : null;
                return (
                  <tr key={r.id}>
                    <td className="font-mono text-xs font-semibold text-blue-600">{r.code}</td>
                    <td className="font-medium">{r.customerName}</td>
                    <td>{fmtDate(r.date)}</td>
                    <td className="font-mono text-xs text-gray-500">{invoice?.code || '-'}</td>
                    <td className="text-right font-semibold text-green-600">{fmtCurrency(r.amount)}</td>
                    <td>
                      <span className="badge badge-blue">{paymentMethodLabel(r.method)}</span>
                    </td>
                    <td className="text-gray-500 text-xs max-w-[150px] truncate">{r.note || '-'}</td>
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
            {filtered.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={4} className="px-4 py-3 text-xs font-semibold text-gray-500 text-right">合計</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">{fmtCurrency(totalAmount)}</td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title={editTarget ? '編輯收款記錄' : '新增收款記錄'} onClose={() => setShowModal(false)} size="md">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">收款單號 *</label>
                <input className="input-field" value={form.code} onChange={e => set('code', e.target.value)} />
              </div>
              <div>
                <label className="form-label">收款日期</label>
                <input className="input-field" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="form-label">客戶 *</label>
                <select className="select-field" value={form.customerId} onChange={e => setCustomer(e.target.value)}>
                  <option value="">請選擇客戶</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="form-label">關聯發票</label>
                <select
                  className="select-field"
                  value={form.invoiceId || ''}
                  onChange={e => set('invoiceId', e.target.value || null)}
                >
                  <option value="">無</option>
                  {salesInvoices
                    .filter(i => !form.customerId || i.customerId === form.customerId)
                    .map(i => (
                      <option key={i.id} value={i.id}>
                        {i.code} - {i.customerName} ({fmtCurrency(i.total - i.paidAmount)} 待收)
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="form-label">收款金額 *</label>
                <input
                  className="input-field"
                  type="number"
                  min={0}
                  value={form.amount}
                  onChange={e => set('amount', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">收款方式</label>
                <select
                  className="select-field"
                  value={form.method}
                  onChange={e => set('method', e.target.value as AccountingReceipt['method'])}
                >
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{paymentMethodLabel(m)}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="form-label">備註</label>
              <textarea className="input-field" rows={2} value={form.note} onChange={e => set('note', e.target.value)} />
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
