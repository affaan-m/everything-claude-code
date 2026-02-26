import { useState } from 'react';
import { useStore } from '../store';
import { genId, today, fmtCurrency, fmtNumber } from '../utils';
import Modal from '../components/Modal';
import type { Product, ProductSpec } from '../types';
import { Plus, Edit3, Trash2, Search, Package, ChevronDown, ChevronRight, AlertTriangle, Download, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore(s => ({
    products: s.products, addProduct: s.addProduct, updateProduct: s.updateProduct, deleteProduct: s.deleteProduct,
  }));
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [expanded, setExpanded] = useState<Record<string,boolean>>({});

  const categories = [...new Set(products.map(p => p.category))];
  const filtered = products.filter(p =>
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()) || p.supplierName.toLowerCase().includes(search.toLowerCase())) &&
    (!catFilter || p.category === catFilter)
  );

  const toggleExpand = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const handleSave = (data: Partial<Product>) => {
    if (editItem) updateProduct(editItem.id, { ...data, updatedAt: new Date().toISOString() });
    else addProduct({ id: genId(), name: '', category: '', supplierName: '', description: '', specs: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data } as Product);
    setShowModal(false); setEditItem(null);
  };

  const exportXLSX = () => {
    const rows = products.flatMap(p => p.specs.map(s => ({
      商品名稱: p.name, 分類: p.category, 廠商: p.supplierName,
      規格名稱: s.name, SKU: s.sku, 原價: s.originalPrice, 特惠價: s.specialPrice,
      成本: s.cost, 安全存量: s.safetyStock, 庫存: s.quantity, 單位: s.unit,
      淨重: s.netWeight, 長: s.length, 寬: s.width, 高: s.height,
    })));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '商品資料');
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `商品資料_${new Date().toLocaleDateString('zh-TW')}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-800 flex-1 flex items-center gap-2"><Package size={22} />商品資料</h1>
        <select className="select-field w-40" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">全部分類</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋商品..." className="input-field pl-9 w-56" /></div>
        <button onClick={exportXLSX} className="btn-success flex items-center gap-1"><Download size={15} />匯出Excel</button>
        <button onClick={() => window.print()} className="btn-secondary flex items-center gap-1 no-print"><Printer size={15} />列印</button>
        <button className="btn-primary flex items-center gap-1" onClick={() => { setEditItem(null); setShowModal(true); }}><Plus size={15} />新增商品</button>
      </div>
      <div className="space-y-2">
        {filtered.length === 0 && <div className="card text-center text-gray-400 py-8">暫無商品</div>}
        {filtered.map(p => {
          const isOpen = expanded[p.id];
          const lowSpecs = p.specs.filter(s => s.quantity <= s.safetyStock);
          return (
            <div key={p.id} className="card p-0 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50" onClick={() => toggleExpand(p.id)}>
                <div className="flex-1 flex items-center gap-3">
                  <Package size={18} className="text-blue-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.category} · {p.supplierName} · {p.specs.length} 個規格</p>
                  </div>
                </div>
                {lowSpecs.length > 0 && <span className="badge badge-red flex items-center gap-1"><AlertTriangle size={11} />{lowSpecs.length}低庫存</span>}
                <div className="flex items-center gap-2 no-print">
                  <button onClick={e => { e.stopPropagation(); setEditItem(p); setShowModal(true); }} className="btn-secondary text-xs py-1 px-2"><Edit3 size={13} /></button>
                  <button onClick={e => { e.stopPropagation(); deleteProduct(p.id); }} className="btn-danger text-xs py-1 px-2"><Trash2 size={13} /></button>
                </div>
                {isOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
              </div>
              {isOpen && (
                <div className="border-t border-gray-100 overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr><th>規格名稱</th><th>SKU</th><th>原價</th><th>特惠價</th><th>成本</th><th>庫存</th><th>安全存量</th><th>單位</th><th>尺寸(cm)</th><th>狀態</th></tr>
                    </thead>
                    <tbody>
                      {p.specs.map(s => (
                        <tr key={s.id}>
                          <td className="font-medium">{s.name}</td>
                          <td className="font-mono text-xs text-gray-500">{s.sku}</td>
                          <td>{fmtCurrency(s.originalPrice)}</td>
                          <td className="text-green-600">{fmtCurrency(s.specialPrice)}</td>
                          <td className="text-red-500">{fmtCurrency(s.cost)}</td>
                          <td className={`font-bold ${s.quantity <= s.safetyStock ? 'text-red-500' : 'text-gray-800'}`}>{fmtNumber(s.quantity)}</td>
                          <td>{fmtNumber(s.safetyStock)}</td>
                          <td>{s.unit}</td>
                          <td className="text-xs text-gray-500">{s.length}×{s.width}×{s.height}</td>
                          <td>{s.quantity <= s.safetyStock ? <span className="badge badge-red">低庫存</span> : <span className="badge badge-green">正常</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showModal && (
        <ProductModal item={editItem} onSave={handleSave} onClose={() => { setShowModal(false); setEditItem(null); }} />
      )}
    </div>
  );
}

function ProductModal({ item, onSave, onClose }: { item: Product | null; onSave: (d: Partial<Product>) => void; onClose: () => void }) {
  const [name, setName] = useState(item?.name || '');
  const [category, setCategory] = useState(item?.category || '');
  const [supplierName, setSupplierName] = useState(item?.supplierName || '');
  const [description, setDescription] = useState(item?.description || '');
  const [specs, setSpecs] = useState<ProductSpec[]>(item?.specs || []);

  const addSpec = () => setSpecs(prev => [...prev, { id: genId(), name: '', sku: '', originalPrice: 0, specialPrice: 0, cost: 0, safetyStock: 0, quantity: 0, unit: '個', netWeight: 0, length: 0, width: 0, height: 0 }]);
  const removeSpec = (id: string) => setSpecs(prev => prev.filter(s => s.id !== id));
  const updateSpec = (id: string, field: string, value: unknown) => setSpecs(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));

  return (
    <Modal title={item ? `編輯商品 - ${item.name}` : '新增商品'} onClose={onClose} size="xl">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="form-label">商品名稱 *</label><input className="input-field" value={name} onChange={e => setName(e.target.value)} /></div>
          <div><label className="form-label">商品分類</label><input className="input-field" value={category} onChange={e => setCategory(e.target.value)} placeholder="如：舍利類、水晶類" /></div>
          <div><label className="form-label">廠商名稱</label><input className="input-field" value={supplierName} onChange={e => setSupplierName(e.target.value)} /></div>
          <div><label className="form-label">描述</label><input className="input-field" value={description} onChange={e => setDescription(e.target.value)} /></div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="form-label mb-0 font-bold text-gray-700">商品規格 ({specs.length} 個)</label>
            <button onClick={addSpec} className="btn-primary text-xs py-1 px-3 flex items-center gap-1"><Plus size={12} />新增規格</button>
          </div>
          {specs.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 text-sm">點擊「新增規格」加入商品規格</div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {specs.map((s, idx) => (
                <div key={s.id} className="border border-gray-200 rounded-xl p-3 space-y-2 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600">規格 {idx+1}</span>
                    <button onClick={() => removeSpec(s.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div><label className="form-label">規格名稱 *</label><input className="input-field text-xs" value={s.name} onChange={e => updateSpec(s.id, 'name', e.target.value)} /></div>
                    <div><label className="form-label">SKU</label><input className="input-field text-xs" value={s.sku} onChange={e => updateSpec(s.id, 'sku', e.target.value)} /></div>
                    <div><label className="form-label">單位</label><input className="input-field text-xs" value={s.unit} onChange={e => updateSpec(s.id, 'unit', e.target.value)} /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div><label className="form-label">原價</label><input type="number" min={0} className="input-field text-xs" value={s.originalPrice} onChange={e => updateSpec(s.id, 'originalPrice', Number(e.target.value))} /></div>
                    <div><label className="form-label">特惠價</label><input type="number" min={0} className="input-field text-xs" value={s.specialPrice} onChange={e => updateSpec(s.id, 'specialPrice', Number(e.target.value))} /></div>
                    <div><label className="form-label">成本</label><input type="number" min={0} className="input-field text-xs" value={s.cost} onChange={e => updateSpec(s.id, 'cost', Number(e.target.value))} /></div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div><label className="form-label">庫存</label><input type="number" min={0} className="input-field text-xs" value={s.quantity} onChange={e => updateSpec(s.id, 'quantity', Number(e.target.value))} /></div>
                    <div><label className="form-label">安全存量</label><input type="number" min={0} className="input-field text-xs" value={s.safetyStock} onChange={e => updateSpec(s.id, 'safetyStock', Number(e.target.value))} /></div>
                    <div><label className="form-label">淨重(g)</label><input type="number" min={0} className="input-field text-xs" value={s.netWeight} onChange={e => updateSpec(s.id, 'netWeight', Number(e.target.value))} /></div>
                    <div><label className="form-label">長×寬×高(cm)</label>
                      <div className="flex gap-1">
                        <input type="number" min={0} className="input-field text-xs" placeholder="長" value={s.length} onChange={e => updateSpec(s.id, 'length', Number(e.target.value))} />
                        <input type="number" min={0} className="input-field text-xs" placeholder="寬" value={s.width} onChange={e => updateSpec(s.id, 'width', Number(e.target.value))} />
                        <input type="number" min={0} className="input-field text-xs" placeholder="高" value={s.height} onChange={e => updateSpec(s.id, 'height', Number(e.target.value))} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 justify-end">
          <button className="btn-secondary" onClick={onClose}>取消</button>
          <button className="btn-primary" onClick={() => { if (name) onSave({ name, category, supplierName, description, specs }); }}>儲存</button>
        </div>
      </div>
    </Modal>
  );
}
