import { useState, useEffect, useCallback } from 'react';
import portfolioService from '../services/portfolioService';
import toast from 'react-hot-toast';

const usePortfolio = () => {
  const [portfolio, setPortfolio]   = useState(null);
  const [summary, setSummary]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const fetchPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      const [portRes, sumRes] = await Promise.all([
        portfolioService.getPortfolio(),
        portfolioService.getSummary(),
      ]);
      setPortfolio(portRes.data.data);
      setSummary(sumRes.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPortfolio(); }, [fetchPortfolio]);

  const buyStock = async (symbol, quantity, price) => {
    try {
      const res = await portfolioService.buyStock(
        { symbol, quantity: Number(quantity), price: Number(price) }
      );
      setPortfolio(res.data.data);
      await fetchPortfolio();
      toast.success(`Bought ${quantity} shares of ${symbol}`);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Buy failed');
      return false;
    }
  };

  const sellStock = async (symbol, quantity, price) => {
    try {
      const res = await portfolioService.sellStock(
        { symbol, quantity: Number(quantity), price: Number(price) }
      );
      setPortfolio(res.data.data);
      await fetchPortfolio();
      toast.success(`Sold ${quantity} shares of ${symbol}`);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sell failed');
      return false;
    }
  };

  return {
    portfolio, summary, loading, error,
    buyStock, sellStock, refresh: fetchPortfolio,
  };
};

export default usePortfolio;