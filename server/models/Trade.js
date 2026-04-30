import mongoose from 'mongoose';

const TradeSchema = new mongoose.Schema({
  // Setup fields
  instrumentName: { type: String, required: true },
  assetClass: { type: String, enum: ['Equity', 'Commodity', 'Crypto', 'Index'], required: true },
  direction: { type: String, enum: ['Long', 'Short'], required: true },
  entryPrice: { type: Number, required: true },
  stopLoss: { type: Number, required: true },
  targetPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  totalCapital: { type: Number, required: true },
  capitalAllocated: { type: Number, required: true },
  convictionLevel: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  setupType: { type: String, enum: ['Breakout', 'Reversal', 'Pullback', 'Trend', 'Other'] },
  holdingType: { type: String, enum: ['Intraday', 'Swing', 'Positional'] },
  tradeReason: { type: String },
  brokerageCharges: { type: Number, default: 40 },

  // Calculated at save
  capitalAtRisk: Number,
  rewardPotential: Number,
  riskRewardRatio: Number,
  riskPercent: Number,
  panicScore: Number,

  // Averaging levels
  averagingLevels: [{ price: Number, quantity: Number }],

  // Review (filled after trade closes)
  outcome: { type: String, enum: ['Win', 'Loss', 'Breakeven', 'Open'], default: 'Open' },
  exitPrice: Number,
  actualPnL: Number,
  didMoveStop: { type: Boolean, default: false },
  didAverage: { type: Boolean, default: false },
  emotionTag: { type: String, enum: ['Calm', 'Fear', 'FOMO', 'Revenge', 'Confident'] },
  postTradeNote: String,

  createdAt: { type: Date, default: Date.now }
});

// Pre-save middleware to compute risk metrics and enforce business rules
TradeSchema.pre('save', function (next) {
  const isLong = this.direction === 'Long';

  // Capital Allocated Business Rule: Cannot exceed Total Capital
  if (this.capitalAllocated > this.totalCapital) {
    this.capitalAllocated = this.totalCapital; // Auto-cap it to prevent impossible scenarios
  }

  // Capital at Risk
  this.capitalAtRisk = isLong
    ? (this.entryPrice - this.stopLoss) * this.quantity
    : (this.stopLoss - this.entryPrice) * this.quantity;

  // Reward Potential
  this.rewardPotential = isLong
    ? (this.targetPrice - this.entryPrice) * this.quantity
    : (this.entryPrice - this.targetPrice) * this.quantity;

  // Risk:Reward Ratio
  this.riskRewardRatio = this.capitalAtRisk > 0
    ? parseFloat((this.rewardPotential / this.capitalAtRisk).toFixed(2))
    : 0;

  // Risk % of Account
  this.riskPercent = this.totalCapital > 0
    ? parseFloat(((this.capitalAtRisk / this.totalCapital) * 100).toFixed(2))
    : 0;

  // Capital Allocated %
  const allocatedPercent = this.totalCapital > 0
    ? (this.capitalAllocated / this.totalCapital) * 100
    : 0;

  // SL Distance %
  const slDistance = this.entryPrice > 0 
    ? (Math.abs(this.entryPrice - this.stopLoss) / this.entryPrice) * 100 
    : 0;

  // Panic Score
  let score = 10;
  
  if (this.riskPercent > 5) score += 50;
  else if (this.riskPercent > 2) score += 30;
  else score += (this.riskPercent * 5);
  
  if (allocatedPercent > 40) score += 30;
  else score += (allocatedPercent * 0.5);
  
  if (this.riskRewardRatio < 1.0) score += 25;
  else if (this.riskRewardRatio < 1.5) score += 15;
  
  if (slDistance < 0.2 || slDistance > 10) score += 15;
  
  if (this.setupType === 'Other') score += 10;
  if (['Revenge', 'FOMO', 'Fear'].includes(this.emotionTag)) score += 20;

  this.panicScore = Math.min(100, Math.max(0, Math.round(score)));

  next();
});

const Trade = mongoose.model('Trade', TradeSchema);
export default Trade;
