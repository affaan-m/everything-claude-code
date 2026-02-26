import { useState } from 'react';
import { useStore } from '../store';
import { Lock, User, Warehouse } from 'lucide-react';

export default function LoginPage() {
  const login = useStore(s => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const ok = login(username, password);
      if (!ok) setError('帳號或密碼錯誤');
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
            <Warehouse className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white">倉庫管理系統</h1>
          <p className="text-blue-200 mt-1 text-sm">Warehouse & ERP Management</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">登入帳號</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">帳號</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="input-field pl-9"
                  placeholder="請輸入帳號"
                  autoComplete="username"
                  required
                />
              </div>
            </div>
            <div>
              <label className="form-label">密碼</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pl-9"
                  placeholder="請輸入密碼"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center text-base py-3"
            >
              {loading ? '登入中...' : '登入'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-6">
            預設帳號：admin / 密碼：admin123
          </p>
        </div>
      </div>
    </div>
  );
}
