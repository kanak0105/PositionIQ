import { useState } from 'react';
import { getAICoachInsights } from '../api/tradeApi';

export default function Insights() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setInsights(null);
    try {
      const res = await getAICoachInsights();
      setInsights(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to get AI insights. Please try again.';
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        <span className="gradient-text">AI Trade Coach</span>
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        AI-powered behavioral analysis and actionable coaching from your trade history
      </p>

      {/* Trigger Button */}
      {!insights && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(0,180,216,0.15), rgba(124,58,237,0.15))',
            border: '2px solid rgba(0,180,216,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
            fontSize: '3rem',
          }} className="animate-pulse-glow">
            🧠
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Ready for your coaching session?
          </h2>
          <p style={{
            color: 'var(--color-text-muted)', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.6,
          }}>
            Your AI coach will analyze all your closed trades, compute performance metrics, and give you personalized behavioral insights.
          </p>
          <button onClick={handleAnalyze} className="btn-primary" style={{
            fontSize: '1.1rem', padding: '1rem 2.5rem', borderRadius: '12px',
          }}>
            ✦ Analyse with AI Coach
          </button>

          {error && (
            <div className="verdict-danger" style={{ borderRadius: '8px', padding: '1rem', marginTop: '1.5rem', maxWidth: '500px', margin: '1.5rem auto 0' }}>
              <p>{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-accent)',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem',
          }} />
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
            AI Coach is analyzing your trades...
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            This may take a few seconds
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Results */}
      {insights && (
        <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Observations */}
          <div>
            <h2 style={{
              fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <span style={{ fontSize: '1.3rem' }}>📊</span> Key Observations
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {insights.observations?.map((obs, i) => (
                <div key={i} className="card" style={{
                  borderLeft: '4px solid var(--color-accent)',
                }}>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>{obs}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings */}
          <div>
            <h2 style={{
              fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <span style={{ fontSize: '1.3rem' }}>⚠️</span> Warning Signs
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {insights.warnings?.map((warn, i) => (
                <div key={i} className="verdict-danger" style={{ borderRadius: 'var(--radius-card)', padding: '1.25rem' }}>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>{warn}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Improvements */}
          <div>
            <h2 style={{
              fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <span style={{ fontSize: '1.3rem' }}>💡</span> Action Plan
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {insights.improvements?.map((imp, i) => (
                <div key={i} className="verdict-safe" style={{ borderRadius: 'var(--radius-card)', padding: '1.25rem' }}>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>{imp}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Coach's Note */}
          <div>
            <h2 style={{
              fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <span style={{ fontSize: '1.3rem' }}>🎯</span> Coach&apos;s Note
            </h2>
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(0,180,216,0.1), rgba(124,58,237,0.1))',
              borderColor: 'var(--color-border-accent)',
              padding: '2rem',
              textAlign: 'center',
            }}>
              <p style={{
                fontSize: '1.1rem',
                lineHeight: 1.7,
                color: 'var(--color-text-primary)',
                fontWeight: 500,
                fontStyle: 'italic',
              }}>
                "{insights.closing}"
              </p>
            </div>
          </div>

          {/* Re-analyze button */}
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button onClick={handleAnalyze} className="btn-secondary">
              🔄 Re-analyze
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
