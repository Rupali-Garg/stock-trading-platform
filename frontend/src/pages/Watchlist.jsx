import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, X, TrendingUp, TrendingDown } from 'lucide-react';
import watchlistService from '../services/watchlistService';
import Spinner from '../components/common/Spinner';
import BuyStockModal from '../components/portfolio/BuyStockModal';
import usePortfolio from '../hooks/usePortfolio';
import toast from 'react-hot-toast';
import { formatCurrency, formatPercent } from '../utils/formatCurrency';

const Watchlist = () => {
  const { buyStock } = usePortfolio();

  const [watchlist,      setWatchlist]      = useState([]);
  const [searchResults,  setSearchResults]  = useState([]);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [loading,        setLoading]        = useState(true);
  const [searching,      setSearching]      = useState(false);
  const [buyModal,       setBuyModal]       = useState(null);
  const [tradeLoading,   setTradeLoading]   = useState(false);

  // Load watchlist on mount
  useEffect(() => {
    fetchWatchlist();
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(() => searchStocks(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const res = await watchlistService.getWatchlist();
      setWatchlist(res.data.data.enrichedStocks || []);
    } catch {
      toast.error('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  const searchStocks = async (q) => {
    try {
      setSearching(true);
      const res = await watchlistService.searchStocks(q);
      setSearchResults(res.data.data || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async (symbol) => {
    try {
      await watchlistService.addStock(symbol);
      toast.success(`${symbol} added to watchlist`);
      setSearchQuery('');
      setSearchResults([]);
      fetchWatchlist();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add stock');
    }
  };

  const handleRemove = async (symbol) => {
    try {
      await watchlistService.removeStock(symbol);
      toast.success(`${symbol} removed`);
      setWatchlist((prev) => prev.filter((s) => s.symbol !== symbol));
    } catch {
      toast.error('Failed to remove stock');
    }
  };

  const handleBuy = async (symbol, qty, price) => {
    setTradeLoading(true);
    const ok = await buyStock(symbol, qty, price);
    setTradeLoading(false);
    return ok;
  };

  if (loading) return <Spinner text="Loading watchlist..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Watchlist</h1>

      {/* Search Bar */}
      <div className="card">
        <p className="text-slate-300 font-medium mb-3">Search & Add Stocks</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2
                             text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by symbol or company name..."
            className="input pl-10"
          />
        </div>

        {/* Search Results Dropdown */}
        {(searchResults.length > 0 || searching) && (
          <div className="mt-2 bg-slate-700 rounded-lg border
                          border-slate-600 overflow-hidden">
            {searching ? (
              <div className="p-4 text-center text-slate-400 text-sm">
                Searching...
              </div>
            ) : (
              searchResults.map((stock) => (
                <div key={stock.symbol}
                     className="flex items-center justify-between
                                p-3 hover:bg-slate-600 transition-colors
                                border-b border-slate-600 last:border-0">
                  <div>
                    <span className="font-semibold text-white text-sm">
                      {stock.symbol}
                    </span>
                    <span className="text-slate-400 text-xs ml-2">
                      {stock.companyName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white text-sm">
                      {formatCurrency(stock.currentPrice)}
                    </span>
                    <button
                      onClick={() => handleAdd(stock.symbol)}
                      className="text-xs bg-primary-600/20 text-primary-400
                                 hover:bg-primary-600/40 px-3 py-1.5
                                 rounded-lg flex items-center gap-1"
                    >
                      <Plus size={12} /> Add
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Watchlist Stocks */}
      {watchlist.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-slate-400 text-lg">Your watchlist is empty</p>
          <p className="text-slate-500 text-sm mt-1">
            Search for stocks above to add them
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {watchlist.map((stock) => {
            const isUp = (stock.dayChangePercent || 0) >= 0;
            return (
              <div key={stock.symbol} className="card hover:border-slate-600
                                                 transition-colors">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-white text-lg">
                      {stock.symbol}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {stock.companyName}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(stock.symbol)}
                    className="text-slate-500 hover:text-red-400
                               transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Price */}
                <p className="text-2xl font-bold text-white mb-1">
                  {formatCurrency(stock.currentPrice)}
                </p>

                {/* Day Change */}
                <div className={`flex items-center gap-1 text-sm mb-4
                  ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                  {isUp
                    ? <TrendingUp size={14} />
                    : <TrendingDown size={14} />
                  }
                  <span>
                    {isUp ? '+' : ''}{stock.dayChange?.toFixed(2)} (
                    {formatPercent(stock.dayChangePercent)}) today
                  </span>
                </div>

                {/* Since Added */}
                {stock.priceWhenAdded > 0 && (
                  <p className="text-slate-500 text-xs mb-4">
                    Since added:{' '}
                    <span className={stock.changeFromAddedPercent >= 0
                                     ? 'text-green-400' : 'text-red-400'}>
                      {formatPercent(stock.changeFromAddedPercent)}
                    </span>
                  </p>
                )}

                {/* Buy Button */}
                <button
                  onClick={() => setBuyModal(stock)}
                  className="btn-primary w-full text-sm py-2"
                >
                  Buy {stock.symbol}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Buy Modal */}
      {buyModal && (
        <BuyStockModal
          stock={buyModal}
          onBuy={handleBuy}
          onClose={() => setBuyModal(null)}
          loading={tradeLoading}
        />
      )}
    </div>
  );
};

export default Watchlist;