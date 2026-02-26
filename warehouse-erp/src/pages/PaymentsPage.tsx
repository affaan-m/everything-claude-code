import { useState } from 'react';
import { useStore } from '../store';
import { genId, today, fmtCurrency, fmtDate } from '../utils';
import Modal from '../components/Modal';
import type { AccountingPayment } from '../types';
import { Plus, Edit3, Trash2, Search } from 'lucide-react';

const METHODS: AccountingPayment['method'][] = ['cash', 'transfer', 'check', 'other'];
const METHOD_LABELS: Record<string, string> = {
  cash: '現金', transfer: '轉帳', check: '支票', other: '其他',
};
const METHOD_BADGE: Record<string, string> = {
  cash: 'badge-green', transfer: 'badge-blue', check: 'badge-yellow', other: 'badge-gray',
};

type FormType = Omit<AccountingPayment, 'id' | 'createdAt'>;

const emptyForm = (): FormType => ({
  code: '',
  supplierId: '',
  supplierName: '',
  invoiceId: null,
  date: today(),
  amount: 0,
  method: 'transfer',
  note: '',
});

export default function PaymentsPage() {
  const { accountingPayments, addAccountingPayment, updateAccountingPayment, deleteAccountingPayment,
    suppliers, purchaseInvoices } = useStore(s => ({
    accountingPayments: s.accountingPayments,
    addAccountingPayment: s.addAccountingPayment,
    updateAccountingPayment: s.updateAccountingPayment,
    deleteAccountingPayment: s.deleteAccountingPayment,
    suppliers: s.suppliers,
    purchaseInvoices: s.purchaseInvoices,
  }));

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<AccountingPayment | null>(null);
  const [form, setForm] = useState<FormType>(emptyForm());

  const filtered = accountingPayments.filter(p => {
    const q = search.toLowerCase();
    return p.code.toLowerCase().includes(q) || p.supplierName.toLowerCase().includes(q);
  });

  const totalPaid = filtered.reduce((s, p) => s + p.amount, 0);

  const nextCode = () => {
    const nums = accountingPayments.map(p => parseInt(p.code.replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `PAY${String(max + 1).padStart(5, '0')}`;
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm({ ...emptyForm(), code: nextCode() });
    setShowModal(true);
  };

  const openEdit = (p: AccountingPayment) => {
    setEditTarget(p);
    setForm({
      code: p.code, supplierId: p.supplierId, supplierName: p.supplierName,
      invoiceId: p.invoiceId, date: p.date, amount: p.amount, method: p.method, note: p.note,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.code.trim() || !form.supplierId || form.amount <= 0) return;
    if (editTarget) {
      updateAccountingPayment(editTarget.id, form);
    } else {
      addAccountingPayment({ ...form, id: genId(), createdAt: today() });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除此付款記錄？')) deleteAccountingPayment(id);
  };

  const setSupplier = (id: string) => {
    const s = suppliers.find(s => s.id === id);
    setForm(f => ({ ...f, supplierId: id, supplierName: s?.name ?? '', invoiceId: null }));
  };

  const set = (k: keyof FormType, v: string | number | null) => setForm(f => ({ ...f, [k]: v }));

  const supplierInvoices = purchaseInvoices.filter(i => i.supplierId === form.supplierId && i.status !== 'paid');

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="section-title mb-0">應付帳款付款</h1>
        <button className="btn-primary flex items-center gap-2" onClick={openAdd}>
          <Plus size={16} /> 新增付款
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input-field pl-9" placeholder="搜尋單號、供應商..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="bg-blue-50 rounded-lg px-4 py-2 text-sm">
            <span className="text-blue-500 mr-2">篩選結果付款總計</span>
            <span className="font-bold text-blue-700">{fmtCurrency(totalPaid)}</span>
          </div>
        </div>
      </div>

      <div className="card p-0">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>單號</th>
                <th>供應商</th>
                <th>關聯進貨單</th>
                <th>付款日期</th>
                <th>付款金額</th>
                <th>付款方式</th>
                <th>備註</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center text-gray-400 py-8">尚無付款記錄</td></tr>
              )}
              {filtered.map(p => (
                <tr key={p.id}>
                  <td className="font-mono text-xs font-semibold text-blue-600">{p.code}</td>
                  <td className="font-medium">{p.supplierName}</td>
                  <td className="text-xs font-mono text-gray-500">
                    {p.invoiceId ? purchaseInvoices.find(i => i.id === p.invoiceId)?.code ?? '-' : '-'}
                  </td>
                  <td className="text-xs">{fmtDate(p.date)}</td>
                  <td className="font-medium text-green-600">{fmtCurrency(p.amount)}</td>
                  <td><span className={METHOD_BADGE[p.method] || 'badge-gray'}>{METHOD_LABELS[p.method]}</span></td>
                  <td className="text-xs text-gray-500 max-w-[160px] truncate">{p.note || '-'}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button className="btn-secondary py-1 px-2" onClick={() => openEdit(p)}><Edit3 size={13} /></button>
                      <button className="btn-danger py-1 px-2" onClick={() => handleDelete(p.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title={editTarget ? '編輯付款' : '新增付款'} onClose={() => setShowModal(false)} size="md">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">單號 *</label>
                <input className="input-field" value={form.code} onChange={e => set('code', e.target.value)} />
              </div>
              <div>
                <label className="form-label">付款日期</label>
                <input className="input-field" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
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
              <select className="select-field" value={form.invoiceId ?? ''} onChange={e => set('invoiceId', e.target.value || null)}>
                <option value="">-- 選擇進貨單 --</option>
                {supplierInvoices.map(i => (
                  <option key={i.id} value={i.id}>{i.code} ({fmtCurrency(i.total - i.paidAmount)} 未付)</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">付款金額 *</label>
                <input className="input-field" type="number" min={0} value={form.amount} onChange={e => set('amount', Number(e.target.value))} />
              </div>
              <div>
                <label className="form-label">付款方式</label>
                <select className="select-field" value={form.method} onChange={e => set('method', e.target.value as AccountingPayment['method'])}>
                  {METHODS.map(m => <option key={m} value={m}>{METHOD_LABELS[m]}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="form-label">備註</label>
              <textarea className="input-field" rows={2} value={form.note} onChange={e => set('note', e.target.value)} />
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
