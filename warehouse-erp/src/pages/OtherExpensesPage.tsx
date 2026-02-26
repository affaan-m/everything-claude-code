import { useState } from 'react';
import { useStore } from '../store';
import { genId, today, fmtCurrency, fmtDate } from '../utils';
import Modal from '../components/Modal';
import type { OtherExpense } from '../types';
import { Plus, Edit3, Trash2, Search } from 'lucide-react';

const CATEGORIES = ['水電費', '租金', '人事費', '行銷費', '其他'];

type FormType = Omit<OtherExpense, 'id' | 'createdAt'>;

const emptyForm = (): FormType => ({
  code: '',
  date: today(),
  category: '其他',
  description: '',
  amount: 0,
  note: '',
});

export default function OtherExpensesPage() {
  const { otherExpenses, addOtherExpense, updateOtherExpense, deleteOtherExpense } = useStore(s => ({
    otherExpenses: s.otherExpenses,
    addOtherExpense: s.addOtherExpense,
    updateOtherExpense: s.updateOtherExpense,
    deleteOtherExpense: s.deleteOtherExpense,
  }));

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<OtherExpense | null>(null);
  const [form, setForm] = useState<FormType>(emptyForm());

  const filtered = otherExpenses.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = e.description.toLowerCase().includes(q) || e.code.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
    const matchCat = filterCategory ? e.category === filterCategory : true;
    return matchSearch && matchCat;
  });

  const totalAmount = filtered.reduce((s, e) => s + e.amount, 0);

  const nextCode = () => {
    const nums = otherExpenses.map(e => parseInt(e.code.replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `EX${String(max + 1).padStart(5, '0')}`;
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm({ ...emptyForm(), code: nextCode() });
    setShowModal(true);
  };

  const openEdit = (e: OtherExpense) => {
    setEditTarget(e);
    setForm({ code: e.code, date: e.date, category: e.category, description: e.description, amount: e.amount, note: e.note });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.description.trim() || form.amount <= 0) return;
    if (editTarget) {
      updateOtherExpense(editTarget.id, form);
    } else {
      addOtherExpense({ ...form, id: genId(), createdAt: today() });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除此費用記錄？')) deleteOtherExpense(id);
  };

  const set = (k: keyof FormType, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const categoryColorMap: Record<string, string> = {
    '水電費': 'badge-blue',
    '租金': 'badge-yellow',
    '人事費': 'badge-green',
    '行銷費': 'badge-red',
    '其他': 'badge-gray',
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="section-title mb-0">其他費用</h1>
        <button className="btn-primary flex items-center gap-2" onClick={openAdd}>
          <Plus size={16} /> 新增費用
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input-field pl-9" placeholder="搜尋描述、單號..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="select-field w-40" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">全部類別</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map(cat => {
            const catItems = filtered.filter(e => e.category === cat);
            if (catItems.length === 0) return null;
            return (
              <div key={cat} className="card text-center">
                <div className="text-xs text-gray-500 mb-1">{cat}</div>
                <div className="text-lg font-bold text-gray-800">{fmtCurrency(catItems.reduce((s, e) => s + e.amount, 0))}</div>
                <div className="text-xs text-gray-400">{catItems.length} 筆</div>
              </div>
            );
          })}
          <div className="card text-center bg-blue-50 border-blue-200">
            <div className="text-xs text-blue-500 mb-1">合計</div>
            <div className="text-lg font-bold text-blue-700">{fmtCurrency(totalAmount)}</div>
            <div className="text-xs text-blue-400">{filtered.length} 筆</div>
          </div>
        </div>
      )}

      <div className="card p-0">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>單號</th>
                <th>日期</th>
                <th>類別</th>
                <th>描述</th>
                <th>金額</th>
                <th>備註</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center text-gray-400 py-8">尚無費用記錄</td></tr>
              )}
              {filtered.map(e => (
                <tr key={e.id}>
                  <td className="font-mono text-xs font-semibold text-blue-600">{e.code}</td>
                  <td className="text-xs">{fmtDate(e.date)}</td>
                  <td><span className={categoryColorMap[e.category] || 'badge-gray'}>{e.category}</span></td>
                  <td className="font-medium">{e.description}</td>
                  <td className="font-medium text-red-600">{fmtCurrency(e.amount)}</td>
                  <td className="text-xs text-gray-500 max-w-[160px] truncate">{e.note || '-'}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button className="btn-secondary py-1 px-2" onClick={() => openEdit(e)}><Edit3 size={13} /></button>
                      <button className="btn-danger py-1 px-2" onClick={() => handleDelete(e.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title={editTarget ? '編輯費用' : '新增費用'} onClose={() => setShowModal(false)} size="md">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">單號</label>
                <input className="input-field" value={form.code} onChange={e => set('code', e.target.value)} />
              </div>
              <div>
                <label className="form-label">日期</label>
                <input className="input-field" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="form-label">類別</label>
              <select className="select-field" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">描述 *</label>
              <input className="input-field" value={form.description} onChange={e => set('description', e.target.value)} placeholder="費用說明..." />
            </div>
            <div>
              <label className="form-label">金額 *</label>
              <input className="input-field" type="number" min={0} value={form.amount} onChange={e => set('amount', Number(e.target.value))} />
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
