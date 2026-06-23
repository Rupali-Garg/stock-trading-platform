const mongoose = require('mongoose');
const Stock = require('../models/Stock');
const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
});

const stocks = [
  {
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    sector: 'Technology',
    currentPrice: 185.5,
    previousClose: 183.2,
    marketCap: 2850000000000,
    volume: 58000000,
  },
  {
    symbol: 'GOOGL',
    companyName: 'Alphabet Inc.',
    sector: 'Technology',
    currentPrice: 142.3,
    previousClose: 140.5,
    marketCap: 1790000000000,
    volume: 22000000,
  },
  {
    symbol: 'MSFT',
    companyName: 'Microsoft Corporation',
    sector: 'Technology',
    currentPrice: 415.2,
    previousClose: 412.0,
    marketCap: 3080000000000,
    volume: 19000000,
  },
  {
    symbol: 'META',
    companyName: 'Meta Platforms Inc.',
    sector: 'Technology',
    currentPrice: 505.0,
    previousClose: 498.2,
    marketCap: 1290000000000,
    volume: 15000000,
  },
  {
    symbol: 'NVDA',
    companyName: 'NVIDIA Corporation',
    sector: 'Technology',
    currentPrice: 875.4,
    previousClose: 860.0,
    marketCap: 2160000000000,
    volume: 42000000,
  },
  {
    symbol: 'AMZN',
    companyName: 'Amazon.com Inc.',
    sector: 'Consumer',
    currentPrice: 185.7,
    previousClose: 183.4,
    marketCap: 1930000000000,
    volume: 31000000,
  },
  {
    symbol: 'TSLA',
    companyName: 'Tesla Inc.',
    sector: 'Consumer',
    currentPrice: 248.0,
    previousClose: 251.3,
    marketCap: 790000000000,
    volume: 98000000,
  },
  {
    symbol: 'JPM',
    companyName: 'JPMorgan Chase & Co.',
    sector: 'Finance',
    currentPrice: 198.3,
    previousClose: 196.0,
    marketCap: 572000000000,
    volume: 9000000,
  },
  {
    symbol: 'BAC',
    companyName: 'Bank of America Corp.',
    sector: 'Finance',
    currentPrice: 38.5,
    previousClose: 37.9,
    marketCap: 304000000000,
    volume: 35000000,
  },
  {
    symbol: 'GS',
    companyName: 'Goldman Sachs Group Inc.',
    sector: 'Finance',
    currentPrice: 456.2,
    previousClose: 452.0,
    marketCap: 148000000000,
    volume: 2000000,
  },
  {
    symbol: 'JNJ',
    companyName: 'Johnson & Johnson',
    sector: 'Healthcare',
    currentPrice: 152.4,
    previousClose: 153.0,
    marketCap: 367000000000,
    volume: 7000000,
  },
  {
    symbol: 'PFE',
    companyName: 'Pfizer Inc.',
    sector: 'Healthcare',
    currentPrice: 28.9,
    previousClose: 29.2,
    marketCap: 163000000000,
    volume: 28000000,
  },
  {
    symbol: 'XOM',
    companyName: 'Exxon Mobil Corporation',
    sector: 'Energy',
    currentPrice: 112.6,
    previousClose: 111.0,
    marketCap: 449000000000,
    volume: 17000000,
  },
  {
    symbol: 'CVX',
    companyName: 'Chevron Corporation',
    sector: 'Energy',
    currentPrice: 156.8,
    previousClose: 155.2,
    marketCap: 295000000000,
    volume: 8000000,
  },
  {
    symbol: 'CAT',
    companyName: 'Caterpillar Inc.',
    sector: 'Industrial',
    currentPrice: 342.1,
    previousClose: 338.5,
    marketCap: 169000000000,
    volume: 3000000,
  },
];

const seedStocks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ Connected to MongoDB');

    let inserted = 0;
    let updated = 0;

    for (const stock of stocks) {
      const existing = await Stock.findOne({
        symbol: stock.symbol,
      });

      await Stock.findOneAndUpdate(
        { symbol: stock.symbol },
        {
          ...stock,
          lastUpdated: new Date(),
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );

      if (existing) {
        updated++;
      } else {
        inserted++;
      }
    }

    console.log('\n✅ Seeding Complete');
    console.log(`Inserted: ${inserted}`);
    console.log(`Updated: ${updated}`);
    console.log(`Total: ${stocks.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedStocks();