import { useState } from 'react';
import { useStore } from '../store';
import { genId, today, fmtCurrency, fmtDate } from '../utils';
import Modal from '../components/Modal';
import type { OtherIncome } from '../types';
import { Plus, Edit3, Trash2, Search } from 'lucide-react';

const INCOME_CATEGORIES = ['利息收入', '租金收入', '補貼', '其他'];

interface FormState {
  code: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  note: string;
}

const emptyForm = (): FormState => ({
  code: '',
  date: today(),
  category: '其他',
  description: '',
  amount: 0,
  note: '',
});

export default function OtherIncomePage() {
  const { otherIncomes, addOtherIncome, updateOtherIncome, deleteOtherIncome } = useStore(s => ({
    otherIncomes: s.otherIncomes,
    addOtherIncome: s.addOtherIncome,
    updateOtherIncome: s.updateOtherIncome,
    deleteOtherIncome: s.deleteOtherIncome,
  }));

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<OtherIncome | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [filterCategory, setFilterCategory] = useState('');

  const filtered = otherIncomes.filter(i => {
    const q = search.toLowerCase();
    const matchSearch = i.code.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
    const matchCat = !filterCategory || i.category === filterCategory;
    return matchSearch && matchCat;
  });

  const totalAmount = filtered.reduce((s, i) => s + i.amount, 0);

  const nextCode = () => {
    const nums = otherIncomes.map(i => parseInt(i.code.replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `OI${String(max + 1).padStart(5, '0')}`;
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm({ ...emptyForm(), code: nextCode() });
    setShowModal(true);
  };

  const openEdit = (i: OtherIncome) => {
    setEditTarget(i);
    setForm({
      code: i.code,
      date: i.date,
      category: i.category,
      description: i.description,
      amount: i.amount,
      note: i.note,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.code.trim() || !form.description.trim() || form.amount <= 0) return;
    if (editTarget) {
      updateOtherIncome(editTarget.id, form);
    } else {
      addOtherIncome({
        ...form,
        id: genId(),
        createdAt: today(),
      });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除此收入記錄？')) deleteOtherIncome(id);
  };

  const set = (k: keyof FormState, v: string | number) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="section-title mb-0">其他收入</h1>
        <button className="btn-primary flex items-center gap-2" onClick={openAdd}>
          <Plus size={16} /> 新增收入
        </button>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input-field pl-9"
              placeholder="搜尋單號、說明..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="w-40">
            <select className="select-field" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="">全部類別</option>
              {INCOME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {filtered.length > 0 && (
            <div className="ml-auto text-sm text-gray-500">
              篩選合計：<span className="font-semibold text-green-600">{fmtCurrency(totalAmount)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="card p-0">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>單號</th>
                <th>日期</th>
                <th>類別</th>
                <th>說明</th>
                <th>金額</th>
                <th>備註</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center text-gray-400 py-8">尚無其他收入記錄</td></tr>
              )}
              {filtered.map(i => (
                <tr key={i.id}>
                  <td className="font-mono text-xs font-semibold text-blue-600">{i.code}</td>
                  <td>{fmtDate(i.date)}</td>
                  <td>
                    <span className="badge badge-green">{i.category}</span>
                  </td>
                  <td className="max-w-[200px] truncate">{i.description}</td>
                  <td className="text-right font-semibold text-green-600">{fmtCurrency(i.amount)}</td>
                  <td className="text-gray-500 text-xs max-w-[150px] truncate">{i.note || '-'}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button className="btn-secondary py-1 px-2" onClick={() => openEdit(i)}><Edit3 size={13} /></button>
                      <button className="btn-danger py-1 px-2" onClick={() => handleDelete(i.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={4} className="px-4 py-3 text-xs font-semibold text-gray-500 text-right">合計</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">{fmtCurrency(totalAmount)}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title={editTarget ? '編輯收入記錄' : '新增收入記錄'} onClose={() => setShowModal(false)} size="md">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">單號 *</label>
                <input className="input-field" value={form.code} onChange={e => set('code', e.target.value)} />
              </div>
              <div>
                <label className="form-label">日期</label>
                <input className="input-field" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
              <div>
                <label className="form-label">類別</label>
                <select className="select-field" value={form.category} onChange={e => set('category', e.target.value)}>
                  {INCOME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">金額 *</label>
                <input
                  className="input-field"
                  type="number"
                  min={0}
                  value={form.amount}
                  onChange={e => set('amount', Number(e.target.value))}
                />
              </div>
            </div>
            <div>
              <label className="form-label">說明 *</label>
              <input className="input-field" value={form.description} onChange={e => set('description', e.target.value)} placeholder="收入說明..." />
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
