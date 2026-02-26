import { useState } from 'react';
import { useStore } from '../store';
import { genId, today, fmtCurrency, fmtDate } from '../utils';
import Modal from '../components/Modal';
import type { Supplier } from '../types';
import { Plus, Edit3, Trash2, Search } from 'lucide-react';

const PAYMENT_TERMS = ['Net 30', 'Net 60', 'Net 90', '即期', '其他'];

const emptyForm = (): Omit<Supplier, 'id' | 'createdAt' | 'balance'> => ({
  code: '',
  name: '',
  contact: '',
  phone: '',
  email: '',
  address: '',
  taxId: '',
  paymentTerms: 'Net 30',
  note: '',
});

export default function SuppliersPage() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useStore(s => ({
    suppliers: s.suppliers,
    addSupplier: s.addSupplier,
    updateSupplier: s.updateSupplier,
    deleteSupplier: s.deleteSupplier,
  }));

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptyForm());

  const filtered = suppliers.filter(s => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.contact.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q)
    );
  });

  const nextCode = () => {
    const nums = suppliers
      .map(s => parseInt(s.code.replace(/\D/g, ''), 10))
      .filter(n => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `S${String(max + 1).padStart(3, '0')}`;
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm({ ...emptyForm(), code: nextCode() });
    setShowModal(true);
  };

  const openEdit = (s: Supplier) => {
    setEditTarget(s);
    setForm({
      code: s.code,
      name: s.name,
      contact: s.contact,
      phone: s.phone,
      email: s.email,
      address: s.address,
      taxId: s.taxId,
      paymentTerms: s.paymentTerms,
      note: s.note,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.code.trim()) return;
    if (editTarget) {
      updateSupplier(editTarget.id, form);
    } else {
      addSupplier({
        ...form,
        id: genId(),
        balance: 0,
        createdAt: today(),
      });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除此供應商？')) deleteSupplier(id);
  };

  const set = (k: keyof typeof form, v: string | number) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="section-title mb-0">供應商管理</h1>
        <button className="btn-primary flex items-center gap-2" onClick={openAdd}>
          <Plus size={16} /> 新增供應商
        </button>
      </div>

      <div className="card">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input-field pl-9"
            placeholder="搜尋供應商名稱、代碼、聯絡人..."
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
                <th>代碼</th>
                <th>名稱</th>
                <th>聯絡人</th>
                <th>電話</th>
                <th>Email</th>
                <th>地址</th>
                <th>統編</th>
                <th>付款條件</th>
                <th>餘額</th>
                <th>建立日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center text-gray-400 py-8">尚無供應商資料</td>
                </tr>
              )}
              {filtered.map(s => (
                <tr key={s.id}>
                  <td className="font-mono text-xs font-semibold text-blue-600">{s.code}</td>
                  <td className="font-medium">{s.name}</td>
                  <td>{s.contact}</td>
                  <td className="whitespace-nowrap">{s.phone}</td>
                  <td className="text-xs text-gray-500">{s.email}</td>
                  <td className="max-w-[160px] truncate text-xs text-gray-500">{s.address}</td>
                  <td className="font-mono text-xs">{s.taxId}</td>
                  <td>{s.paymentTerms}</td>
                  <td className={s.balance > 0 ? 'text-red-600 font-medium' : ''}>{fmtCurrency(s.balance)}</td>
                  <td className="text-xs text-gray-400">{fmtDate(s.createdAt)}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button className="btn-secondary py-1 px-2" onClick={() => openEdit(s)}>
                        <Edit3 size={13} />
                      </button>
                      <button className="btn-danger py-1 px-2" onClick={() => handleDelete(s.id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal
          title={editTarget ? '編輯供應商' : '新增供應商'}
          onClose={() => setShowModal(false)}
          size="lg"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">供應商代碼 *</label>
              <input className="input-field" value={form.code} onChange={e => set('code', e.target.value)} />
            </div>
            <div>
              <label className="form-label">供應商名稱 *</label>
              <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className="form-label">聯絡人</label>
              <input className="input-field" value={form.contact} onChange={e => set('contact', e.target.value)} />
            </div>
            <div>
              <label className="form-label">電話</label>
              <input className="input-field" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input className="input-field" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="form-label">統一編號</label>
              <input className="input-field" value={form.taxId} onChange={e => set('taxId', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="form-label">地址</label>
              <input className="input-field" value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
            <div>
              <label className="form-label">付款條件</label>
              <select className="select-field" value={form.paymentTerms} onChange={e => set('paymentTerms', e.target.value)}>
                {PAYMENT_TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">備註</label>
              <input className="input-field" value={form.note} onChange={e => set('note', e.target.value)} />
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
