import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import {
  LayoutDashboard, Warehouse, Package, Users, Truck,
  BarChart3, Settings, LogOut, ChevronDown, ChevronRight,
  Menu, X, ShoppingCart, FileText, DollarSign, RotateCcw,
  ArrowLeftRight, Sliders, Layers
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { label: '儀表板', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
  { label: '倉庫地圖', icon: <Warehouse size={18} />, path: '/warehouse' },
  {
    label: '客戶管理', icon: <Users size={18} />,
    children: [
      { label: '客戶資料', icon: <Users size={16} />, path: '/customers' },
      { label: '報價單', icon: <FileText size={16} />, path: '/quotations' },
      { label: '訂單', icon: <ShoppingCart size={16} />, path: '/sales-orders' },
      { label: '銷貨單', icon: <DollarSign size={16} />, path: '/sales-invoices' },
      { label: '收款', icon: <DollarSign size={16} />, path: '/receipts' },
      { label: '銷貨退回', icon: <RotateCcw size={16} />, path: '/sales-returns' },
      { label: '其它收入', icon: <DollarSign size={16} />, path: '/other-income' },
    ],
  },
  {
    label: '廠商管理', icon: <Truck size={18} />,
    children: [
      { label: '廠商資料', icon: <Truck size={16} />, path: '/suppliers' },
      { label: '採購單', icon: <FileText size={16} />, path: '/purchase-orders' },
      { label: '進貨單', icon: <Package size={16} />, path: '/purchase-invoices' },
      { label: '付款', icon: <DollarSign size={16} />, path: '/payments' },
      { label: '進貨退回', icon: <RotateCcw size={16} />, path: '/purchase-returns' },
      { label: '其它支出', icon: <DollarSign size={16} />, path: '/other-expenses' },
    ],
  },
  {
    label: '商品管理', icon: <Package size={18} />,
    children: [
      { label: '商品資料', icon: <Package size={16} />, path: '/products' },
      { label: '調撥商品', icon: <ArrowLeftRight size={16} />, path: '/stock-transfers' },
      { label: '調整商品', icon: <Sliders size={16} />, path: '/stock-adjustments' },
      { label: '組合/拆解單', icon: <Layers size={16} />, path: '/bundle-orders' },
    ],
  },
  { label: '報表', icon: <BarChart3 size={18} />, path: '/reports' },
  { label: '系統設定', icon: <Settings size={18} />, path: '/settings' },
];

export default function Layout() {
  const { currentUser, logout } = useStore(s => ({ currentUser: s.currentUser, logout: s.logout }));
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleGroup = (label: string) => {
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-56' : 'w-0'} transition-all duration-200 bg-white border-r border-gray-200 flex flex-col overflow-hidden shrink-0`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Warehouse size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-800 text-sm leading-tight">倉庫ERP</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {navItems.map(item => (
            <div key={item.label}>
              {item.path ? (
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              ) : (
                <>
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className="sidebar-link w-full flex justify-between"
                  >
                    <span className="flex items-center gap-2.5">
                      {item.icon}
                      <span className="text-sm">{item.label}</span>
                    </span>
                    {collapsed[item.label] ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {!collapsed[item.label] && (
                    <div className="ml-3 pl-3 border-l border-gray-200 mt-0.5 space-y-0.5">
                      {item.children?.map(child => (
                        <NavLink
                          key={child.label}
                          to={child.path!}
                          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        >
                          {child.icon}
                          <span className="text-sm">{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
              {currentUser?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{currentUser?.name}</p>
              <p className="text-xs text-gray-400 truncate">{currentUser?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600">
            <LogOut size={15} />
            <span className="text-sm">登出</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="text-sm font-semibold text-gray-700">倉庫管理系統</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
