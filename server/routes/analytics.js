import express from 'express';
import Trade from '../models/Trade.js';

const router = express.Router();

// GET /api/analytics — compute all advanced metrics from saved trades
router.get('/', async (req, res) => {
  try {
    const allTrades = await Trade.find().sort({ createdAt: 1 });
    const closedTrades = allTrades.filter(t => ['Win', 'Loss', 'Breakeven'].includes(t.outcome));
    const openTrades = allTrades.filter(t => t.outcome === 'Open');

    // Let frontend handle low confidence state
    const wins = closedTrades.filter(t => t.outcome === 'Win');
    const losses = closedTrades.filter(t => t.outcome === 'Loss');

    // Win Rate
    const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;

    // Average Win / Loss
    const avgWin = wins.length > 0
      ? wins.reduce((sum, t) => sum + (t.actualPnL || 0), 0) / wins.length
      : 0;
    const avgLoss = losses.length > 0
      ? Math.abs(losses.reduce((sum, t) => sum + (t.actualPnL || 0), 0) / losses.length)
      : 0;

    // Profit Factor
    const totalWinPnL = wins.reduce((sum, t) => sum + (t.actualPnL || 0), 0);
    const totalLossPnL = Math.abs(losses.reduce((sum, t) => sum + (t.actualPnL || 0), 0));
    const profitFactor = totalLossPnL > 0 ? totalWinPnL / totalLossPnL : totalWinPnL > 0 ? Infinity : 0;

    // Expectancy
    const expectancy = ((winRate / 100) * avgWin) - (((100 - winRate) / 100) * avgLoss);

    // Maximum Drawdown
    let peak = 0;
    let maxDrawdown = 0;
    let runningPnL = 0;
    const equityCurve = [];

    closedTrades.forEach((t, i) => {
      runningPnL += (t.actualPnL || 0);
      equityCurve.push({
        tradeNum: i + 1,
        date: t.createdAt,
        pnl: t.actualPnL || 0,
        cumPnL: runningPnL,
        instrument: t.instrumentName
      });
      if (runningPnL > peak) peak = runningPnL;
      const drawdown = peak > 0 ? ((peak - runningPnL) / peak) * 100 : 0;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    // Portfolio Heat (open trades)
    const latestCapital = allTrades.length > 0 ? allTrades[allTrades.length - 1].totalCapital : 50000;
    const totalOpenRisk = openTrades.reduce((sum, t) => sum + (t.capitalAtRisk || 0), 0);
    const portfolioHeat = latestCapital > 0 ? (totalOpenRisk / latestCapital) * 100 : 0;

    // Kelly Criterion
    const W = winRate / 100;
    const R = avgLoss > 0 ? avgWin / avgLoss : 0;
    const kellyPercent = R > 0 ? (W - ((1 - W) / R)) * 100 : 0;
    const halfKelly = kellyPercent / 2;

    // Conviction Accuracy
    const convictionGroups = { Low: { wins: 0, total: 0 }, Medium: { wins: 0, total: 0 }, High: { wins: 0, total: 0 } };
    closedTrades.forEach(t => {
      if (convictionGroups[t.convictionLevel]) {
        convictionGroups[t.convictionLevel].total++;
        if (t.outcome === 'Win') convictionGroups[t.convictionLevel].wins++;
      }
    });
    const convictionAccuracy = {};
    Object.keys(convictionGroups).forEach(level => {
      const g = convictionGroups[level];
      convictionAccuracy[level] = {
        winRate: g.total > 0 ? ((g.wins / g.total) * 100).toFixed(1) : 0,
        total: g.total,
        wins: g.wins
      };
    });

    // Discipline Score
    const totalClosed = closedTrades.length;
    const movedStopCount = closedTrades.filter(t => t.didMoveStop).length;
    const averagedCount = closedTrades.filter(t => t.didAverage).length;
    const followedPlan = totalClosed - movedStopCount; // Approximation
    const disciplineScore = totalClosed > 0 ? Math.round(
      Math.max(0, Math.min(100,
        100 - (movedStopCount / totalClosed * 30) - (averagedCount / totalClosed * 20)
          + (followedPlan / totalClosed * 50)
      ))
    ) : 0;

    // Average risk per trade (for overview)
    const avgRiskPercent = totalClosed > 0 ? closedTrades.reduce((sum, t) => sum + (t.riskPercent || 0), 0) / totalClosed : 0;
    const avgRR = totalClosed > 0 ? closedTrades.reduce((sum, t) => sum + (t.riskRewardRatio || 0), 0) / totalClosed : 0;

    // Emotion breakdown
    const emotionTags = {};
    closedTrades.forEach(t => {
      if (t.emotionTag) {
        emotionTags[t.emotionTag] = (emotionTags[t.emotionTag] || 0) + 1;
      }
    });

    // Asset class breakdown
    const assetClasses = {};
    closedTrades.forEach(t => {
      assetClasses[t.assetClass] = (assetClasses[t.assetClass] || 0) + 1;
    });

    res.json({
      locked: false,
      totalTrades: allTrades.length,
      closedCount: closedTrades.length,
      openCount: openTrades.length,
      winRate: parseFloat(winRate.toFixed(1)),
      avgWin: parseFloat(avgWin.toFixed(2)),
      avgLoss: parseFloat(avgLoss.toFixed(2)),
      profitFactor: profitFactor === Infinity ? 999 : parseFloat(profitFactor.toFixed(2)),
      expectancy: parseFloat(expectancy.toFixed(2)),
      maxDrawdown: parseFloat(maxDrawdown.toFixed(1)),
      portfolioHeat: parseFloat(portfolioHeat.toFixed(1)),
      kellyPercent: parseFloat(kellyPercent.toFixed(1)),
      halfKelly: parseFloat(halfKelly.toFixed(1)),
      convictionAccuracy,
      disciplineScore,
      avgRiskPercent: parseFloat(avgRiskPercent.toFixed(1)),
      avgRR: parseFloat(avgRR.toFixed(2)),
      equityCurve,
      emotionTags,
      assetClasses,
      movedStopCount,
      averagedCount,
      followedPlan
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
