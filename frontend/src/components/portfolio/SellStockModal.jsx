import { useState } from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

const SellStockModal = ({ holding, onSell, onClose, loading }) => {
  const [quantity, setQuantity] = useState('');
  const [price, setPrice]       = useState(holding?.currentPrice || '');

  const totalReceived = quantity && price
    ? (Number(quantity) * Number(price)).toFixed(2)
    : 0;

  const pl = quantity && price
    ? ((price - holding.averageBuyPrice) * quantity).toFixed(2)
    : 0;

  const handleSubmit = async () => {
    if (!quantity || !price || quantity <= 0) return;
    if (Number(quantity) > holding.quantity) return;
    const success = await onSell(holding.symbol, quantity, price);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center
                    justify-center z-50 p-4">
      <div className="card w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">
              Sell {holding?.symbol}
            </h2>
            <p className="text-slate-400 text-sm">
              Owned: {holding?.quantity} shares
            </p>
          </div>
          <button onClick={onClose}
                  className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-700 rounded-lg p-3">
            <p className="text-slate-400 text-xs">Avg Buy Price</p>
            <p className="text-white font-semibold">
              {formatCurrency(holding?.averageBuyPrice)}
            </p>
          </div>
          <div className="bg-slate-700 rounded-lg p-3">
            <p className="text-slate-400 text-xs">Current Price</p>
            <p className="text-white font-semibold">
              {formatCurrency(holding?.currentPrice)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-slate-300 text-sm block mb-1">
              Quantity to Sell (max: {holding?.quantity})
            </label>
            <input
              type="number"
              min="1"
              max={holding?.quantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              className="input"
            />
          </div>

          <div>
            <label className="text-slate-300 text-sm block mb-1">
              Sell Price ($)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input"
            />
          </div>

          <div className="bg-slate-700 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Received</span>
              <span className="text-white font-bold">
                {formatCurrency(totalReceived)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Est. P&L</span>
              <span className={Number(pl) >= 0
                               ? 'text-green-400' : 'text-red-400'}>
                {pl >= 0 ? '+' : ''}{formatCurrency(pl)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !quantity || !price ||
                      Number(quantity) > holding?.quantity}
            className="btn-danger flex-1"
          >
            {loading ? 'Processing...' : 'Confirm Sell'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellStockModal;