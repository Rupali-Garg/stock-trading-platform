import useAuth from '../hooks/useAuth';
import { User, Mail, Shield, Calendar } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  const details = [
    { icon: User,     label: 'Full Name', value: user?.name     },
    { icon: Mail,     label: 'Email',     value: user?.email    },
    { icon: Shield,   label: 'Role',      value: user?.role     },
    { icon: Calendar, label: 'Joined',
      value: user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US',{
            year: 'numeric', month: 'long', day: 'numeric'
          })
        : '—'
    },
  ];

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold text-white">Profile</h1>

      {/* Avatar + Name */}
      <div className="card text-center">
        <div className="w-20 h-20 rounded-full bg-primary-600
                        flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold text-white">
            {user?.name?.charAt(0)?.toUpperCase()}
          </span>
        </div>
        <h2 className="text-xl font-bold text-white">{user?.name}</h2>
        <p className="text-slate-400 text-sm capitalize mt-1">
          {user?.role} account
        </p>
      </div>

      {/* Details */}
      <div className="card space-y-5">
        {details.map(({ icon: Icon, label, value }) => (
          <div key={label}
               className="flex items-center gap-4 pb-5
                          border-b border-slate-700 last:border-0 last:pb-0">
            <div className="w-9 h-9 rounded-lg bg-slate-700
                            flex items-center justify-center shrink-0">
              <Icon size={16} className="text-primary-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">{label}</p>
              <p className="text-white font-medium capitalize">
                {value || '—'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;