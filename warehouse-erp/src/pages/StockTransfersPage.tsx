import { useState } from 'react';
import { useStore } from '../store';
import { genId, today, fmtDate, statusColor, statusLabel } from '../utils';
import Modal from '../components/Modal';
import type { StockTransfer } from '../types';
import { Plus, Edit3, Trash2, Search, ArrowLeftRight } from 'lucide-react';

export default function StockTransfersPage() {
  const { stockTransfers, warehouses, products, addStockTransfer, updateStockTransfer, deleteStockTransfer } = useStore(s => ({
    stockTransfers: s.stockTransfers, warehouses: s.warehouses, products: s.products,
    addStockTransfer: s.addStockTransfer, updateStockTransfer: s.updateStockTransfer, deleteStockTransfer: s.deleteStockTransfer,
  }));
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<StockTransfer | null>(null);

  const filtered = stockTransfers.filter(t =>
    t.code.toLowerCase().includes(search.toLowerCase()) ||
    t.fromWarehouseName.toLowerCase().includes(search.toLowerCase()) ||
    t.toWarehouseName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (data: Partial<StockTransfer>) => {
    if (editItem) updateStockTransfer(editItem.id, data);
    else addStockTransfer({ id: genId(), code: `TF${String(stockTransfers.length+1).padStart(5,'0')}`, date: today(), fromWarehouseId: '', fromWarehouseName: '', toWarehouseId: '', toWarehouseName: '', items: [], status: 'pending', note: '', createdAt: new Date().toISOString(), ...data } as StockTransfer);
    setShowModal(false); setEditItem(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-800 flex-1 flex items-center gap-2"><ArrowLeftRight size={22} />調撥商品</h1>
        <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋..." className="input-field pl-9 w-56" /></div>
        <button className="btn-primary flex items-center gap-1" onClick={() => { setEditItem(null); setShowModal(true); }}><Plus size={15} />新增調撥單</button>
      </div>
      <div className="card p-0">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>單號</th><th>日期</th><th>來源倉庫</th><th>目標倉庫</th><th>品項數</th><th>狀態</th><th>備註</th><th>操作</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-gray-400 py-8">暫無資料</td></tr>
              ) : filtered.map(t => (
                <tr key={t.id}>
                  <td className="font-mono font-semibold text-blue-600">{t.code}</td>
                  <td>{fmtDate(t.date)}</td>
                  <td>{t.fromWarehouseName}</td>
                  <td>{t.toWarehouseName}</td>
                  <td>{t.items.length}</td>
                  <td><span className={statusColor(t.status)}>{statusLabel(t.status)}</span></td>
                  <td className="text-gray-500 text-xs">{t.note}</td>
                  <td><div className="flex gap-1">
                    <button onClick={() => { setEditItem(t); setShowModal(true); }} className="btn-secondary text-xs py-1 px-2"><Edit3 size={13} /></button>
                    <button onClick={() => deleteStockTransfer(t.id)} className="btn-danger text-xs py-1 px-2"><Trash2 size={13} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <TransferModal item={editItem} warehouses={warehouses} products={products} onSave={handleSave} onClose={() => { setShowModal(false); setEditItem(null); }} />
      )}
    </div>
  );
}

function TransferModal({ item, warehouses, products, onSave, onClose }: { item: StockTransfer | null; warehouses: any[]; products: any[]; onSave: (d: Partial<StockTransfer>) => void; onClose: () => void }) {
  const [fromWH, setFromWH] = useState(item?.fromWarehouseId || '');
  const [toWH, setToWH] = useState(item?.toWarehouseId || '');
  const [date, setDate] = useState(item?.date || today());
  const [status, setStatus] = useState(item?.status || 'pending');
  const [note, setNote] = useState(item?.note || '');
  const [items, setItems] = useState(item?.items || [] as StockTransfer['items']);

  const addRow = () => setItems(p => [...p, { productId: '', productName: '', specId: '', specName: '', qty: 1 }]);
  const removeRow = (i: number) => setItems(p => p.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: string, value: unknown) => setItems(prev => prev.map((r, idx) => {
    if (idx !== i) return r;
    const updated = { ...r, [field]: value };
    if (field === 'productId') { const prod = products.find((p: any) => p.id === value); updated.productName = prod?.name || ''; updated.specId = ''; updated.specName = ''; }
    if (field === 'specId') { const prod = products.find((p: any) => p.id === updated.productId); const spec = prod?.specs.find((s: any) => s.id === value); updated.specName = spec?.name || ''; }
    return updated;
  }));

  const fromWarehouse = warehouses.find((w: any) => w.id === fromWH);
  const toWarehouse = warehouses.find((w: any) => w.id === toWH);

  return (
    <Modal title={item ? '編輯調撥單' : '新增調撥單'} onClose={onClose} size="xl">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="form-label">來源倉庫 *</label>
            <select className="select-field" value={fromWH} onChange={e => setFromWH(e.target.value)}>
              <option value="">— 請選擇 —</option>
              {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div><label className="form-label">目標倉庫 *</label>
            <select className="select-field" value={toWH} onChange={e => setToWH(e.target.value)}>
              <option value="">— 請選擇 —</option>
              {warehouses.filter((w: any) => w.id !== fromWH).map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div><label className="form-label">日期</label><input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div><label className="form-label">狀態</label>
            <select className="select-field" value={status} onChange={e => setStatus(e.target.value as any)}>
              <option value="pending">待處理</option><option value="completed">已完成</option><option value="cancelled">已取消</option>
            </select>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="form-label mb-0">調撥商品</label>
            <button onClick={addRow} className="btn-secondary text-xs py-1 px-2 flex items-center gap-1"><Plus size={12} />加入商品</button>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>商品</th><th>規格</th><th>數量</th><th></th></tr></thead>
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
                      <td><input type="number" min={1} className="input-field text-xs w-20" value={row.qty} onChange={e => updateRow(i, 'qty', Number(e.target.value))} /></td>
                      <td><button onClick={() => removeRow(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div><label className="form-label">備註</label><textarea className="input-field" rows={2} value={note} onChange={e => setNote(e.target.value)} /></div>
        <div className="flex gap-2 justify-end">
          <button className="btn-secondary" onClick={onClose}>取消</button>
          <button className="btn-primary" onClick={() => { if (!fromWH || !toWH) return; onSave({ fromWarehouseId: fromWH, fromWarehouseName: fromWarehouse?.name || '', toWarehouseId: toWH, toWarehouseName: toWarehouse?.name || '', date, status: status as any, items, note }); }}>儲存</button>
        </div>
      </div>
    </Modal>
  );
}
