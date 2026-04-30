import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Trade from '../models/Trade.js';

dotenv.config();

const demoTrades = [
  {
    instrumentName: 'Crude Oil',
    assetClass: 'Commodity',
    direction: 'Long',
    entryPrice: 6200,
    stopLoss: 6100,
    targetPrice: 6400,
    quantity: 10,
    totalCapital: 50000,
    capitalAllocated: 6200,
    convictionLevel: 'High',
    setupType: 'Breakout',
    holdingType: 'Intraday',
    tradeReason: 'Breakout above resistance with volume confirmation',
    brokerageCharges: 40,
    outcome: 'Win',
    exitPrice: 6380,
    actualPnL: 1800,
    didMoveStop: false,
    didAverage: false,
    emotionTag: 'Confident',
    postTradeNote: 'Clean breakout, followed plan perfectly',
    createdAt: new Date('2025-04-01')
  },
  {
    instrumentName: 'Nifty 50',
    assetClass: 'Index',
    direction: 'Short',
    entryPrice: 22500,
    stopLoss: 22650,
    targetPrice: 22200,
    quantity: 50,
    totalCapital: 50000,
    capitalAllocated: 11250,
    convictionLevel: 'Medium',
    setupType: 'Reversal',
    holdingType: 'Intraday',
    tradeReason: 'Bearish engulfing at resistance zone',
    brokerageCharges: 50,
    outcome: 'Win',
    exitPrice: 22280,
    actualPnL: 11000,
    didMoveStop: false,
    didAverage: false,
    emotionTag: 'Calm',
    postTradeNote: 'Patience paid off, waited for confirmation',
    createdAt: new Date('2025-04-05')
  },
  {
    instrumentName: 'Reliance Industries',
    assetClass: 'Equity',
    direction: 'Long',
    entryPrice: 2850,
    stopLoss: 2800,
    targetPrice: 2950,
    quantity: 20,
    totalCapital: 50000,
    capitalAllocated: 5700,
    convictionLevel: 'High',
    setupType: 'Pullback',
    holdingType: 'Swing',
    tradeReason: 'Pullback to 20 EMA in uptrend',
    brokerageCharges: 40,
    outcome: 'Loss',
    exitPrice: 2800,
    actualPnL: -1000,
    didMoveStop: false,
    didAverage: true,
    emotionTag: 'Fear',
    postTradeNote: 'Averaged down once but stopped out anyway',
    createdAt: new Date('2025-04-10')
  },
  {
    instrumentName: 'HDFC Bank',
    assetClass: 'Equity',
    direction: 'Long',
    entryPrice: 1620,
    stopLoss: 1590,
    targetPrice: 1680,
    quantity: 30,
    totalCapital: 50000,
    capitalAllocated: 4860,
    convictionLevel: 'Low',
    setupType: 'Trend',
    holdingType: 'Positional',
    tradeReason: 'Riding the trend after quarterly results',
    brokerageCharges: 40,
    outcome: 'Win',
    exitPrice: 1670,
    actualPnL: 1500,
    didMoveStop: true,
    didAverage: false,
    emotionTag: 'FOMO',
    postTradeNote: 'Entered slightly late due to FOMO, but worked out',
    createdAt: new Date('2025-04-14')
  },
  {
    instrumentName: 'TCS',
    assetClass: 'Equity',
    direction: 'Short',
    entryPrice: 3500,
    stopLoss: 3560,
    targetPrice: 3380,
    quantity: 15,
    totalCapital: 50000,
    capitalAllocated: 5250,
    convictionLevel: 'Medium',
    setupType: 'Breakout',
    holdingType: 'Swing',
    tradeReason: 'Breakdown below support with weak sector',
    brokerageCharges: 40,
    outcome: 'Loss',
    exitPrice: 3555,
    actualPnL: -825,
    didMoveStop: true,
    didAverage: false,
    emotionTag: 'Revenge',
    postTradeNote: 'Moved stop wider after initial spike, bad decision',
    createdAt: new Date('2025-04-18')
  },
  {
    instrumentName: 'BTCUSDT',
    assetClass: 'Crypto',
    direction: 'Long',
    entryPrice: 67000,
    stopLoss: 65500,
    targetPrice: 71000,
    quantity: 0.05,
    totalCapital: 50000,
    capitalAllocated: 3350,
    convictionLevel: 'High',
    setupType: 'Breakout',
    holdingType: 'Swing',
    tradeReason: 'Breaking all-time high with strong momentum',
    brokerageCharges: 50,
    outcome: 'Win',
    exitPrice: 70200,
    actualPnL: 160,
    didMoveStop: false,
    didAverage: false,
    emotionTag: 'Confident',
    postTradeNote: 'Took 80% of the move, solid execution',
    createdAt: new Date('2025-04-20')
  }
];

export async function seedIfEmpty() {
  try {
    const count = await Trade.countDocuments();
    if (count === 0) {
      console.log('📦 Seeding demo trades...');
      for (const tradeData of demoTrades) {
        const trade = new Trade(tradeData);
        await trade.save(); // Triggers pre-save middleware
      }
      console.log(`✅ Seeded ${demoTrades.length} demo trades`);
    } else {
      console.log(`📋 Database has ${count} trades, skipping seed`);
    }
  } catch (err) {
    console.error('⚠️ Seed error:', err.message);
  }
}

// Allow running directly: node seed/seedTrades.js
const isDirectRun = process.argv[1]?.includes('seedTrades');
if (isDirectRun) {
  mongoose.connect(process.env.MONGO_URI).then(async () => {
    await seedIfEmpty();
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
