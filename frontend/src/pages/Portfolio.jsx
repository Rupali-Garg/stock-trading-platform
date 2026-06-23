import { useState } from 'react';
import usePortfolio from '../hooks/usePortfolio';
import Spinner from '../components/common/Spinner';
import HoldingRow from '../components/portfolio/HoldingRow';
import BuyStockModal from '../components/portfolio/BuyStockModal';
import SellStockModal from '../components/portfolio/SellStockModal';
import StatCard from '../components/common/StatCard';
import { formatCurrency, formatPercent } from '../utils/formatCurrency';

const Portfolio = () => {
  const { portfolio, summary, loading, buyStock, sellStock } = usePortfolio();
  const [buyModal, setBuyModal]   = useState(null);
  const [sellModal, setSellModal] = useState(null);
  const [tradeLoading, setTradeLoading] = useState(false);

  const handleBuy = async (symbol, qty, price) => {
    setTradeLoading(true);
    const ok = await buyStock(symbol, qty, price);
    setTradeLoading(false);
    return ok;
  };

  const handleSell = async (symbol, qty, price) => {
    setTradeLoading(true);
    const ok = await sellStock(symbol, qty, price);
    setTradeLoading(false);
    return ok;
  };

  if (loading) return <Spinner text="Loading portfolio..." />;

  const sum = summary?.summary || {};
  const holdings = portfolio?.holdings || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Portfolio</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Invested"
                  value={formatCurrency(sum.totalInvested)} />
        <StatCard label="Current Value"
                  value={formatCurrency(sum.totalCurrentValue)}
                  color="blue" />
        <StatCard label="Total P&L"
                  value={formatCurrency(sum.totalProfitLoss)}
                  sub={formatPercent(sum.totalProfitLossPercent)}
                  color={(sum.totalProfitLoss || 0) >= 0 ? 'green' : 'red'} />
        <StatCard label="Holdings"
                  value={holdings.length}
                  color="yellow" />
      </div>

      {/* Holdings Table */}
      <div className="card p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Your Holdings</h2>
        </div>

        {holdings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg">No holdings yet</p>
            <p className="text-slate-500 text-sm mt-1">
              Go to Watchlist to buy your first stock
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-slate-400 text-xs uppercase
                               border-b border-slate-700">
                  {['Stock', 'Qty', 'Avg Price', 'Current',
                    'Value', 'P&L', 'Actions'].map((h) => (
                    <th key={h}
                        className={`py-3 px-4 font-medium
                          ${h === 'Stock' ? 'text-left' : 'text-right'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => (
                  <HoldingRow
                    key={h.symbol}
                    holding={h}
                    onBuy={() => setBuyModal(h)}
                    onSell={() => setSellModal(h)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {buyModal && (
        <BuyStockModal
          stock={buyModal}
          onBuy={handleBuy}
          onClose={() => setBuyModal(null)}
          loading={tradeLoading}
        />
      )}
      {sellModal && (
        <SellStockModal
          holding={sellModal}
          onSell={handleSell}
          onClose={() => setSellModal(null)}
          loading={tradeLoading}
        />
      )}
    </div>
  );
};

export default Portfolio;