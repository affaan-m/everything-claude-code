import { useState } from 'react';
import { useStore } from '../store';
import { genId, today, fmtDate, fmtNumber, statusColor, statusLabel } from '../utils';
import Modal from '../components/Modal';
import type { StockAdjustment } from '../types';
import { Plus, Edit3, Trash2, Search, Sliders } from 'lucide-react';

export default function StockAdjustmentsPage() {
  const { stockAdjustments, warehouses, products, addStockAdjustment, updateStockAdjustment, deleteStockAdjustment } = useStore(s => ({
    stockAdjustments: s.stockAdjustments, warehouses: s.warehouses, products: s.products,
    addStockAdjustment: s.addStockAdjustment, updateStockAdjustment: s.updateStockAdjustment, deleteStockAdjustment: s.deleteStockAdjustment,
  }));
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<StockAdjustment | null>(null);

  const filtered = stockAdjustments.filter(a =>
    a.code.toLowerCase().includes(search.toLowerCase()) ||
    a.warehouseName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (data: Partial<StockAdjustment>) => {
    if (editItem) updateStockAdjustment(editItem.id, data);
    else addStockAdjustment({ id: genId(), code: `ADJ${String(stockAdjustments.length+1).padStart(5,'0')}`, date: today(), warehouseId: '', warehouseName: '', items: [], reason: '', status: 'pending', createdAt: new Date().toISOString(), ...data } as StockAdjustment);
    setShowModal(false); setEditItem(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-800 flex-1 flex items-center gap-2"><Sliders size={22} />調整商品（盤點）</h1>
        <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋..." className="input-field pl-9 w-56" /></div>
        <button className="btn-primary flex items-center gap-1" onClick={() => { setEditItem(null); setShowModal(true); }}><Plus size={15} />新增調整單</button>
      </div>
      <div className="card p-0">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>單號</th><th>日期</th><th>倉庫</th><th>調整品項</th><th>原因</th><th>狀態</th><th>操作</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-400 py-8">暫無資料</td></tr>
              ) : filtered.map(a => (
                <tr key={a.id}>
                  <td className="font-mono font-semibold text-blue-600">{a.code}</td>
                  <td>{fmtDate(a.date)}</td>
                  <td>{a.warehouseName}</td>
                  <td>{a.items.length} 項</td>
                  <td className="text-gray-500">{a.reason || '—'}</td>
                  <td><span className={statusColor(a.status)}>{statusLabel(a.status)}</span></td>
                  <td><div className="flex gap-1">
                    <button onClick={() => { setEditItem(a); setShowModal(true); }} className="btn-secondary text-xs py-1 px-2"><Edit3 size={13} /></button>
                    <button onClick={() => deleteStockAdjustment(a.id)} className="btn-danger text-xs py-1 px-2"><Trash2 size={13} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <AdjustmentModal item={editItem} warehouses={warehouses} products={products} onSave={handleSave} onClose={() => { setShowModal(false); setEditItem(null); }} />
      )}
    </div>
  );
}

function AdjustmentModal({ item, warehouses, products, onSave, onClose }: { item: StockAdjustment | null; warehouses: any[]; products: any[]; onSave: (d: Partial<StockAdjustment>) => void; onClose: () => void }) {
  const [warehouseId, setWarehouseId] = useState(item?.warehouseId || '');
  const [date, setDate] = useState(item?.date || today());
  const [reason, setReason] = useState(item?.reason || '');
  const [status, setStatus] = useState(item?.status || 'pending');
  const [items, setItems] = useState(item?.items || [] as StockAdjustment['items']);

  const addRow = () => setItems(p => [...p, { productId: '', productName: '', specId: '', specName: '', qtyBefore: 0, qtyAfter: 0, diff: 0 }]);
  const removeRow = (i: number) => setItems(p => p.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: string, value: unknown) => setItems(prev => prev.map((r, idx) => {
    if (idx !== i) return r;
    const updated = { ...r, [field]: value };
    if (field === 'productId') { const prod = products.find((p: any) => p.id === value); updated.productName = prod?.name || ''; updated.specId = ''; updated.specName = ''; }
    if (field === 'specId') { const prod = products.find((p: any) => p.id === updated.productId); const spec = prod?.specs.find((s: any) => s.id === value); updated.specName = spec?.name || ''; updated.qtyBefore = spec?.quantity || 0; updated.diff = updated.qtyAfter - updated.qtyBefore; }
    if (field === 'qtyAfter') { updated.diff = Number(value) - updated.qtyBefore; }
    return updated;
  }));
  const warehouse = warehouses.find((w: any) => w.id === warehouseId);

  return (
    <Modal title={item ? '編輯調整單' : '新增調整單（盤點）'} onClose={onClose} size="xl">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div><label className="form-label">倉庫 *</label>
            <select className="select-field" value={warehouseId} onChange={e => setWarehouseId(e.target.value)}>
              <option value="">— 請選擇 —</option>
              {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div><label className="form-label">日期</label><input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div><label className="form-label">狀態</label>
            <select className="select-field" value={status} onChange={e => setStatus(e.target.value as any)}>
              <option value="pending">待核准</option><option value="approved">已核准</option><option value="rejected">已拒絕</option>
            </select>
          </div>
        </div>
        <div><label className="form-label">調整原因</label><input className="input-field" value={reason} onChange={e => setReason(e.target.value)} placeholder="如：盤點差異、損毀、遺失..." /></div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="form-label mb-0">調整項目</label>
            <button onClick={addRow} className="btn-secondary text-xs py-1 px-2 flex items-center gap-1"><Plus size={12} />加入商品</button>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>商品</th><th>規格</th><th>原數量</th><th>調整後</th><th>差異</th><th></th></tr></thead>
              <tbody>
                {items.map((row, i) => {
                  const prod = products.find((p: any) => p.id === row.productId);
                  return (
                    <tr key={i}>
                      <td><select className="select-field text-xs" value={row.productId} onChange={e => updateRow(i, 'productId', e.target.value)}>
                        <option value="">選商品</option>
                        {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select></td>
                      <td><select className="select-field text-xs" value={row.specId} onChange={e => updateRow(i, 'specId', e.target.value)}>
                        <option value="">選規格</option>
                        {prod?.specs.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select></td>
                      <td><input type="number" className="input-field text-xs w-20" value={row.qtyBefore} onChange={e => updateRow(i, 'qtyBefore', Number(e.target.value))} /></td>
                      <td><input type="number" className="input-field text-xs w-20" value={row.qtyAfter} onChange={e => updateRow(i, 'qtyAfter', Number(e.target.value))} /></td>
                      <td className={`font-bold text-sm ${row.diff > 0 ? 'text-green-600' : row.diff < 0 ? 'text-red-500' : 'text-gray-500'}`}>{row.diff > 0 ? `+${row.diff}` : fmtNumber(row.diff)}</td>
                      <td><button onClick={() => removeRow(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button className="btn-secondary" onClick={onClose}>取消</button>
          <button className="btn-primary" onClick={() => { if (!warehouseId) return; onSave({ warehouseId, warehouseName: warehouse?.name || '', date, reason, status: status as any, items }); }}>儲存</button>
        </div>
      </div>
    </Modal>
  );
}
