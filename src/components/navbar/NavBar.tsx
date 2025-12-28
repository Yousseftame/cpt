import { Menu, Bell, Search, User } from 'lucide-react';
import { useAuth } from '../../store/AuthContext/AuthContext';

interface NavBarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export default function NavBar({ isOpen, setIsOpen }: NavBarProps) {
  const { user } = useAuth();

  

  return (
    <header className={`fixed top-0 right-0 h-16 bg-white border-b border-gray-200 z-30 transition-all duration-300 ${
      isOpen ? 'left-64' : 'left-0 lg:left-20'
    }`}>
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} className="text-gray-700" />
          </button>

          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg w-80">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm w-full text-gray-700"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={22} className="text-gray-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-700">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-500"> { localStorage.getItem('userName') || 'User' }</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.email?.[0].toUpperCase() || <User size={20} />}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}