import { useState } from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

const BuyStockModal = ({ stock, onBuy, onClose, loading }) => {
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState(stock?.currentPrice || '');

  const totalCost = quantity && price
    ? (Number(quantity) * Number(price)).toFixed(2)
    : 0;

  const handleSubmit = async () => {
    if (!quantity || !price || quantity <= 0 || price <= 0) return;
    const success = await onBuy(stock.symbol, quantity, price);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center
                    justify-center z-50 p-4">
      <div className="card w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">
              Buy {stock?.symbol}
            </h2>
            <p className="text-slate-400 text-sm">{stock?.companyName}</p>
          </div>
          <button onClick={onClose}
                  className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Current Price */}
        <div className="bg-slate-700 rounded-lg p-3 mb-4">
          <p className="text-slate-400 text-xs">Market Price</p>
          <p className="text-white font-bold text-lg">
            {formatCurrency(stock?.currentPrice)}
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="text-slate-300 text-sm block mb-1">
              Quantity (shares)
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter number of shares"
              className="input"
            />
          </div>

          <div>
            <label className="text-slate-300 text-sm block mb-1">
              Price per share ($)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              className="input"
            />
          </div>

          {/* Total Cost */}
          <div className="bg-primary-600/10 border border-primary-600/30
                          rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Cost</span>
              <span className="text-white font-bold">
                {formatCurrency(totalCost)}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !quantity || !price}
            className="btn-primary flex-1"
          >
            {loading ? 'Processing...' : 'Confirm Buy'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyStockModal;