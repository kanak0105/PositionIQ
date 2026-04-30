import { useState } from 'react';
import StatCard from '../components/common/StatCard';
import PanicMeter from '../components/analyze/PanicMeter';
import RiskRadar from '../components/analyze/RiskRadar';
import VerdictCard from '../components/analyze/VerdictCard';
import { formatINR, getRiskColor, getRRColor } from '../utils/formatters';
import { createTrade } from '../api/tradeApi';
import {
  calcCapitalAtRisk, calcRewardPotential, calcRiskReward,
  calcRiskPercent, calcAllocatedPercent, calcPanicScore,
  calcBreakEven, calcSuggestedQty, calcStopLossDistance,
  computeRadarData, calcWeightedAvg, recalcWithAveraging
} from '../utils/calculations';

const defaultForm = {
  instrumentName: '',
  assetClass: 'Equity',
  direction: 'Long',
  entryPrice: '',
  stopLoss: '',
  targetPrice: '',
  quantity: '',
  brokerageCharges: 40,
  totalCapital: '',
  capitalAllocated: '',
  convictionLevel: 'Medium',
  setupType: 'Breakout',
  holdingType: 'Intraday',
  tradeReason: '',
};

export default function Analyze() {
  const [form, setForm] = useState(defaultForm);
  const [analyzed, setAnalyzed] = useState(false);
  const [sliderSL, setSliderSL] = useState(null);
  const [avgLevels, setAvgLevels] = useState([]);
  const [saveMsg, setSaveMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const numVal = (key) => parseFloat(form[key]) || 0;

  // Use slider SL if active, otherwise form SL
  const effectiveSL = sliderSL !== null ? sliderSL : numVal('stopLoss');

  // Calculate all metrics
  const entry = numVal('entryPrice');
  const sl = effectiveSL;
  const target = numVal('targetPrice');
  const qty = numVal('quantity');
  const capital = numVal('totalCapital');
  const charges = numVal('brokerageCharges');

  const capitalAtRisk = calcCapitalAtRisk(entry, sl, qty, form.direction);
  const rewardPotential = calcRewardPotential(entry, target, qty, form.direction);
  const rrRatio = calcRiskReward(capitalAtRisk, rewardPotential);
  const riskPercent = calcRiskPercent(capitalAtRisk, capital);

  // Enforce Capital Allocated purely via math (Quantity * Entry)
  const allocated = qty * entry;
  const allocatedPercent = calcAllocatedPercent(allocated, capital);

  // Use new enhanced Panic Score logic
  const slDistance = calcStopLossDistance(entry, sl);
  const panicScore = calcPanicScore(riskPercent, rrRatio, allocatedPercent, slDistance, form.setupType, form.emotionTag);
  const radarData = computeRadarData(riskPercent, rrRatio, slDistance, allocatedPercent, form.convictionLevel);
  const breakEven = calcBreakEven(entry, charges, qty, form.direction);
  const suggestedQty = calcSuggestedQty(capital, entry, numVal('stopLoss'));

  // Averaging recalculation
  const validAvgLevels = avgLevels.filter(l => l.price > 0 && l.quantity > 0);
  const avgResult = validAvgLevels.length > 0
    ? recalcWithAveraging(entry, qty, validAvgLevels, sl, capital, form.direction)
    : null;

  const avgPanicScore = avgResult
    ? calcPanicScore(avgResult.riskPercent, rrRatio, avgResult.deployedPercent)
    : panicScore;

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (allocated > capital) return; // Prevent analysis of impossible trades
    setAnalyzed(true);
    setSliderSL(numVal('stopLoss'));
  };

  // Generate real-time warnings
  const warnings = [];
  if (entry > 0 && qty > 0) {
    if (allocated > capital) warnings.push('❌ Error: Capital Allocated exceeds Total Capital!');
    else if (allocatedPercent > 40) warnings.push('⚠️ Warning: Allocation > 40% of Total Capital');
    if (riskPercent > 10) warnings.push('⚠️ Warning: Risk exceeds 10% of Capital');
    if (slDistance > 0 && slDistance < 1) warnings.push('⚠️ Warning: Stop Loss is extremely tight (< 1%)');
    if (slDistance > 10) warnings.push('⚠️ Warning: Stop Loss is very wide (> 10%)');
    if (form.setupType === 'Other') warnings.push('⚠️ Warning: Generic "Other" setups lack edge');
  }
  const hasErrors = allocated > capital && capital > 0;

  const addAvgLevel = () => {
    if (avgLevels.length < 3) {
      setAvgLevels(prev => [...prev, { price: '', quantity: '' }]);
    }
  };

  const updateAvgLevel = (index, field, value) => {
    setAvgLevels(prev => prev.map((l, i) => i === index ? { ...l, [field]: parseFloat(value) || 0 } : l));
  };

  const removeAvgLevel = (index) => {
    setAvgLevels(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const data = {
        ...form,
        entryPrice: entry,
        stopLoss: numVal('stopLoss'),
        targetPrice: target,
        quantity: qty,
        totalCapital: capital,
        capitalAllocated: allocated,
        brokerageCharges: charges,
        averagingLevels: validAvgLevels,
      };
      await createTrade(data);
      setSaveMsg('✅ Trade saved to journal!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveMsg('❌ Error saving trade');
    }
    setSaving(false);
  };

  // Slider range
  const slMin = entry > 0 ? Math.round(entry * 0.9) : 0;
  const slMax = entry > 0 ? Math.round(entry * 1.0) : 100;

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        <span className="gradient-text">Trade Analyzer</span>
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        Enter your trade setup to get instant risk analysis, panic score, and position sizing
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: analyzed ? 'minmax(340px, 380px) 1fr' : '1fr',
        gap: '2rem',
        alignItems: 'start',
        maxWidth: analyzed ? 'none' : '550px',
        margin: analyzed ? '0' : '0 auto',
      }}>
        {/* LEFT — Trade Input Form */}
        <form onSubmit={handleAnalyze} className="card" style={{ position: 'sticky', top: '80px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-accent)' }}>
            Trade Setup
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {/* Instrument Name */}
            <div>
              <label className="input-label">Instrument Name</label>
              <input name="instrumentName" value={form.instrumentName} onChange={handleChange}
                className="input-field" placeholder="e.g., Crude Oil, Reliance" required />
            </div>

            {/* Asset Class + Direction Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="input-label">Asset Class</label>
                <select name="assetClass" value={form.assetClass} onChange={handleChange} className="input-field">
                  <option>Equity</option>
                  <option>Commodity</option>
                  <option>Crypto</option>
                  <option>Index</option>
                </select>
              </div>
              <div>
                <label className="input-label">Direction</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Long', 'Short'].map(d => (
                    <button key={d} type="button"
                      onClick={() => setForm(prev => ({ ...prev, direction: d }))}
                      style={{
                        flex: 1,
                        padding: '0.6rem',
                        borderRadius: '8px',
                        border: `1px solid ${form.direction === d ? (d === 'Long' ? '#22c55e' : '#ef4444') : 'var(--color-border)'}`,
                        background: form.direction === d ? (d === 'Long' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)') : 'transparent',
                        color: form.direction === d ? (d === 'Long' ? '#22c55e' : '#ef4444') : 'var(--color-text-muted)',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >{d === 'Long' ? '▲ Long' : '▼ Short'}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Prices Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="input-label">Entry Price (₹)</label>
                <input name="entryPrice" type="number" step="any" value={form.entryPrice} onChange={handleChange}
                  className="input-field" placeholder="0" required />
              </div>
              <div>
                <label className="input-label">Stop Loss (₹)</label>
                <input name="stopLoss" type="number" step="any" value={form.stopLoss} onChange={handleChange}
                  className="input-field" placeholder="0" required />
              </div>
              <div>
                <label className="input-label">Target (₹)</label>
                <input name="targetPrice" type="number" step="any" value={form.targetPrice} onChange={handleChange}
                  className="input-field" placeholder="0" required />
              </div>
            </div>

            {/* Quantity + Brokerage */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="input-label">Quantity / Lots</label>
                <input name="quantity" type="number" step="any" value={form.quantity} onChange={handleChange}
                  className="input-field" placeholder="0" required />
              </div>
              <div>
                <label className="input-label">Brokerage (₹)</label>
                <input name="brokerageCharges" type="number" value={form.brokerageCharges} onChange={handleChange}
                  className="input-field" />
              </div>
            </div>

            {/* Capital */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="input-label">Total Capital (₹)</label>
                <input name="totalCapital" type="number" value={form.totalCapital} onChange={handleChange}
                  className="input-field" placeholder="50000" required />
              </div>
              <div>
                <label className="input-label">Capital Allocated (₹)</label>
                <input type="text" value={allocated > 0 ? allocated.toFixed(2) : '-'} readOnly
                  className="input-field"
                  style={{ background: 'var(--color-bg-elevated)', color: allocated > capital ? '#ef4444' : 'var(--color-text-secondary)', cursor: 'not-allowed' }}
                  title="Auto-calculated: Quantity × Entry Price" />
              </div>
            </div>

            {/* Conviction + Setup */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="input-label">Conviction</label>
                <select name="convictionLevel" value={form.convictionLevel} onChange={handleChange} className="input-field">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div>
                <label className="input-label">Setup Type</label>
                <select name="setupType" value={form.setupType} onChange={handleChange} className="input-field">
                  <option>Breakout</option>
                  <option>Reversal</option>
                  <option>Pullback</option>
                  <option>Trend</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            {/* Holding Type */}
            <div>
              <label className="input-label">Holding Type</label>
              <select name="holdingType" value={form.holdingType} onChange={handleChange} className="input-field">
                <option>Intraday</option>
                <option>Swing</option>
                <option>Positional</option>
              </select>
            </div>

            {/* Trade Reason */}
            <div>
              <label className="input-label">Trade Reason</label>
              <textarea name="tradeReason" value={form.tradeReason} onChange={handleChange}
                className="input-field" placeholder="e.g., Breakout above resistance with volume" />
            </div>

            {/* Real-time Warnings */}
            {warnings.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                {warnings.map((w, idx) => (
                  <div key={idx} style={{
                    fontSize: '0.8rem', fontWeight: 600,
                    color: w.startsWith('❌') ? '#ef4444' : '#eab308'
                  }}>
                    {w}
                  </div>
                ))}
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', opacity: hasErrors ? 0.5 : 1 }} disabled={hasErrors}>
              Analyze Trade ◉
            </button>
          </div>
        </form>

        {/* RIGHT — Risk Dashboard */}
        {analyzed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Row 1: Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
              <StatCard label="Capital at Risk" value={formatINR(capitalAtRisk)}
                color={getRiskColor(riskPercent)} icon="🎯" className="stagger-1 animate-fade-in-up" />
              <StatCard label="Reward Potential" value={formatINR(rewardPotential)}
                color="#22c55e" icon="💰" className="stagger-2 animate-fade-in-up" />
              <StatCard label="Risk:Reward" value={`1:${rrRatio}`}
                color={getRRColor(rrRatio)} icon="⚖️" className="stagger-3 animate-fade-in-up" />
              <StatCard label="Risk % of Account" value={`${riskPercent}%`}
                color={getRiskColor(riskPercent)} icon="📊" className="stagger-4 animate-fade-in-up" />
            </div>

            {/* Row 2: Panic Meter + Radar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <PanicMeter score={avgResult ? avgPanicScore : panicScore} />
              <RiskRadar data={radarData} />
            </div>

            {/* Row 3: Verdict */}
            <VerdictCard panicScore={avgResult ? avgPanicScore : panicScore} riskPercent={riskPercent} />

            {/* Row 4: Scenario Slider */}
            <div className="card">
              <h3 style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '1rem',
              }}>🎚️ Scenario Slider — Adjust Stop Loss</h3>
              <input
                type="range"
                min={slMin}
                max={slMax}
                step={1}
                value={effectiveSL}
                onChange={(e) => setSliderSL(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '0.5rem',
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
              }}>
                <span>Tight SL: ₹{slMax}</span>
                <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                  Current: ₹{effectiveSL}
                </span>
                <span>Wide SL: ₹{slMin}</span>
              </div>
            </div>

            {/* Row 5: Averaging Section */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{
                  fontSize: '0.85rem', fontWeight: 600,
                  color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>📉 Averaging Down Simulator</h3>
                <button onClick={addAvgLevel} className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  disabled={avgLevels.length >= 3}>
                  + Add Level
                </button>
              </div>

              {avgLevels.map((level, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr auto',
                  gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'end',
                }}>
                  <div>
                    <label className="input-label">Price (₹)</label>
                    <input type="number" step="any" value={level.price || ''}
                      onChange={(e) => updateAvgLevel(i, 'price', e.target.value)}
                      className="input-field" placeholder="Avg price" />
                  </div>
                  <div>
                    <label className="input-label">Quantity</label>
                    <input type="number" step="any" value={level.quantity || ''}
                      onChange={(e) => updateAvgLevel(i, 'quantity', e.target.value)}
                      className="input-field" placeholder="Qty" />
                  </div>
                  <button onClick={() => removeAvgLevel(i)} className="btn-danger"
                    style={{ padding: '0.5rem 0.75rem', marginBottom: '1px' }}>✕</button>
                </div>
              ))}

              {avgResult && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '0.75rem',
                  }}>
                    <div className="card-elevated" style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>New Avg Price</p>
                      <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent)' }}>₹{avgResult.newAvgPrice}</p>
                    </div>
                    <div className="card-elevated" style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total Qty</p>
                      <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{avgResult.totalQty}</p>
                    </div>
                    <div className="card-elevated" style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Deployed</p>
                      <p style={{ fontSize: '1.1rem', fontWeight: 700, color: avgResult.deployedPercent > 50 ? '#ef4444' : '#22c55e' }}>
                        {avgResult.deployedPercent.toFixed(1)}%
                      </p>
                    </div>
                    <div className="card-elevated" style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Risk</p>
                      <p style={{ fontSize: '1.1rem', fontWeight: 700, color: getRiskColor(avgResult.riskPercent) }}>
                        {formatINR(avgResult.capitalAtRisk)}
                      </p>
                    </div>
                  </div>

                  {avgResult.deployedPercent > 50 && (
                    <div className="verdict-danger" style={{
                      borderRadius: '8px', padding: '0.75rem 1rem', marginTop: '0.75rem',
                    }}>
                      <p style={{ fontSize: '0.85rem' }}>
                        ⚠️ You have deployed {avgResult.deployedPercent.toFixed(1)}% of your capital in one trade. This is becoming a trap.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Row 6: Position Size Suggestion */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(0,180,216,0.08), rgba(124,58,237,0.08))',
              borderColor: 'var(--color-border-accent)',
            }}>
              <h3 style={{
                fontSize: '0.85rem', fontWeight: 600,
                color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em',
                marginBottom: '0.5rem',
              }}>💡 Position Size Suggestion</h3>
              <p style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                To risk only <span style={{ color: '#22c55e', fontWeight: 700 }}>2%</span> of your capital (₹{capital.toLocaleString('en-IN')}) on this setup, you should buy{' '}
                <span style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '1.2rem' }}>{suggestedQty}</span> units.
              </p>
            </div>

            {/* Row 7: Break-Even */}
            <div className="card-elevated" style={{
              padding: '1rem 1.5rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Break-even with charges:
              </span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                ₹{breakEven}
              </span>
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button onClick={handleSave} className="btn-primary" disabled={saving}
                style={{ flex: 1 }}>
                {saving ? 'Saving...' : '💾 Save to Journal'}
              </button>
              {saveMsg && (
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{saveMsg}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
