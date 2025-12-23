import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
   
  X, 
  LayoutDashboard, 
  Settings, 
  Users, 
  FileText, 
  Ticket, 
  ShieldCheck,
  ChevronDown,
  LogOut,
  Cpu
} from 'lucide-react';
import { useAuth } from '../../store/AuthContext/AuthContext';

interface SideBarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  path?: string;
  roles: string[];
  subItems?: { label: string; path: string }[];
  badge?: string;
}

export default function SideBar({ isOpen, setIsOpen }: SideBarProps) {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      roles: ['admin', 'superAdmin']
    },
    {
      id: 'models',
      label: 'Generator Models',
      icon: Cpu,
      roles: ['admin', 'superAdmin'],
      subItems: [
        { label: 'All Models', path: '/models' },
        { label: 'Add Model', path: '/models/add' }
      ]
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      roles: ['admin', 'superAdmin'],
      subItems: [
        { label: 'All Customers', path: '/customer' },
        { label: 'Add Customer', path: '/customers' }
      ]
    },
    {
      id: 'requests',
      label: 'Purchase Requests',
      icon: FileText,
      path: '/requests',
      roles: ['admin', 'superAdmin']
    },
    {
      id: 'tickets',
      label: 'Tickets',
      icon: Ticket,
      path: '/ticket',
      roles: ['admin', 'superAdmin']
    },
    {
      id: 'adminRole',
      label: 'Admin Management',
      icon: ShieldCheck,
      path: '/adminRole',
      roles: ['superAdmin']
    }
  ];

  const toggleSubmenu = (id: string) => {
    setExpandedMenu(expandedMenu === id ? null : id);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(role || '')
  );

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 z-50 ${
          isOpen ? 'w-64' : 'w-0 lg:w-20'
        } overflow-hidden`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className={`flex items-center gap-3 ${!isOpen && 'lg:justify-center'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Settings className="w-6 h-6" />
            </div>
            {isOpen && (
              <div>
                <h1 className="font-bold text-lg">CPT</h1>
                <p className="text-xs text-slate-400">Admin Panel</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* User Role Badge */}
        {isOpen && (
          <div className="p-4">
            <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
              role === 'superAdmin' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                : 'bg-gradient-to-r from-blue-600 to-cyan-600'
            }`}>
              {role === 'superAdmin' ? ' Super Admin' : ' Admin'}
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const hasSubmenu = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedMenu === item.id;
            const active = isActive(item.path);

            return (
              <div key={item.id}>
                <button
                  onClick={() => hasSubmenu ? toggleSubmenu(item.id) : handleNavigation(item.path!)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                    !isOpen && 'lg:justify-center'
                  } ${active ? 'bg-indigo-600' : 'hover:bg-slate-700/50'}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                    {isOpen && (
                      <span className={`text-sm font-medium ${active ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                        {item.label}
                      </span>
                    )}
                  </div>
                  {isOpen && (
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {hasSubmenu && (
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </div>
                  )}
                </button>

                {/* Submenu */}
                {hasSubmenu && isExpanded && isOpen && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.subItems!.map((subItem, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleNavigation(subItem.path)}
                        className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-colors ${
                          isActive(subItem.path) 
                            ? 'bg-indigo-600/50 text-white' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                        }`}
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer - Logout */}
        {isOpen && (
          <div className="p-4 border-t border-slate-700">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}