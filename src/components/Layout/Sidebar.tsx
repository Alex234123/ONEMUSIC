import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, Search, LogIn, User, Heart } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';

const navItems = [
  { to: '/', icon: Home, label: '为你推荐' },
  { to: '/browse', icon: Compass, label: '浏览' },
  { to: '/search', icon: Search, label: '搜索' },
];

export default function Sidebar() {
  const collapsed = useUIStore((s) => s.isSidebarCollapsed);
  const { isLoggedIn, nickname, avatarUrl, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <aside
      className={`fixed left-3 top-1/2 -translate-y-1/2 z-40 flex flex-col transition-all duration-300 ease-out
        ${collapsed ? 'w-[64px]' : 'w-[180px]'}
        liquid-glass rounded-2xl`}
      style={{ maxHeight: 'calc(100vh - 24px)' }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 h-[72px] border-b border-white/5 shrink-0 ${collapsed ? 'justify-center px-0' : ''}`}>
        {isLoggedIn && avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-white/10" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-red via-brand-purple to-brand-indigo flex items-center justify-center shadow-lg shadow-brand-red/20">
            <User size={18} className="text-white" />
          </div>
        )}
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">ONEMUSIC</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-pill text-sm font-medium transition-all duration-200
              ${collapsed ? 'justify-center px-0' : ''}
              ${isActive
                ? 'bg-brand-red/15 text-brand-red'
                : 'text-text-secondary hover:text-white hover:bg-surface-hover'
              }`
            }
          >
            <Icon size={20} />
            {!collapsed && <span className="whitespace-nowrap">{label}</span>}
          </NavLink>
        ))}
        {/* 个人中心 - 仅登录后显示 */}
        {isLoggedIn && (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-pill text-sm font-medium transition-all duration-200
              ${collapsed ? 'justify-center px-0' : ''}
              ${isActive
                ? 'bg-brand-red/15 text-brand-red'
                : 'text-text-secondary hover:text-white hover:bg-surface-hover'
              }`
            }
          >
            <Heart size={20} />
            {!collapsed && <span className="whitespace-nowrap">个人中心</span>}
          </NavLink>
        )}
      </nav>

      {/* 用户区域 */}
      <div className="border-t border-white/5 shrink-0">
        {isLoggedIn ? (
          <div className={`px-3 py-3 ${collapsed ? 'flex justify-center' : ''}`}>
            <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-brand-red/20 flex items-center justify-center">
                  <User size={16} className="text-brand-red" />
                </div>
              )}
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{nickname || '已登录'}</p>
                  <button
                    onClick={logout}
                    className="text-xs text-text-muted hover:text-brand-red transition-colors"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="px-3 py-2">
            <button
              onClick={() => navigate('/login')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-pill text-sm font-medium text-text-secondary
                hover:text-white hover:bg-surface-hover transition-all duration-200 w-full
                ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <LogIn size={20} />
              {!collapsed && <span>登录</span>}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}