import { useState } from 'react';
import { useStore } from '../store';
import { genId } from '../utils';
import Modal from '../components/Modal';
import type { User, Permission } from '../types';
import { Plus, Edit3, Trash2, Shield, Eye, EyeOff, Key } from 'lucide-react';

const ALL_PERMISSIONS: { key: Permission; label: string; group: string }[] = [
  { key: 'warehouse.view', label: '查看倉庫', group: '倉庫' },
  { key: 'warehouse.edit', label: '編輯倉庫', group: '倉庫' },
  { key: 'warehouse.admin', label: '倉庫管理員', group: '倉庫' },
  { key: 'erp.customer.view', label: '查看客戶', group: '客戶' },
  { key: 'erp.customer.edit', label: '編輯客戶', group: '客戶' },
  { key: 'erp.supplier.view', label: '查看廠商', group: '廠商' },
  { key: 'erp.supplier.edit', label: '編輯廠商', group: '廠商' },
  { key: 'erp.product.view', label: '查看商品', group: '商品' },
  { key: 'erp.product.edit', label: '編輯商品', group: '商品' },
  { key: 'erp.report.view', label: '查看報表', group: '報表' },
  { key: 'admin.users', label: '使用者管理', group: '系統' },
];

const ROLE_LABELS: Record<string, string> = {
  admin: '系統管理員', manager: '管理員', staff: '員工', viewer: '唯讀',
};

export default function SettingsPage() {
  const { users, currentUser, addUser, updateUser, deleteUser } = useStore(s => ({
    users: s.users, currentUser: s.currentUser,
    addUser: s.addUser, updateUser: s.updateUser, deleteUser: s.deleteUser,
  }));

  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'profile'>('users');

  const isAdmin = currentUser?.role === 'admin' || currentUser?.permissions.includes('admin.users');

  const handleSave = (data: Partial<User> & { id?: string }) => {
    if (editUser) {
      updateUser(editUser.id, data);
    } else {
      addUser({ id: genId(), username: '', password: '', name: '', role: 'staff', permissions: [], active: true, createdAt: new Date().toISOString(), ...data });
    }
    setShowModal(false);
    setEditUser(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">系統設定</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {[['users','使用者管理'],['profile','個人資料']] as const}.map(([t, l]) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">使用者帳號管理</h2>
            {isAdmin && (
              <button className="btn-primary flex items-center gap-1" onClick={() => { setEditUser(null); setShowModal(true); }}>
                <Plus size={15} />新增使用者
              </button>
            )}
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>帳號</th><th>姓名</th><th>角色</th><th>狀態</th><th>權限數</th><th>操作</th></tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="font-mono text-sm">{user.username}</td>
                    <td className="font-medium">{user.name}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'badge-red' : user.role === 'manager' ? 'badge-blue' : 'badge-gray'}`}>
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.active ? 'badge-green' : 'badge-red'}`}>
                        {user.active ? '啟用' : '停用'}
                      </span>
                    </td>
                    <td>{user.permissions.length} 項</td>
                    <td>
                      {isAdmin && user.id !== currentUser?.id && (
                        <div className="flex gap-1">
                          <button onClick={() => { setEditUser(user); setShowModal(true); }} className="btn-secondary text-xs py-1 px-2"><Edit3 size={13} /></button>
                          <button onClick={() => deleteUser(user.id)} className="btn-danger text-xs py-1 px-2"><Trash2 size={13} /></button>
                        </div>
                      )}
                      {user.id === currentUser?.id && <span className="text-xs text-gray-400">（自己）</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'profile' && currentUser && (
        <ProfileTab user={currentUser} onSave={(data) => updateUser(currentUser.id, data)} />
      )}

      {showModal && (
        <UserModal
          user={editUser}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditUser(null); }}
        />
      )}
    </div>
  );
}

function ProfileTab({ user, onSave }: { user: User; onSave: (data: Partial<User>) => void }) {
  const [name, setName] = useState(user.name);
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = () => {
    if (pw && pw !== pw2) { setMsg('兩次密碼不一致'); return; }
    const upd: Partial<User> = { name };
    if (pw) upd.password = pw;
    onSave(upd);
    setMsg('已儲存');
    setPw(''); setPw2('');
    setTimeout(() => setMsg(''), 2000);
  };

  return (
    <div className="card max-w-md space-y-4">
      <h2 className="section-title">個人資料</h2>
      <div>
        <label className="form-label">帳號</label>
        <p className="input-field bg-gray-50 text-gray-500">{user.username}</p>
      </div>
      <div>
        <label className="form-label">姓名</label>
        <input className="input-field" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label className="form-label flex items-center gap-1"><Key size={13} />變更密碼（留空不變）</label>
        <div className="relative">
          <input type={showPw ? 'text' : 'password'} className="input-field pr-9" value={pw} onChange={e => setPw(e.target.value)} placeholder="新密碼" />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPw(!showPw)}>
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>
      {pw && (
        <div>
          <label className="form-label">確認密碼</label>
          <input type="password" className="input-field" value={pw2} onChange={e => setPw2(e.target.value)} placeholder="再次輸入密碼" />
        </div>
      )}
      {msg && <p className={`text-sm ${msg.includes('不一致') ? 'text-red-500' : 'text-green-600'}`}>{msg}</p>}
      <button className="btn-primary" onClick={handleSave}>儲存變更</button>
    </div>
  );
}

