import { useState, useEffect } from 'react';
import { fetchTrades, updateTrade, deleteTrade } from '../api/tradeApi';
import { formatINR, formatDate, getOutcomeColor, getRiskColor, getRRColor } from '../utils/formatters';

export default function Journal() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ assetClass: '', conviction: '', outcome: '' });
  const [editingTrade, setEditingTrade] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selected, setSelected] = useState([]);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    try {
      const res = await fetchTrades();
      setTrades(res.data);
    } catch (err) {
      console.error('Error loading trades:', err);
    }
    setLoading(false);
  };

  // Filter trades
  const filtered = trades.filter(t => {
    if (filters.assetClass && t.assetClass !== filters.assetClass) return false;
    if (filters.conviction && t.convictionLevel !== filters.conviction) return false;
    if (filters.outcome && t.outcome !== filters.outcome) return false;
    return true;
  });

  // Outcome modal handlers
  const openEdit = (trade) => {
    setEditingTrade(trade);
    setEditForm({
      outcome: trade.outcome || 'Open',
      exitPrice: trade.exitPrice || '',
      actualPnL: trade.actualPnL || '',
      didMoveStop: trade.didMoveStop || false,
      didAverage: trade.didAverage || false,
      emotionTag: trade.emotionTag || '',
      postTradeNote: trade.postTradeNote || '',
    });
  };

  const saveOutcome = async () => {
    if (!editingTrade) return;
    try {
      await updateTrade(editingTrade._id, editForm);
      setEditingTrade(null);
      loadTrades();
    } catch (err) {
      console.error('Error updating trade:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this trade?')) return;
    try {
      await deleteTrade(id);
      loadTrades();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const selectedTrades = trades.filter(t => selected.includes(t._id));

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        <span className="gradient-text">Trade Journal</span>
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        All your saved trades. Update outcomes, compare setups, and track your progress.
      </p>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'end' }}>
          <div>
            <label className="input-label">Asset Class</label>
            <select value={filters.assetClass} onChange={(e) => setFilters(p => ({ ...p, assetClass: e.target.value }))} className="input-field" style={{ width: '150px' }}>
              <option value="">All</option>
              <option>Equity</option>
              <option>Commodity</option>
              <option>Crypto</option>
              <option>Index</option>
            </select>
          </div>
          <div>
            <label className="input-label">Conviction</label>
            <select value={filters.conviction} onChange={(e) => setFilters(p => ({ ...p, conviction: e.target.value }))} className="input-field" style={{ width: '130px' }}>
              <option value="">All</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div>
            <label className="input-label">Outcome</label>
            <select value={filters.outcome} onChange={(e) => setFilters(p => ({ ...p, outcome: e.target.value }))} className="input-field" style={{ width: '130px' }}>
              <option value="">All</option>
              <option>Win</option>
              <option>Loss</option>
              <option>Breakeven</option>
              <option>Open</option>
            </select>
          </div>
          {selected.length >= 2 && (
            <button onClick={() => setComparing(!comparing)} className="btn-primary" style={{ fontSize: '0.85rem' }}>
              {comparing ? 'Close Comparison' : `Compare Selected (${selected.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Trade Comparator */}
      {comparing && selectedTrades.length >= 2 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '1rem' }}>
            📊 Trade Comparison
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${selectedTrades.length}, 1fr)`, gap: '1rem' }}>
            {selectedTrades.map(t => (
              <div key={t._id} className="card-elevated" style={{ padding: '1rem' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--color-accent)' }}>
                  {t.instrumentName}
                </h4>
                {[
                  ['Risk %', `${t.riskPercent}%`, getRiskColor(t.riskPercent)],
                  ['R:R Ratio', `1:${t.riskRewardRatio}`, getRRColor(t.riskRewardRatio)],
                  ['Capital Alloc.', formatINR(t.capitalAllocated), 'var(--color-text-primary)'],
                  ['Conviction', t.convictionLevel, 'var(--color-accent)'],
                  ['Setup', t.setupType, 'var(--color-text-secondary)'],
                  ['Outcome', t.outcome, getOutcomeColor(t.outcome)],
                  ['P&L', t.actualPnL ? formatINR(t.actualPnL) : '—', t.actualPnL > 0 ? '#22c55e' : t.actualPnL < 0 ? '#ef4444' : 'var(--color-text-muted)'],
                  ['Moved Stop?', t.didMoveStop ? 'Yes ⚠️' : 'No ✓', t.didMoveStop ? '#ef4444' : '#22c55e'],
                ].map(([label, val, color], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{label}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color }}>{val}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trade Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading trades...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          No trades found. Go to Analyze to create your first trade!
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'auto' }}>
          <table className="trade-table">
            <thead>
              <tr>
                <th style={{ width: '30px' }}></th>
                <th>Date</th>
                <th>Instrument</th>
                <th>Class</th>
                <th>Dir</th>
                <th>Entry</th>
                <th>Stop</th>
                <th>Target</th>
                <th>R:R</th>
                <th>Risk%</th>
                <th>Conv.</th>
                <th>Outcome</th>
                <th>P&L</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t._id}>
                  <td>
                    <input type="checkbox" checked={selected.includes(t._id)}
                      onChange={() => toggleSelect(t._id)} style={{ accentColor: 'var(--color-accent)' }} />
                  </td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{formatDate(t.createdAt)}</td>
                  <td style={{ fontWeight: 600 }}>{t.instrumentName}</td>
                  <td>
                    <span style={{
                      fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px',
                      background: 'var(--color-accent-dim)', color: 'var(--color-accent)', fontWeight: 500,
                    }}>{t.assetClass}</span>
                  </td>
                  <td>
                    <span style={{ color: t.direction === 'Long' ? '#22c55e' : '#ef4444', fontWeight: 600, fontSize: '0.85rem' }}>
                      {t.direction === 'Long' ? '▲' : '▼'} {t.direction}
                    </span>
                  </td>
                  <td>₹{t.entryPrice}</td>
                  <td>₹{t.stopLoss}</td>
                  <td>₹{t.targetPrice}</td>
                  <td style={{ color: getRRColor(t.riskRewardRatio), fontWeight: 600 }}>1:{t.riskRewardRatio}</td>
                  <td style={{ color: getRiskColor(t.riskPercent), fontWeight: 600 }}>{t.riskPercent}%</td>
                  <td style={{ fontSize: '0.8rem' }}>{t.convictionLevel}</td>
                  <td>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                      background: `${getOutcomeColor(t.outcome)}20`, color: getOutcomeColor(t.outcome),
                    }}>{t.outcome}</span>
                  </td>
                  <td style={{
                    fontWeight: 600, color: t.actualPnL > 0 ? '#22c55e' : t.actualPnL < 0 ? '#ef4444' : 'var(--color-text-muted)'
                  }}>
                    {t.actualPnL ? formatINR(t.actualPnL) : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => openEdit(t)} className="btn-secondary"
                        style={{ fontSize: '0.7rem', padding: '0.3rem 0.5rem' }}>Edit</button>
                      <button onClick={() => handleDelete(t._id)} className="btn-danger"
                        style={{ fontSize: '0.7rem', padding: '0.3rem 0.5rem' }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Outcome Modal */}
      {editingTrade && (
        <div className="modal-overlay" onClick={() => setEditingTrade(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-accent)' }}>
              Update: {editingTrade.instrumentName}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label className="input-label">Outcome</label>
                <select value={editForm.outcome} onChange={(e) => setEditForm(p => ({ ...p, outcome: e.target.value }))} className="input-field">
                  <option>Open</option>
                  <option>Win</option>
                  <option>Loss</option>
                  <option>Breakeven</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="input-label">Exit Price (₹)</label>
                  <input type="number" step="any" value={editForm.exitPrice}
                    onChange={(e) => setEditForm(p => ({ ...p, exitPrice: parseFloat(e.target.value) || '' }))} className="input-field" />
                </div>
                <div>
                  <label className="input-label">Actual P&L (₹)</label>
                  <input type="number" step="any" value={editForm.actualPnL}
                    onChange={(e) => setEditForm(p => ({ ...p, actualPnL: parseFloat(e.target.value) || '' }))} className="input-field" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="input-label">Did you move stop?</label>
                  <select value={editForm.didMoveStop ? 'yes' : 'no'}
                    onChange={(e) => setEditForm(p => ({ ...p, didMoveStop: e.target.value === 'yes' }))} className="input-field">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Did you average?</label>
                  <select value={editForm.didAverage ? 'yes' : 'no'}
                    onChange={(e) => setEditForm(p => ({ ...p, didAverage: e.target.value === 'yes' }))} className="input-field">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="input-label">Emotion During Trade</label>
                <select value={editForm.emotionTag} onChange={(e) => setEditForm(p => ({ ...p, emotionTag: e.target.value }))} className="input-field">
                  <option value="">Select...</option>
                  <option>Calm</option>
                  <option>Fear</option>
                  <option>FOMO</option>
                  <option>Revenge</option>
                  <option>Confident</option>
                </select>
              </div>

              <div>
                <label className="input-label">Post-Trade Note</label>
                <textarea value={editForm.postTradeNote} onChange={(e) => setEditForm(p => ({ ...p, postTradeNote: e.target.value }))}
                  className="input-field" placeholder="What did you learn from this trade?" />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button onClick={saveOutcome} className="btn-success" style={{ flex: 1 }}>Save Changes</button>
                <button onClick={() => setEditingTrade(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
