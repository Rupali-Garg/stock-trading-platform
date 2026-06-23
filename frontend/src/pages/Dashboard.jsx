import { TrendingUp, TrendingDown, Briefcase, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import usePortfolio from '../hooks/usePortfolio';
import useAuth from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';
import StatCard from '../components/common/StatCard';
import { formatCurrency, formatPercent } from '../utils/formatCurrency';

const Dashboard = () => {
  const { user } = useAuth();
  const { portfolio, summary, loading, error, refresh } = usePortfolio();

  if (loading) return <Spinner text="Loading dashboard..." />;

  const sum = summary?.summary || {};
  const isProfit = (sum.totalProfitLoss || 0) >= 0;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400 mt-1">
          Here is your portfolio overview
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Invested"
          value={formatCurrency(sum.totalInvested)}
          color="white"
        />
        <StatCard
          label="Current Value"
          value={formatCurrency(sum.totalCurrentValue)}
          color="blue"
        />
        <StatCard
          label="Total P&L"
          value={formatCurrency(sum.totalProfitLoss)}
          sub={formatPercent(sum.totalProfitLossPercent)}
          color={isProfit ? 'green' : 'red'}
        />
        <StatCard
          label="Stocks Held"
          value={sum.totalStocks || 0}
          sub={`${sum.totalShares || 0} total shares`}
          color="yellow"
        />
      </div>

      {/* Holdings + Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Holdings */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white text-lg">
              Your Holdings
            </h2>
            <Link to="/portfolio"
                  className="text-primary-400 text-sm hover:underline">
              View All →
            </Link>
          </div>

          {portfolio?.holdings?.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="mx-auto text-slate-600 mb-3"
                         size={40} />
              <p className="text-slate-400">No holdings yet</p>
              <Link to="/watchlist"
                    className="btn-primary text-sm mt-4 inline-block">
                Browse Stocks
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {portfolio?.holdings?.slice(0, 5).map((h) => (
                <div key={h.symbol}
                     className="flex items-center justify-between
                                p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="font-semibold text-white">{h.symbol}</p>
                    <p className="text-slate-400 text-xs">
                      {h.quantity} shares
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">
                      {formatCurrency(h.currentValue)}
                    </p>
                    <p className={`text-xs font-medium
                      ${h.profitLoss >= 0
                        ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPercent(h.profitLossPercent)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top/Worst Performers */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-green-400" />
              Top Performers
            </h3>
            {summary?.topPerformers?.length === 0 ? (
              <p className="text-slate-500 text-sm">No data</p>
            ) : (
              summary?.topPerformers?.map((s) => (
                <div key={s.symbol}
                     className="flex justify-between items-center
                                py-2 border-b border-slate-700 last:border-0">
                  <span className="text-white font-medium text-sm">
                    {s.symbol}
                  </span>
                  <span className="text-green-400 text-sm font-medium">
                    {formatPercent(s.profitLossPercent)}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="card">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingDown size={16} className="text-red-400" />
              Worst Performers
            </h3>
            {summary?.worstPerformers?.length === 0 ? (
              <p className="text-slate-500 text-sm">No data</p>
            ) : (
              summary?.worstPerformers?.map((s) => (
                <div key={s.symbol}
                     className="flex justify-between items-center
                                py-2 border-b border-slate-700 last:border-0">
                  <span className="text-white font-medium text-sm">
                    {s.symbol}
                  </span>
                  <span className="text-red-400 text-sm font-medium">
                    {formatPercent(s.profitLossPercent)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;