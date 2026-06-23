import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Star,
  ArrowLeftRight, User, ShieldCheck,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const links = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/portfolio',    icon: Briefcase,       label: 'Portfolio'    },
  { to: '/watchlist',   icon: Star,            label: 'Watchlist'   },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Transactions' },
  { to: '/profile',     icon: User,            label: 'Profile'     },
];

const Sidebar = () => {
  const { isAdmin } = useAuth();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-16 lg:w-56
                      bg-slate-900 border-r border-slate-700
                      flex flex-col py-4 z-40">
      <nav className="flex flex-col gap-1 px-2">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg
               transition-colors text-sm font-medium
               ${isActive
                 ? 'bg-primary-600 text-white'
                 : 'text-slate-400 hover:text-white hover:bg-slate-800'
               }`
            }
          >
            <Icon size={18} className="shrink-0" />
            <span className="hidden lg:block">{label}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg
               transition-colors text-sm font-medium mt-4
               ${isActive
                 ? 'bg-yellow-600 text-white'
                 : 'text-yellow-500 hover:bg-slate-800'
               }`
            }
          >
            <ShieldCheck size={18} className="shrink-0" />
            <span className="hidden lg:block">Admin</span>
          </NavLink>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;