import express from 'express';
import Trade from '../models/Trade.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const keysStr = process.env.GEMINI_API_KEYS || '';
    const apiKeys = keysStr.split(',').map(k => k.trim()).filter(Boolean);

    if (apiKeys.length === 0) {
      return res.status(400).json({ error: 'No Gemini API keys configured.' });
    }

    const allTrades = await Trade.find().sort({ createdAt: -1 });
    const closedTrades = allTrades.filter(t => ['Win', 'Loss', 'Breakeven'].includes(t.outcome));

    if (closedTrades.length < 5) {
      return res.status(400).json({ error: `Need at least 5 closed trades. Currently have ${closedTrades.length}.` });
    }

    const wins = closedTrades.filter(t => t.outcome === 'Win');
    const losses = closedTrades.filter(t => t.outcome === 'Loss');
    const winRate = ((wins.length / closedTrades.length) * 100).toFixed(1);
    const avgWin = wins.length > 0 ? (wins.reduce((s, t) => s + (t.actualPnL || 0), 0) / wins.length).toFixed(0) : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + (t.actualPnL || 0), 0) / losses.length).toFixed(0) : 0;
    const totalWinPnL = wins.reduce((s, t) => s + (t.actualPnL || 0), 0);
    const totalLossPnL = Math.abs(losses.reduce((s, t) => s + (t.actualPnL || 0), 0));
    const profitFactor = totalLossPnL > 0 ? (totalWinPnL / totalLossPnL).toFixed(2) : 'N/A';

    const emotions = {};
    closedTrades.forEach(t => { if (t.emotionTag) emotions[t.emotionTag] = (emotions[t.emotionTag] || 0) + 1; });
    const emotionList = Object.entries(emotions).map(([k, v]) => `${k}: ${v}`).join(', ') || 'None';

    const last10 = closedTrades.slice(0, 10).map(t => ({
      instrument: t.instrumentName, direction: t.direction, outcome: t.outcome,
      pnl: t.actualPnL, conviction: t.convictionLevel, emotion: t.emotionTag,
    }));

    const prompt = `You are a professional trading coach. Analyze this trader:
- ${closedTrades.length} trades, ${winRate}% win rate, avg win ₹${avgWin}, avg loss ₹${avgLoss}
- Profit factor: ${profitFactor}, Emotions: ${emotionList}
- Recent trades: ${JSON.stringify(last10)}

Return JSON: {"observations":["str","str","str"],"warnings":["str","str"],"improvements":["str","str"],"closing":"str"}
ONLY valid JSON. No markdown.`;

    const models = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.0-flash-lite', 'gemini-2.0-flash'];
    let lastError = null;

    for (const model of models) {
      for (let i = 0; i < apiKeys.length; i++) {
        try {
          console.log(`🤖 Trying ${model} key ${i + 1}/${apiKeys.length}...`);
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKeys[i]}`;
          const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
            })
          });

          if (!resp.ok) {
            console.log(`⚠️ ${model} key ${i + 1}: status ${resp.status}`);
            lastError = `${model} key ${i + 1}: ${resp.status}`;
            continue;
          }

          const data = await resp.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) { lastError = 'Empty response'; continue; }

          const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const parsed = JSON.parse(cleaned);
          console.log(`✅ AI Coach success: ${model} key ${i + 1}`);
          return res.json(parsed);
        } catch (err) {
          console.log(`❌ ${model} key ${i + 1}: ${err.message}`);
          lastError = err.message;
          continue;
        }
      }
    }

    return res.status(429).json({ error: 'AI Coach unavailable. All API keys hit rate limits. Wait 60s and retry.' });
  } catch (err) {
    console.error('AI Coach error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
