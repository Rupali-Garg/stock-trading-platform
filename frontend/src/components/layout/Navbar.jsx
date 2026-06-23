import { Link } from 'react-router-dom';
import { TrendingUp, LogOut, User } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50
                    bg-slate-900 border-b border-slate-700 h-16">
      <div className="max-w-7xl mx-auto px-4 h-full
                      flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard"
              className="flex items-center gap-2 font-bold text-xl">
          <TrendingUp className="text-primary-500" size={24} />
          <span className="text-white">StockApp</span>
        </Link>

        {/* User info + logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-600
                            flex items-center justify-center">
              <User size={14} />
            </div>
            <div>
              <p className="text-sm font-medium text-white leading-none">
                {user?.name}
              </p>
              <p className="text-xs text-slate-400 capitalize">
                {user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400
                       hover:text-white transition-colors text-sm"
          >
            <LogOut size={16} />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;