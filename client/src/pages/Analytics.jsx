import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar, Cell } from 'recharts';
import { fetchAnalytics } from '../api/tradeApi';
import { formatINR } from '../utils/formatters';
import StatCard from '../components/common/StatCard';
import PanicMeter from '../components/analyze/PanicMeter';

// Safe number helper — prevents .toFixed crashes on Infinity/NaN/undefined
const safe = (val, fallback = 0) => {
  if (val === undefined || val === null || isNaN(val) || !isFinite(val)) return fallback;
  return val;
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics()
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Analytics fetch error:', err);
        setError(err.message || 'Failed to load analytics');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
        Loading analytics...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.4 }}>📊</div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          {error ? 'Analytics Error' : 'No Data Yet'}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          {error || 'Save some trades from the Analyze page first, then come back here.'}
        </p>
      </div>
    );
  }

  // Safe access to all values
  const closedCount = safe(data.closedCount);
  const winRate = safe(data.winRate);
  const profitFactor = safe(data.profitFactor);
  const expectancy = safe(data.expectancy);
  const maxDrawdown = safe(data.maxDrawdown);
  const halfKelly = safe(data.halfKelly);
  const disciplineScore = safe(data.disciplineScore);
  const avgWin = safe(data.avgWin);
  const avgLoss = safe(data.avgLoss);
  const portfolioHeat = safe(data.portfolioHeat);
  const followedPlan = safe(data.followedPlan);
  const equityCurve = data.equityCurve || [];
  const convictionAccuracy = data.convictionAccuracy || {};

  // Confidence Check
  const isLowConfidence = closedCount < 5;

  // Conviction chart data (safely)
  const convictionData = Object.entries(convictionAccuracy).map(([level, info]) => ({
    name: level,
    winRate: parseFloat(info?.winRate || 0),
    total: info?.total || 0,
    fill: level === 'High' ? '#00b4d8' : level === 'Medium' ? '#7c3aed' : '#64748b',
  }));

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        <span className="gradient-text">Advanced Analytics</span>
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Deep performance insights from {closedCount} closed trades
      </p>

      {isLowConfidence && (
        <div className="verdict-danger" style={{ marginBottom: '2rem', borderRadius: '8px', padding: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>⚠️ Insight Confidence Low</h3>
          <p style={{ fontSize: '0.9rem' }}>
            You need at least 5 closed trades for statistically significant expectancy, Kelly, and win-rate metrics. 
            Currently showing raw data for {closedCount} trades.
          </p>
        </div>
      )}

      {/* Wrap everything in a container that dims if low confidence */}
      <div style={{ opacity: isLowConfidence ? 0.7 : 1, transition: 'opacity 0.3s ease' }}>

      {/* Row 1: Core Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <StatCard label="Win Rate" value={`${winRate}%`}
          subtext={`${closedCount} closed trades`}
          color={winRate >= 50 ? '#22c55e' : '#ef4444'} icon="🏆" />
        <StatCard label="Profit Factor"
          value={profitFactor.toFixed(2)}
          subtext={`For every ₹1 lost, you make ₹${profitFactor.toFixed(2)}`}
          color={profitFactor >= 1.5 ? '#22c55e' : profitFactor >= 1 ? '#eab308' : '#ef4444'} icon="📈" />
        <StatCard label="Expectancy" value={formatINR(expectancy)}
          subtext="Per trade on average"
          color={expectancy > 0 ? '#22c55e' : '#ef4444'} icon="💎" />
        <StatCard label="Max Drawdown" value={`${maxDrawdown}%`}
          subtext="Worst decline from peak"
          color={maxDrawdown < 10 ? '#22c55e' : maxDrawdown < 20 ? '#eab308' : '#ef4444'} icon="📉" />
      </div>

      {/* Row 2: More metrics + Portfolio Heat */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <StatCard label="Half-Kelly Risk" value={`${halfKelly.toFixed(1)}%`}
          subtext="Suggested max risk per trade"
          color="var(--color-accent)" icon="🎲" />
        <StatCard label="Discipline Score" value={`${disciplineScore}/100`}
          subtext={`Followed plan in ${followedPlan} of ${closedCount} trades`}
          color={disciplineScore >= 70 ? '#22c55e' : disciplineScore >= 50 ? '#eab308' : '#ef4444'} icon="🎯" />
        <StatCard label="Avg Win" value={formatINR(avgWin)}
          color="#22c55e" icon="💚" />
        <StatCard label="Avg Loss" value={formatINR(avgLoss)}
          color="#ef4444" icon="❤️" />
      </div>

      {/* Row 3: Portfolio Heat Gauge + Conviction Accuracy */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
        marginBottom: '1.5rem',
      }}>
        {/* Portfolio Heat */}
        <div>
          <PanicMeter score={Math.min(100, Math.round(portfolioHeat * 10))} />
          <div className="card-elevated" style={{ marginTop: '0.75rem', textAlign: 'center', padding: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Portfolio Heat</p>
            <p style={{
              fontSize: '1.5rem', fontWeight: 700,
              color: portfolioHeat < 4 ? '#22c55e' : portfolioHeat < 8 ? '#eab308' : '#ef4444'
            }}>{portfolioHeat}%</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              If all stops hit now, you lose {portfolioHeat}% of capital
            </p>
          </div>
        </div>

        {/* Conviction Accuracy */}
        <div className="card">
          <h3 style={{
            fontSize: '0.85rem', fontWeight: 600,
            color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em',
            marginBottom: '1rem',
          }}>Conviction Accuracy</h3>
          {convictionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={convictionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3a" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={70} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#1a1d26', border: '1px solid #2a2e3a', borderRadius: '8px' }}
                  labelStyle={{ color: '#f1f5f9' }}
                  formatter={(val) => [`${val}%`, 'Win Rate']}
                />
                <Bar dataKey="winRate" radius={[0, 6, 6, 0]} barSize={24}>
                  {convictionData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No conviction data yet.</p>
          )}

          {/* Highlight if High < Medium */}
          {convictionAccuracy.High && convictionAccuracy.Medium &&
            parseFloat(convictionAccuracy.High.winRate) < parseFloat(convictionAccuracy.Medium.winRate) && (
            <div className="verdict-caution" style={{ borderRadius: '8px', padding: '0.75rem', marginTop: '0.75rem' }}>
              <p style={{ fontSize: '0.8rem' }}>
                ⚠️ Your High Conviction trades have a {convictionAccuracy.High.winRate}% win rate — your Medium conviction win rate ({convictionAccuracy.Medium.winRate}%) is higher!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Row 4: Equity Curve */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{
          fontSize: '0.85rem', fontWeight: 600,
          color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em',
          marginBottom: '1rem',
        }}>📈 Equity Curve</h3>
        {equityCurve.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={equityCurve}>
              <defs>
                <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00b4d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3a" />
              <XAxis
                dataKey="tradeNum"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                label={{ value: 'Trade #', position: 'insideBottom', fill: '#64748b', fontSize: 12, offset: -2 }}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`}
              />
              <Tooltip
                contentStyle={{ background: '#1a1d26', border: '1px solid #2a2e3a', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
                formatter={(val) => [formatINR(val), 'Cumulative P&L']}
                labelFormatter={(l) => `Trade #${l}`}
              />
              <Area
                type="monotone"
                dataKey="cumPnL"
                stroke="#00b4d8"
                fill="url(#eqGrad)"
                strokeWidth={2}
                dot={{ fill: '#00b4d8', r: 4, stroke: '#1a1d26', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>
            No equity curve data. Close some trades to see your performance graph.
          </p>
        )}
      </div>
      
      </div> {/* End wrapper */}
    </div>
  );
}
