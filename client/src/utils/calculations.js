// ===== Trade Calculation Utilities =====
// All formulas from the PositionIQ spec — pure functions, no side effects

/**
 * Capital at Risk: how much money you lose if stop loss hits
 */
export function calcCapitalAtRisk(entry, stopLoss, quantity, direction = 'Long') {
  if (direction === 'Long') {
    return Math.abs((entry - stopLoss) * quantity);
  }
  return Math.abs((stopLoss - entry) * quantity);
}

/**
 * Reward Potential: how much money you gain if target hits
 */
export function calcRewardPotential(entry, target, quantity, direction = 'Long') {
  if (direction === 'Long') {
    return Math.abs((target - entry) * quantity);
  }
  return Math.abs((entry - target) * quantity);
}

/**
 * Risk:Reward Ratio
 */
export function calcRiskReward(risk, reward) {
  if (risk <= 0) return 0;
  return parseFloat((reward / risk).toFixed(2));
}

/**
 * Risk % of Account
 */
export function calcRiskPercent(capitalAtRisk, totalCapital) {
  if (totalCapital <= 0) return 0;
  return parseFloat(((capitalAtRisk / totalCapital) * 100).toFixed(2));
}

/**
 * Capital Allocated %
 */
export function calcAllocatedPercent(capitalAllocated, totalCapital) {
  if (totalCapital <= 0) return 0;
  return parseFloat(((capitalAllocated / totalCapital) * 100).toFixed(2));
}

/**
 * Panic Score (0-100)
 * Combines risk%, allocation%, R:R, SL realism, setup realism
 */
export function calcPanicScore(riskPercent, rrRatio, allocatedPercent, slDistance = 2, setupType = 'Other', emotionTag = 'Calm') {
  // Start at a baseline of 10 so trading is never viewed as "0 risk"
  let score = 10;
  
  // Factor 1: Risk % (Penalize over 2%, hard penalty over 5%)
  if (riskPercent > 5) score += 50;
  else if (riskPercent > 2) score += 30;
  else score += (riskPercent * 5); // 0-10 points for acceptable risk
  
  // Factor 2: Capital Allocated % (Severe penalty above 40%)
  if (allocatedPercent > 40) score += 30;
  else score += (allocatedPercent * 0.5); // Up to 20 points
  
  // Factor 3: R:R ratio (Penalize < 1.5, do NOT reward high R:R to prevent false safety)
  if (rrRatio < 1.0) score += 25;
  else if (rrRatio < 1.5) score += 15;
  // (We do not subtract points for high RR, because a 1:10 target is often unrealistic and risky!)
  
  // Factor 4: SL Realism (Too tight < 0.2% or too wide > 10% is dangerous)
  if (slDistance < 0.2 || slDistance > 10) score += 15;
  
  // Factor 5: Setup Realism & Emotions
  if (setupType === 'Other') score += 10; // Generic setups are risky
  if (['Revenge', 'FOMO', 'Fear'].includes(emotionTag)) score += 20;
  
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Weighted Average Price for averaging down/up
 * @param {Array<{price: number, quantity: number}>} levels
 */
export function calcWeightedAvg(levels) {
  const totalValue = levels.reduce((sum, l) => sum + (l.price * l.quantity), 0);
  const totalQty = levels.reduce((sum, l) => sum + l.quantity, 0);
  if (totalQty <= 0) return 0;
  return parseFloat((totalValue / totalQty).toFixed(2));
}

/**
 * Break-even price including brokerage charges
 */
export function calcBreakEven(entry, charges, quantity, direction = 'Long') {
  if (quantity <= 0) return entry;
  if (direction === 'Long') {
    return parseFloat((entry + (charges / quantity)).toFixed(2));
  }
  return parseFloat((entry - (charges / quantity)).toFixed(2));
}

/**
 * Suggested quantity to risk only 2% of capital
 */
export function calcSuggestedQty(totalCapital, entry, stopLoss, direction = 'Long') {
  const riskPerUnit = direction === 'Long' ? Math.abs(entry - stopLoss) : Math.abs(stopLoss - entry);
  if (riskPerUnit <= 0) return 0;
  const maxRiskAmount = totalCapital * 0.02;
  return Math.floor(maxRiskAmount / riskPerUnit);
}

/**
 * Stop Loss Distance as percentage
 */
export function calcStopLossDistance(entry, stopLoss) {
  if (entry <= 0) return 0;
  return parseFloat((Math.abs(entry - stopLoss) / entry * 100).toFixed(2));
}

/**
 * Compute risk radar data for the pentagon chart
 * Each axis is normalized to 0-100 scale
 */
export function computeRadarData(riskPercent, rrRatio, slDistance, allocatedPercent, conviction) {
  const convictionMap = { 'Low': 33, 'Medium': 66, 'High': 100 };
  return [
    { axis: 'Risk %', value: Math.min(100, riskPercent * 10), fullMark: 100 },
    { axis: 'R:R Ratio', value: Math.min(100, rrRatio * 25), fullMark: 100 },
    { axis: 'SL Distance', value: Math.min(100, slDistance * 10), fullMark: 100 },
    { axis: 'Position Size', value: Math.min(100, allocatedPercent), fullMark: 100 },
    { axis: 'Conviction', value: convictionMap[conviction] || 50, fullMark: 100 },
  ];
}

/**
 * Recalculate all metrics with averaging levels included
 */
export function recalcWithAveraging(originalEntry, originalQty, avgLevels, stopLoss, totalCapital, direction) {
  const allLevels = [
    { price: originalEntry, quantity: originalQty },
    ...avgLevels.filter(l => l.price > 0 && l.quantity > 0)
  ];

  const newAvgPrice = calcWeightedAvg(allLevels);
  const totalQty = allLevels.reduce((sum, l) => sum + l.quantity, 0);
  const totalDeployed = allLevels.reduce((sum, l) => sum + (l.price * l.quantity), 0);
  const capitalAtRisk = calcCapitalAtRisk(newAvgPrice, stopLoss, totalQty, direction);
  const riskPercent = calcRiskPercent(capitalAtRisk, totalCapital);
  const deployedPercent = calcAllocatedPercent(totalDeployed, totalCapital);

  return {
    newAvgPrice,
    totalQty,
    totalDeployed,
    capitalAtRisk,
    riskPercent,
    deployedPercent,
  };
}
