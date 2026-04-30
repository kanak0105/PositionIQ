import { useState } from 'react';
import StatCard from '../components/common/StatCard';
import PanicMeter from '../components/analyze/PanicMeter';
import { formatINR, getRiskColor } from '../utils/formatters';
import {
  calcCapitalAtRisk, calcRiskPercent, calcAllocatedPercent,
  calcPanicScore, calcWeightedAvg, calcBreakEven
} from '../utils/calculations';

export default function Averaging() {
  const [original, setOriginal] = useState({
    instrumentName: '', direction: 'Long',
    entryPrice: '', stopLoss: '', targetPrice: '',
    quantity: '', totalCapital: '', brokerageCharges: 40,
  });
  const [avgLevels, setAvgLevels] = useState([]);
  const [active, setActive] = useState(false);

  const handleChange = (e) => {
    setOriginal(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const n = (k) => parseFloat(original[k]) || 0;

  const addLevel = () => {
    if (avgLevels.length < 5) {
      setAvgLevels(prev => [...prev, { price: '', quantity: '', note: '' }]);
    }
  };

  const updateLevel = (i, field, val) => {
    setAvgLevels(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: val } : l));
  };

  const removeLevel = (i) => {
    setAvgLevels(prev => prev.filter((_, idx) => idx !== i));
  };

  // Original trade calculations
  const origRisk = calcCapitalAtRisk(n('entryPrice'), n('stopLoss'), n('quantity'), original.direction);
  const origRiskPct = calcRiskPercent(origRisk, n('totalCapital'));
  const origDeployed = n('entryPrice') * n('quantity');
  const origDeployedPct = calcAllocatedPercent(origDeployed, n('totalCapital'));
  const origPanic = calcPanicScore(origRiskPct, 1.5, origDeployedPct);

  // Averaged calculations
  const validLevels = avgLevels.filter(l => parseFloat(l.price) > 0 && parseFloat(l.quantity) > 0);
  const allLevels = [
    { price: n('entryPrice'), quantity: n('quantity') },
    ...validLevels.map(l => ({ price: parseFloat(l.price), quantity: parseFloat(l.quantity) }))
  ];

  const avgPrice = calcWeightedAvg(allLevels);
  const totalQty = allLevels.reduce((s, l) => s + l.quantity, 0);
  const totalDeployed = allLevels.reduce((s, l) => s + l.price * l.quantity, 0);
  const deployedPct = calcAllocatedPercent(totalDeployed, n('totalCapital'));
  const avgRisk = calcCapitalAtRisk(avgPrice, n('stopLoss'), totalQty, original.direction);
  const avgRiskPct = calcRiskPercent(avgRisk, n('totalCapital'));
  const avgPanic = calcPanicScore(avgRiskPct, 1.5, deployedPct);
  const avgBreakEven = calcBreakEven(avgPrice, n('brokerageCharges'), totalQty, original.direction);

  const handleStart = (e) => {
    e.preventDefault();
    setActive(true);
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        <span className="gradient-text">Averaging Simulator</span>
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        Simulate averaging into a position. See exactly when a trade becomes a capital trap.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: active ? '300px 1fr 320px' : '1fr',
        gap: '1.5rem',
        alignItems: 'start',
      }}>
        {/* Left: Original Trade Setup */}
        <form onSubmit={handleStart} className="card">
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-accent)' }}>
            Original Trade
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label className="input-label">Instrument</label>
              <input name="instrumentName" value={original.instrumentName} onChange={handleChange}
                className="input-field" placeholder="e.g., Crude Oil" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label className="input-label">Direction</label>
                <select name="direction" value={original.direction} onChange={handleChange} className="input-field">
                  <option>Long</option>
                  <option>Short</option>
                </select>
              </div>
              <div>
                <label className="input-label">Total Capital (₹)</label>
                <input name="totalCapital" type="number" value={original.totalCapital} onChange={handleChange}
                  className="input-field" placeholder="50000" required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label className="input-label">Entry (₹)</label>
                <input name="entryPrice" type="number" step="any" value={original.entryPrice} onChange={handleChange}
                  className="input-field" required />
              </div>
              <div>
                <label className="input-label">Stop (₹)</label>
                <input name="stopLoss" type="number" step="any" value={original.stopLoss} onChange={handleChange}
                  className="input-field" required />
              </div>
              <div>
                <label className="input-label">Target (₹)</label>
                <input name="targetPrice" type="number" step="any" value={original.targetPrice} onChange={handleChange}
                  className="input-field" required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label className="input-label">Quantity</label>
                <input name="quantity" type="number" step="any" value={original.quantity} onChange={handleChange}
                  className="input-field" required />
              </div>
              <div>
                <label className="input-label">Brokerage (₹)</label>
                <input name="brokerageCharges" type="number" value={original.brokerageCharges} onChange={handleChange}
                  className="input-field" />
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              Start Simulator ◎
            </button>
          </div>
        </form>

        {active && (
          <>
            {/* Center: Averaging Levels Builder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                    Averaging Levels
                  </h2>
                  <button onClick={addLevel} className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                    disabled={avgLevels.length >= 5}>
                    + Add Level ({avgLevels.length}/5)
                  </button>
                </div>

                {avgLevels.length === 0 && (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
                    Click "Add Level" to simulate averaging into your position
                  </p>
                )}

                {avgLevels.map((level, i) => (
                  <div key={i} style={{
                    background: 'var(--color-bg-primary)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    border: '1px solid var(--color-border)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-accent)' }}>
                        Level {i + 1}
                      </span>
                      <button onClick={() => removeLevel(i)} style={{
                        background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem',
                      }}>✕</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label className="input-label">Price (₹)</label>
                        <input type="number" step="any" value={level.price}
                          onChange={(e) => updateLevel(i, 'price', e.target.value)}
                          className="input-field" />
                      </div>
                      <div>
                        <label className="input-label">Quantity</label>
                        <input type="number" step="any" value={level.quantity}
                          onChange={(e) => updateLevel(i, 'quantity', e.target.value)}
                          className="input-field" />
                      </div>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <input type="text" placeholder="Optional note..." value={level.note}
                        onChange={(e) => updateLevel(i, 'note', e.target.value)}
                        className="input-field" style={{ fontSize: '0.8rem' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison Table */}
              {validLevels.length > 0 && (
                <div className="card">
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '1rem' }}>
                    📊 Original vs Averaged
                  </h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>Metric</th>
                        <th style={{ textAlign: 'right', padding: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>Original</th>
                        <th style={{ textAlign: 'right', padding: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>Averaged</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Avg Price', `₹${n('entryPrice')}`, `₹${avgPrice}`],
                        ['Quantity', n('quantity'), totalQty],
                        ['Deployed', formatINR(origDeployed), formatINR(totalDeployed)],
                        ['Deployed %', `${origDeployedPct.toFixed(1)}%`, `${deployedPct.toFixed(1)}%`],
                        ['Risk', formatINR(origRisk), formatINR(avgRisk)],
                        ['Risk %', `${origRiskPct.toFixed(1)}%`, `${avgRiskPct.toFixed(1)}%`],
                        ['Panic Score', origPanic, avgPanic],
                        ['Break-even', `₹${calcBreakEven(n('entryPrice'), n('brokerageCharges'), n('quantity'), original.direction)}`, `₹${avgBreakEven}`],
                      ].map(([label, orig, avg], i) => (
                        <tr key={i}>
                          <td style={{ padding: '0.5rem', fontSize: '0.85rem', borderBottom: '1px solid var(--color-border)' }}>{label}</td>
                          <td style={{ padding: '0.5rem', fontSize: '0.85rem', textAlign: 'right', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>{orig}</td>
                          <td style={{ padding: '0.5rem', fontSize: '0.85rem', textAlign: 'right', borderBottom: '1px solid var(--color-border)', fontWeight: 600, color: 'var(--color-accent)' }}>{avg}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right: Live Results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <PanicMeter score={validLevels.length > 0 ? avgPanic : origPanic} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <StatCard label="Avg Price" value={`₹${validLevels.length > 0 ? avgPrice : n('entryPrice')}`}
                  color="var(--color-accent)" />
                <StatCard label="Total Qty" value={validLevels.length > 0 ? totalQty : n('quantity')}
                  color="var(--color-text-primary)" />
                <StatCard label="Deployed %" value={`${(validLevels.length > 0 ? deployedPct : origDeployedPct).toFixed(1)}%`}
                  color={deployedPct > 50 ? '#ef4444' : '#22c55e'} />
                <StatCard label="Risk %" value={`${(validLevels.length > 0 ? avgRiskPct : origRiskPct).toFixed(1)}%`}
                  color={getRiskColor(validLevels.length > 0 ? avgRiskPct : origRiskPct)} />
              </div>

              <div className="card-elevated" style={{ padding: '1rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Revised Break-Even</p>
                <p style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                  ₹{validLevels.length > 0 ? avgBreakEven : calcBreakEven(n('entryPrice'), n('brokerageCharges'), n('quantity'), original.direction)}
                </p>
              </div>

              {deployedPct > 50 && validLevels.length > 0 && (
                <div className="verdict-danger" style={{ borderRadius: '8px', padding: '1rem' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    ⚠️ Capital Trap Warning
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                    You have deployed {deployedPct.toFixed(1)}% of your capital in one trade. This is becoming a trap.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
