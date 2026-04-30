import express from 'express';
import Trade from '../models/Trade.js';

const router = express.Router();

// GET all trades
router.get('/', async (req, res) => {
  try {
    const trades = await Trade.find().sort({ createdAt: -1 });
    res.json(trades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single trade
router.get('/:id', async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ error: 'Trade not found' });
    res.json(trade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create trade
router.post('/', async (req, res) => {
  try {
    const trade = new Trade(req.body);
    await trade.save();
    res.status(201).json(trade);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update trade (outcome, review)
router.put('/:id', async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ error: 'Trade not found' });

    // Update allowed fields
    const updateFields = [
      'outcome', 'exitPrice', 'actualPnL', 'didMoveStop',
      'didAverage', 'emotionTag', 'postTradeNote', 'averagingLevels'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        trade[field] = req.body[field];
      }
    });

    await trade.save();
    res.json(trade);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE trade
router.delete('/:id', async (req, res) => {
  try {
    const trade = await Trade.findByIdAndDelete(req.params.id);
    if (!trade) return res.status(404).json({ error: 'Trade not found' });
    res.json({ message: 'Trade deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
