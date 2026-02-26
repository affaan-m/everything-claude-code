import { useState } from 'react';
import { useStore } from '../store';
import { genId, today, fmtCurrency, fmtDate, statusColor, statusLabel } from '../utils';
import Modal from '../components/Modal';
import type { Customer } from '../types';
import { Plus, Edit3, Trash2, Search, Phone, Mail, MapPin } from 'lucide-react';

const PAYMENT_TERMS = ['Net 30', 'Net 60', '即期', '其他'];

const emptyForm = (): Omit<Customer, 'id' | 'createdAt' | 'balance'> => ({
  code: '',
  name: '',
  contact: '',
  phone: '',
  email: '',
  address: '',
  taxId: '',
  paymentTerms: 'Net 30',
  creditLimit: 0,
  note: '',
});

export default function CustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useStore(s => ({
    customers: s.customers,
    addCustomer: s.addCustomer,
    updateCustomer: s.updateCustomer,
    deleteCustomer: s.deleteCustomer,
  }));

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm());

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.contact.toLowerCase().includes(q)
    );
  });

  const nextCode = () => {
    const nums = customers
      .map(c => parseInt(c.code.replace(/\D/g, ''), 10))
      .filter(n => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `C${String(max + 1).padStart(3, '0')}`;
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm({ ...emptyForm(), code: nextCode() });
    setShowModal(true);
  };

  const openEdit = (c: Customer) => {
    setEditTarget(c);
    setForm({
      code: c.code,
      name: c.name,
      contact: c.contact,
      phone: c.phone,
      email: c.email,
      address: c.address,
      taxId: c.taxId,
      paymentTerms: c.paymentTerms,
      creditLimit: c.creditLimit,
      note: c.note,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.code.trim()) return;
    if (editTarget) {
      updateCustomer(editTarget.id, form);
    } else {
      addCustomer({
        ...form,
        id: genId(),
        balance: 0,
        createdAt: today(),
      });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除此客戶？')) deleteCustomer(id);
  };

  const set = (k: keyof typeof form, v: string | number) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="section-title mb-0">客戶管理</h1>
        <button className="btn-primary flex items-center gap-2" onClick={openAdd}>
          <Plus size={16} /> 新增客戶
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input-field pl-9"
            placeholder="搜尋客戶名稱、代碼、聯絡人..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
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
                <th>信用額度</th>
                <th>餘額</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center text-gray-400 py-8">尚無客戶資料</td>
                </tr>
              )}
              {filtered.map(c => (
                <tr key={c.id}>
                  <td className="font-mono text-xs font-semibold text-blue-600">{c.code}</td>
                  <td className="font-medium">{c.name}</td>
                  <td>{c.contact}</td>
                  <td>
                    <span className="flex items-center gap-1 text-xs">
                      <Phone size={12} className="text-gray-400" />{c.phone}
                    </span>
                  </td>
                  <td>
                    <span className="flex items-center gap-1 text-xs">
                      <Mail size={12} className="text-gray-400" />{c.email}
                    </span>
                  </td>
                  <td>
                    <span className="flex items-center gap-1 text-xs max-w-[160px] truncate">
                      <MapPin size={12} className="text-gray-400 shrink-0" />{c.address}
                    </span>
                  </td>
                  <td className="font-mono text-xs">{c.taxId}</td>
                  <td>{c.paymentTerms}</td>
                  <td className="text-right">{fmtCurrency(c.creditLimit)}</td>
                  <td className="text-right">{fmtCurrency(c.balance)}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button className="btn-secondary py-1 px-2" onClick={() => openEdit(c)}>
                        <Edit3 size={13} />
                      </button>
                      <button className="btn-danger py-1 px-2" onClick={() => handleDelete(c.id)}>
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

      {/* Modal */}
      {showModal && (
        <Modal
          title={editTarget ? '編輯客戶' : '新增客戶'}
          onClose={() => setShowModal(false)}
          size="lg"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">客戶代碼 *</label>
              <input className="input-field" value={form.code} onChange={e => set('code', e.target.value)} />
            </div>
            <div>
              <label className="form-label">客戶名稱 *</label>
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
              <label className="form-label">信用額度</label>
              <input
                className="input-field"
                type="number"
                min={0}
                value={form.creditLimit}
                onChange={e => set('creditLimit', Number(e.target.value))}
              />
            </div>
            <div className="col-span-2">
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
