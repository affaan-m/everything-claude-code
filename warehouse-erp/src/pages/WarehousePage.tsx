import { useState, useRef } from 'react';
import { useStore } from '../store';
import { genId } from '../utils';
import Modal from '../components/Modal';
import type { Warehouse, Shelf, ShelfSlot, Product } from '../types';
import {
  Plus, Edit3, Trash2, Search, X, Package, Layers,
  ChevronDown, ChevronRight, AlertTriangle, Info
} from 'lucide-react';
import { fmtNumber, fmtCurrency } from '../utils';

// ---- Shelf colors palette
const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16'];

export default function WarehousePage() {
  const { warehouses, products, addWarehouse, updateWarehouse, deleteWarehouse } = useStore(s => ({
    warehouses: s.warehouses, products: s.products,
    addWarehouse: s.addWarehouse, updateWarehouse: s.updateWarehouse, deleteWarehouse: s.deleteWarehouse,
  }));

  const [activeWH, setActiveWH] = useState<string>(warehouses[0]?.id || '');
  const [selectedShelf, setSelectedShelf] = useState<Shelf | null>(null);
  const [showShelfModal, setShowShelfModal] = useState(false);
  const [showWHModal, setShowWHModal] = useState(false);
  const [editShelf, setEditShelf] = useState<Shelf | null>(null);
  const [editWH, setEditWH] = useState<Warehouse | null>(null);
  const [search, setSearch] = useState('');
  const [showSlotModal, setShowSlotModal] = useState<{ shelf: Shelf; level: number } | null>(null);
  const dragRef = useRef<{ id: string; ox: number; oy: number } | null>(null);

  const warehouse = warehouses.find(w => w.id === activeWH);

  // Search filtered products across all warehouses' shelves
  const searchResults = search.trim() ? (() => {
    const q = search.toLowerCase();
    const results: { wh: string; shelf: string; product: string; spec: string; qty: number }[] = [];
    warehouses.forEach(wh => {
      wh.shelves.forEach(shelf => {
        shelf.slots.forEach(slot => {
          if (!slot.productId) return;
          const prod = products.find(p => p.id === slot.productId);
          const spec = prod?.specs.find(s => s.id === slot.specId);
          if (!prod || !spec) return;
          if (
            wh.name.toLowerCase().includes(q) ||
            prod.name.toLowerCase().includes(q) ||
            prod.category.toLowerCase().includes(q) ||
            spec.name.toLowerCase().includes(q) ||
            spec.sku.toLowerCase().includes(q)
          ) {
            results.push({ wh: wh.name, shelf: shelf.name, product: prod.name, spec: spec.name, qty: slot.quantity });
          }
        });
      });
    });
    return results;
  })() : [];

  // Save shelf
  const handleSaveShelf = (shelf: Shelf) => {
    if (!warehouse) return;
    const shelves = editShelf
      ? warehouse.shelves.map(s => s.id === shelf.id ? shelf : s)
      : [...warehouse.shelves, shelf];
    updateWarehouse(warehouse.id, { shelves });
    setShowShelfModal(false); setEditShelf(null);
  };

  const handleDeleteShelf = (id: string) => {
    if (!warehouse) return;
    updateWarehouse(warehouse.id, { shelves: warehouse.shelves.filter(s => s.id !== id) });
    if (selectedShelf?.id === id) setSelectedShelf(null);
  };

  // Drag shelf
  const handleMouseDown = (e: React.MouseEvent, shelf: Shelf) => {
    e.preventDefault();
    dragRef.current = { id: shelf.id, ox: e.clientX - shelf.posX, oy: e.clientY - shelf.posY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current || !warehouse) return;
    const { id, ox, oy } = dragRef.current;
    const newX = Math.max(0, e.clientX - ox);
    const newY = Math.max(0, e.clientY - oy);
    updateWarehouse(warehouse.id, {
      shelves: warehouse.shelves.map(s => s.id === id ? { ...s, posX: newX, posY: newY } : s)
    });
  };

  const handleMouseUp = () => { dragRef.current = null; };

  // Save slot
  const handleSaveSlot = (slot: ShelfSlot) => {
    if (!showSlotModal || !warehouse) return;
    const { shelf } = showSlotModal;
    const slots = shelf.slots.some(s => s.id === slot.id)
      ? shelf.slots.map(s => s.id === slot.id ? slot : s)
      : [...shelf.slots, slot];
    const shelves = warehouse.shelves.map(s => s.id === shelf.id ? { ...s, slots } : s);
    updateWarehouse(warehouse.id, { shelves });
    setShowSlotModal(null);
    setSelectedShelf(prev => prev?.id === shelf.id ? { ...prev, slots } : prev);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-800 flex-1">倉庫地圖</h1>
        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜尋倉庫/商品/分類..."
            className="input-field pl-9 w-64"
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"><X size={14} /></button>}
        </div>
        <button className="btn-primary flex items-center gap-1" onClick={() => { setEditWH(null); setShowWHModal(true); }}>
          <Plus size={15} />新增倉庫
        </button>
      </div>

      {/* Search results */}
      {search && (
        <div className="card">
          <p className="text-sm font-semibold text-gray-600 mb-3">搜尋結果（{searchResults.length}筆）</p>
          {searchResults.length === 0 ? (
            <p className="text-sm text-gray-400">無符合結果</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>倉庫</th><th>貨架</th><th>商品</th><th>規格</th><th>庫存</th></tr></thead>
                <tbody>
                  {searchResults.map((r, i) => (
                    <tr key={i}>
                      <td>{r.wh}</td><td>{r.shelf}</td><td>{r.product}</td>
                      <td>{r.spec}</td><td className="font-semibold">{fmtNumber(r.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Warehouse tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {warehouses.map(wh => (
          <div key={wh.id} className="flex items-center">
            <button
              onClick={() => setActiveWH(wh.id)}
              className={`px-4 py-2 rounded-l-lg text-sm font-medium border transition-colors ${wh.id === activeWH ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            >
              {wh.name}
            </button>
            <button
              onClick={() => { setEditWH(wh); setShowWHModal(true); }}
              className={`px-2 py-2 text-sm border-y border-r rounded-r-lg transition-colors ${wh.id === activeWH ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'}`}
            >
              <Edit3 size={13} />
            </button>
          </div>
        ))}
      </div>

      {warehouse && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map canvas */}
          <div className="lg:col-span-2">
            <div className="card p-0 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="font-semibold text-gray-700">{warehouse.name} — 平面圖</span>
                <button
                  className="btn-primary flex items-center gap-1 text-xs py-1.5"
                  onClick={() => { setEditShelf(null); setShowShelfModal(true); }}
                >
                  <Plus size={13} />新增貨架
                </button>
              </div>
              <div
                className="relative bg-gray-50 border-b border-gray-200 select-none"
                style={{ height: 480 }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {warehouse.shelves.map(shelf => {
                  const isSelected = selectedShelf?.id === shelf.id;
                  const lowStock = shelf.slots.some(slot => {
                    if (!slot.productId) return false;
                    const prod = products.find(p => p.id === slot.productId);
                    const spec = prod?.specs.find(s => s.id === slot.specId);
                    return spec && slot.quantity <= spec.safetyStock;
                  });
                  return (
                    <div
                      key={shelf.id}
                      style={{ left: shelf.posX, top: shelf.posY, width: shelf.width, height: shelf.height, borderColor: shelf.color, backgroundColor: isSelected ? shelf.color + '22' : 'white' }}
                      className={`absolute rounded-lg border-2 cursor-pointer shadow-sm transition-all ${isSelected ? 'shadow-lg ring-2 ring-offset-1' : 'hover:shadow-md'}`}
                      style={{ left: shelf.posX, top: shelf.posY, width: shelf.width, height: shelf.height, borderColor: shelf.color, backgroundColor: isSelected ? shelf.color + '22' : 'white', ['--tw-ring-color' as string]: shelf.color }}
                      onClick={() => setSelectedShelf(shelf)}
                      onMouseDown={e => handleMouseDown(e, shelf)}
                    >
                      <div className="flex flex-col h-full justify-between p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold" style={{ color: shelf.color }}>{shelf.name}</span>
                          {lowStock && <AlertTriangle size={12} className="text-yellow-500" />}
                        </div>
                        <div className="text-xs text-gray-400">{shelf.levels}層 · {shelf.slots.length}項</div>
                      </div>
                    </div>
                  );
                })}
                {warehouse.shelves.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                    點擊「新增貨架」開始設計倉庫地圖
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shelf detail */}
          <div className="space-y-4">
            {selectedShelf ? (
              <ShelfDetailPanel
                shelf={selectedShelf}
                products={products}
                onEdit={() => { setEditShelf(selectedShelf); setShowShelfModal(true); }}
                onDelete={() => handleDeleteShelf(selectedShelf.id)}
                onAddSlot={(level) => setShowSlotModal({ shelf: selectedShelf, level })}
                onEditSlot={(slot) => {
                  const shelf = warehouse.shelves.find(s => s.id === selectedShelf.id)!;
                  setShowSlotModal({ shelf, level: slot.level });
                }}
              />
            ) : (
              <div className="card flex flex-col items-center justify-center text-gray-400 py-16">
                <Info size={32} className="mb-2" />
                <p className="text-sm">點選地圖上的貨架查看詳情</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Warehouse Modal */}
      {showWHModal && (
        <WarehouseModal
          warehouse={editWH}
          onSave={(wh) => {
            if (editWH) updateWarehouse(editWH.id, wh);
            else { addWarehouse({ ...wh, id: genId(), shelves: [], createdAt: new Date().toISOString() }); }
            setShowWHModal(false);
          }}
          onDelete={editWH ? () => { deleteWarehouse(editWH.id); setActiveWH(warehouses[0]?.id || ''); setShowWHModal(false); } : undefined}
          onClose={() => setShowWHModal(false)}
        />
      )}

      {/* Shelf Modal */}
      {showShelfModal && warehouse && (
        <ShelfModal
          shelf={editShelf}
          onSave={handleSaveShelf}
          onClose={() => { setShowShelfModal(false); setEditShelf(null); }}
        />
      )}

      {/* Slot Modal */}
      {showSlotModal && (
        <SlotModal
          shelf={showSlotModal.shelf}
          level={showSlotModal.level}
          products={products}
          onSave={handleSaveSlot}
          onClose={() => setShowSlotModal(null)}
        />
      )}
    </div>
  );
}

// ---- Shelf Detail Panel ----
function ShelfDetailPanel({ shelf, products, onEdit, onDelete, onAddSlot, onEditSlot }: {
  shelf: Shelf; products: Product[];
  onEdit: () => void; onDelete: () => void;
  onAddSlot: (level: number) => void;
  onEditSlot: (slot: ShelfSlot) => void;
}) {
  const [expandedLevels, setExpandedLevels] = useState<Record<number, boolean>>({});
  const toggleLevel = (l: number) => setExpandedLevels(prev => ({ ...prev, [l]: !prev[l] }));

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Layers size={16} style={{ color: shelf.color }} />
          {shelf.name}
        </h3>
        <div className="flex gap-1">
          <button onClick={onEdit} className="btn-secondary text-xs py-1 px-2"><Edit3 size={13} /></button>
          <button onClick={onDelete} className="btn-danger text-xs py-1 px-2"><Trash2 size={13} /></button>
        </div>
      </div>
      <p className="text-xs text-gray-500">{shelf.levels}層貨架 · 共{shelf.slots.length}個商品位置</p>

      {Array.from({ length: shelf.levels }, (_, i) => {
        const level = i + 1;
        const slots = shelf.slots.filter(s => s.level === level);
        const open = expandedLevels[level] !== false;
        return (
          <div key={level} className="border border-gray-100 rounded-lg overflow-hidden">
            <div
              className="flex items-center justify-between px-3 py-2 bg-gray-50 cursor-pointer"
              onClick={() => toggleLevel(level)}
            >
              <span className="text-sm font-semibold text-gray-700">第 {level} 層</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{slots.length} 項</span>
                {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
            </div>
            {open && (
              <div className="p-2 space-y-1">
                {slots.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-2">此層尚無商品</p>
                ) : (
                  slots.map(slot => {
                    const prod = products.find(p => p.id === slot.productId);
                    const spec = prod?.specs.find(s => s.id === slot.specId);
                    const isLow = spec && slot.quantity <= spec.safetyStock;
                    return (
                      <div
                        key={slot.id}
                        onClick={() => onEditSlot(slot)}
                        className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-blue-50 cursor-pointer border border-transparent hover:border-blue-200 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Package size={14} className="text-gray-400" />
                          <div>
                            <p className="text-xs font-semibold text-gray-800">{prod?.name || '未知商品'}</p>
                            <p className="text-xs text-gray-500">{spec?.name} · {spec?.sku}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-bold ${isLow ? 'text-red-500' : 'text-gray-800'}`}>
                            {fmtNumber(slot.quantity)}
                          </span>
                          {isLow && <AlertTriangle size={12} className="text-yellow-500 ml-1 inline" />}
                        </div>
                      </div>
                    );
                  })
                )}
                <button
                  onClick={() => onAddSlot(level)}
                  className="w-full text-xs text-blue-600 hover:bg-blue-50 rounded-lg py-1.5 flex items-center justify-center gap-1 border border-dashed border-blue-200"
                >
                  <Plus size={12} />加入商品
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---- Warehouse Modal ----
function WarehouseModal({ warehouse, onSave, onDelete, onClose }: {
  warehouse: Warehouse | null;
  onSave: (data: Partial<Warehouse>) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(warehouse?.name || '');
  const [desc, setDesc] = useState(warehouse?.description || '');
  return (
    <Modal title={warehouse ? '編輯倉庫' : '新增倉庫'} onClose={onClose} size="sm">
      <div className="space-y-4">
        <div><label className="form-label">倉庫名稱 *</label><input className="input-field" value={name} onChange={e => setName(e.target.value)} /></div>
        <div><label className="form-label">描述</label><textarea className="input-field" rows={2} value={desc} onChange={e => setDesc(e.target.value)} /></div>
        <div className="flex gap-2 justify-end">
          {onDelete && <button className="btn-danger" onClick={onDelete}>刪除倉庫</button>}
          <button className="btn-secondary" onClick={onClose}>取消</button>
          <button className="btn-primary" onClick={() => { if (name) onSave({ name, description: desc }); }}>儲存</button>
        </div>
      </div>
    </Modal>
  );
}

// ---- Shelf Modal ----
function ShelfModal({ shelf, onSave, onClose }: {
  shelf: Shelf | null;
  onSave: (s: Shelf) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Shelf>(shelf || {
    id: genId(), name: '', levels: 4, slots: [], posX: 50, posY: 50, width: 120, height: 60, color: COLORS[0]
  });
  const set = (k: keyof Shelf, v: unknown) => setForm(prev => ({ ...prev, [k]: v }));
  return (
    <Modal title={shelf ? '編輯貨架' : '新增貨架'} onClose={onClose} size="sm">
      <div className="space-y-4">
        <div><label className="form-label">貨架名稱 *</label><input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} /></div>
        <div><label className="form-label">層數</label><input type="number" min={1} max={20} className="input-field" value={form.levels} onChange={e => set('levels', Number(e.target.value))} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="form-label">寬(px)</label><input type="number" min={60} className="input-field" value={form.width} onChange={e => set('width', Number(e.target.value))} /></div>
          <div><label className="form-label">高(px)</label><input type="number" min={40} className="input-field" value={form.height} onChange={e => set('height', Number(e.target.value))} /></div>
        </div>
        <div>
          <label className="form-label">顏色</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c => (
              <button key={c} onClick={() => set('color', c)}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${form.color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button className="btn-secondary" onClick={onClose}>取消</button>
          <button className="btn-primary" onClick={() => { if (form.name) onSave(form); }}>儲存</button>
        </div>
      </div>
    </Modal>
  );
}

// ---- Slot Modal ----
function SlotModal({ shelf, level, products, onSave, onClose }: {
  shelf: Shelf; level: number; products: Product[];
  onSave: (slot: ShelfSlot) => void;
  onClose: () => void;
}) {
  const existing = shelf.slots.find(s => s.level === level);
  const [productId, setProductId] = useState(existing?.productId || '');
  const [specId, setSpecId] = useState(existing?.specId || '');
  const [quantity, setQuantity] = useState(existing?.quantity || 0);
  const [note, setNote] = useState(existing?.note || '');

  const selectedProd = products.find(p => p.id === productId);

  return (
    <Modal title={`設定第 ${level} 層商品`} onClose={onClose} size="md">
      <div className="space-y-4">
        <div>
          <label className="form-label">選擇商品</label>
          <select className="select-field" value={productId} onChange={e => { setProductId(e.target.value); setSpecId(''); }}>
            <option value="">— 請選擇 —</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}（{p.category}）</option>)}
          </select>
        </div>
        {selectedProd && (
          <div>
            <label className="form-label">選擇規格</label>
            <select className="select-field" value={specId} onChange={e => setSpecId(e.target.value)}>
              <option value="">— 請選擇 —</option>
              {selectedProd.specs.map(s => <option key={s.id} value={s.id}>{s.name}（SKU: {s.sku}）庫存:{s.quantity}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="form-label">此貨架位置數量</label>
          <input type="number" min={0} className="input-field" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
        </div>
        <div>
          <label className="form-label">備註</label>
          <input className="input-field" value={note} onChange={e => setNote(e.target.value)} />
        </div>

        {/* Spec info */}
        {specId && selectedProd && (() => {
          const spec = selectedProd.specs.find(s => s.id === specId);
          if (!spec) return null;
          return (
            <div className="bg-blue-50 rounded-lg p-3 text-xs space-y-1">
              <p className="font-semibold text-blue-700">商品資訊</p>
              <div className="grid grid-cols-2 gap-1 text-gray-600">
                <span>原價：{fmtCurrency(spec.originalPrice)}</span>
                <span>特惠價：{fmtCurrency(spec.specialPrice)}</span>
                <span>成本：{fmtCurrency(spec.cost)}</span>
                <span>安全存量：{spec.safetyStock}</span>
                <span>總庫存：{fmtNumber(spec.quantity)}</span>
                <span>單位：{spec.unit}</span>
                <span>淨重：{spec.netWeight}g</span>
                <span>尺寸：{spec.length}×{spec.width}×{spec.height}cm</span>
              </div>
            </div>
          );
        })()}

        <div className="flex gap-2 justify-end">
          <button className="btn-secondary" onClick={onClose}>取消</button>
          <button
            className="btn-primary"
            onClick={() => onSave({
              id: existing?.id || genId(),
              level, productId, specId, quantity, note
            })}
          >儲存</button>
        </div>
      </div>
    </Modal>
  );
}