function UserModal({ user, onSave, onClose }: {
  user: User | null;
  onSave: (data: Partial<User>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    username: user?.username || '',
    name: user?.name || '',
    password: '',
    role: user?.role || 'staff' as User['role'],
    active: user?.active ?? true,
    permissions: user?.permissions || [] as Permission[],
  });
  const [showPw, setShowPw] = useState(false);
  const setField = (k: string, v: unknown) => setForm(prev => ({ ...prev, [k]: v }));

  const togglePerm = (p: Permission) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(p)
        ? prev.permissions.filter(x => x !== p)
        : [...prev.permissions, p]
    }));
  };

  const setAllPerms = (role: User['role']) => {
    const adminPerms: Permission[] = ['warehouse.view','warehouse.edit','warehouse.admin','erp.customer.view','erp.customer.edit','erp.supplier.view','erp.supplier.edit','erp.product.view','erp.product.edit','erp.report.view','admin.users'];
    const managerPerms: Permission[] = ['warehouse.view','warehouse.edit','erp.customer.view','erp.customer.edit','erp.supplier.view','erp.supplier.edit','erp.product.view','erp.product.edit','erp.report.view'];
    const staffPerms: Permission[] = ['warehouse.view','erp.customer.view','erp.supplier.view','erp.product.view'];
    const viewerPerms: Permission[] = ['warehouse.view','erp.customer.view','erp.product.view'];
    const permsMap = { admin: adminPerms, manager: managerPerms, staff: staffPerms, viewer: viewerPerms };
    setForm(prev => ({ ...prev, role, permissions: permsMap[role] || [] }));
  };

  const groups = [...new Set(ALL_PERMISSIONS.map(p => p.group))];

  return (
    <Modal title={user ? '編輯使用者' : '新增使用者'} onClose={onClose} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="form-label">帳號 *</label><input className="input-field" value={form.username} onChange={e => setField('username', e.target.value)} /></div>
          <div><label className="form-label">姓名 *</label><input className="input-field" value={form.name} onChange={e => setField('name', e.target.value)} /></div>
        </div>
        <div>
          <label className="form-label flex items-center gap-1"><Key size={13} />{user ? '密碼（留空不變）' : '密碼 *'}</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} className="input-field pr-9" value={form.password} onChange={e => setField('password', e.target.value)} />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPw(!showPw)}>
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">角色</label>
            <select className="select-field" value={form.role} onChange={e => setAllPerms(e.target.value as User['role'])}>
              <option value="admin">系統管理員</option>
              <option value="manager">管理員</option>
              <option value="staff">員工</option>
              <option value="viewer">唯讀</option>
            </select>
          </div>
          <div>
            <label className="form-label">狀態</label>
            <select className="select-field" value={form.active ? '1' : '0'} onChange={e => setField('active', e.target.value === '1')}>
              <option value="1">啟用</option>
              <option value="0">停用</option>
            </select>
          </div>
        </div>

        {/* Permissions */}
        <div>
          <label className="form-label flex items-center gap-1"><Shield size={13} />細部權限設定</label>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            {groups.map(group => (
              <div key={group} className="border-b border-gray-100 last:border-b-0">
                <div className="px-3 py-1.5 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">{group}</div>
                <div className="grid grid-cols-2 gap-1 p-2">
                  {ALL_PERMISSIONS.filter(p => p.group === group).map(p => (
                    <label key={p.key} className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={form.permissions.includes(p.key)}
                        onChange={() => togglePerm(p.key)}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button className="btn-secondary" onClick={onClose}>取消</button>
          <button
            className="btn-primary"
            onClick={() => {
              if (!form.username || !form.name) return;
              if (!user && !form.password) return;
              const upd: Partial<User> = { username: form.username, name: form.name, role: form.role, active: form.active, permissions: form.permissions };
              if (form.password) upd.password = form.password;
              onSave(upd);
            }}
          >儲存</button>
        </div>
      </div>
    </Modal>
  );
}
