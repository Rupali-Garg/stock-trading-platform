import { useState, useEffect } from 'react';
import api from '../services/api';
import Spinner from '../components/common/Spinner';
import StatCard from '../components/common/StatCard';
import { formatCurrency } from '../utils/formatCurrency';
import { ShieldCheck } from 'lucide-react';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [aRes, uRes] = await Promise.all([
          api.get('/admin/analytics'),
          api.get('/admin/users'),
        ]);
        setAnalytics(aRes.data.data);
        setUsers(uRes.data.data.users || []);
      } catch {}
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  if (loading) return <Spinner text="Loading admin data..." />;

  const buyData  = analytics?.transactionBreakdown
    ?.find((t) => t._id === 'BUY');
  const sellData = analytics?.transactionBreakdown
    ?.find((t) => t._id === 'SELL');

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <ShieldCheck className="text-yellow-400" size={28} />
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users"
                  value={analytics?.totalUsers || 0}
                  color="blue" />
        <StatCard label="Total Transactions"
                  value={analytics?.totalTransactions || 0}
                  color="white" />
        <StatCard label="Total Buy Volume"
                  value={formatCurrency(buyData?.totalVolume || 0)}
                  color="green" />
        <StatCard label="Total Sell Volume"
                  value={formatCurrency(sellData?.totalVolume || 0)}
                  color="red" />
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">
          Recent Platform Transactions
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                {['User','Stock','Type','Amount','Date'].map((h) => (
                  <th key={h}
                      className={`pb-3 font-medium
                        ${h==='User'||h==='Stock'
                          ? 'text-left' : 'text-right'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analytics?.recentTransactions?.map((tx) => (
                <tr key={tx._id}
                    className="border-b border-slate-700/50 py-3">
                  <td className="py-3 text-slate-300">
                    {tx.userId?.name || 'Unknown'}
                  </td>
                  <td className="py-3 text-white font-medium">
                    {tx.symbol}
                  </td>
                  <td className={`py-3 text-right font-medium
                    ${tx.type==='BUY' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type}
                  </td>
                  <td className="py-3 text-white text-right">
                    {formatCurrency(tx.totalAmount)}
                  </td>
                  <td className="py-3 text-slate-400 text-right">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">
          Registered Users ({users.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                {['Name','Email','Role','Joined'].map((h) => (
                  <th key={h}
                      className={`pb-3 font-medium
                        ${h==='Name'||h==='Email'
                          ? 'text-left' : 'text-right'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}
                    className="border-b border-slate-700/50">
                  <td className="py-3 text-white">{u.name}</td>
                  <td className="py-3 text-slate-300">{u.email}</td>
                  <td className="py-3 text-right capitalize text-slate-300">
                    {u.role}
                  </td>
                  <td className="py-3 text-slate-400 text-right">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;