import { formatCurrency, formatPercent } from '../../utils/formatCurrency';
import { TrendingUp, TrendingDown } from 'lucide-react';

const HoldingRow = ({ holding, onBuy, onSell }) => {
  const isProfit = holding.profitLoss >= 0;

  return (
    <tr className="border-b border-slate-700 hover:bg-slate-700/30
                   transition-colors">
      {/* Stock */}
      <td className="py-4 px-4">
        <div>
          <p className="font-semibold text-white">{holding.symbol}</p>
          <p className="text-slate-400 text-xs truncate max-w-32">
            {holding.companyName}
          </p>
        </div>
      </td>

      {/* Quantity */}
      <td className="py-4 px-4 text-white text-right">
        {holding.quantity}
      </td>

      {/* Avg Buy Price */}
      <td className="py-4 px-4 text-slate-300 text-right">
        {formatCurrency(holding.averageBuyPrice)}
      </td>

      {/* Current Price */}
      <td className="py-4 px-4 text-white text-right">
        {formatCurrency(holding.currentPrice)}
      </td>

      {/* Current Value */}
      <td className="py-4 px-4 text-white font-medium text-right">
        {formatCurrency(holding.currentValue)}
      </td>

      {/* P&L */}
      <td className="py-4 px-4 text-right">
        <div className={`flex flex-col items-end
          ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
          <span className="flex items-center gap-1 font-medium">
            {isProfit
              ? <TrendingUp size={14} />
              : <TrendingDown size={14} />
            }
            {formatCurrency(Math.abs(holding.profitLoss))}
          </span>
          <span className="text-xs">
            {formatPercent(holding.profitLossPercent)}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="py-4 px-4">
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => onBuy(holding)}
            className="text-xs bg-green-600/20 text-green-400
                       hover:bg-green-600/40 px-3 py-1.5
                       rounded-lg transition-colors font-medium"
          >
            Buy
          </button>
          <button
            onClick={() => onSell(holding)}
            className="text-xs bg-red-600/20 text-red-400
                       hover:bg-red-600/40 px-3 py-1.5
                       rounded-lg transition-colors font-medium"
          >
            Sell
          </button>
        </div>
      </td>
    </tr>
  );
};

export default HoldingRow;