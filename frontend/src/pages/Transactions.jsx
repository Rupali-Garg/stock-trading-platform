import { useState, useEffect } from 'react';
import portfolioService from '../services/portfolioService';
import Spinner from '../components/common/Spinner';
import { formatCurrency } from '../utils/formatCurrency';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const Transactions = () => {
  const [data,    setData]    = useState({ transactions: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('ALL');
  const [page,    setPage]    = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [page, filter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (filter !== 'ALL') params.type = filter;
      const res = await portfolioService.getTransactions(params);
      setData(res.data.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const { transactions = [], pagination = {} } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Transactions</h1>
        {/* Filter Tabs */}
        <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
          {['ALL', 'BUY', 'SELL'].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium
                         transition-colors
                ${filter === f
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-400 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <Spinner text="Loading transactions..." />
        ) : transactions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400">No transactions found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase
                                 border-b border-slate-700">
                    {['Type','Stock','Qty','Price','Total','Date'].map((h) => (
                      <th key={h}
                          className={`py-3 px-4 font-medium
                            ${h==='Type'||h==='Stock'
                              ? 'text-left' : 'text-right'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id}
                        className="border-b border-slate-700/50
                                   hover:bg-slate-700/20 transition-colors">
                      <td className="py-4 px-4">
                        <span className={`flex items-center gap-1.5
                          text-sm font-semibold
                          ${tx.type === 'BUY'
                            ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.type === 'BUY'
                            ? <ArrowUpCircle size={15} />
                            : <ArrowDownCircle size={15} />
                          }
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-white font-medium text-sm">
                          {tx.symbol}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {tx.companyName}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-white text-right text-sm">
                        {tx.quantity}
                      </td>
                      <td className="py-4 px-4 text-slate-300
                                     text-right text-sm">
                        {formatCurrency(tx.price)}
                      </td>
                      <td className="py-4 px-4 text-white font-medium
                                     text-right text-sm">
                        {formatCurrency(tx.totalAmount)}
                      </td>
                      <td className="py-4 px-4 text-slate-400
                                     text-right text-xs">
                        {new Date(tx.createdAt).toLocaleDateString('en-US',{
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between
                            px-6 py-4 border-t border-slate-700">
              <p className="text-slate-400 text-sm">
                {pagination.total} total transactions
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="btn-secondary text-sm py-1.5 px-3
                             disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span className="text-slate-400 text-sm px-2 flex
                                  items-center">
                  {page} / {pagination.pages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage}
                  className="btn-secondary text-sm py-1.5 px-3
                             disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Transactions;