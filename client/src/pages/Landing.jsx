import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import StatCard from '../components/common/StatCard';
import { fetchAnalytics } from '../api/tradeApi';

export default function Landing() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAnalytics().then(res => setStats(res.data)).catch(() => {});
  }, []);

  const features = [
    {
      icon: '◉',
      title: 'Risk Analysis',
      desc: 'Calculate risk, reward, and panic score before you enter. Visual gauges and radar charts make risk intuitive.',
      gradient: 'linear-gradient(135deg, #00b4d8, #0077b6)',
    },
    {
      icon: '◎',
      title: 'Averaging Simulator',
      desc: 'Simulate averaging down before committing more capital. See exactly when a trade becomes a trap.',
      gradient: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
    },
    {
      icon: '✦',
      title: 'AI Insights',
      desc: 'Gemini-powered trading coach analyses your journal and delivers personalized behavioral coaching.',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    },
  ];

  const whyCards = [
    { icon: '⚡', title: 'Real-time', desc: 'Instant calculations as you type. Zero page reloads.' },
    { icon: '📊', title: 'Visual', desc: 'Gauges, radars, and charts that make risk tangible.' },
    { icon: '🧠', title: 'Smart', desc: 'AI coaching that learns from your trading patterns.' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '4rem 1rem 3rem',
        position: 'relative',
      }}>
        {/* Subtle background glow */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(0,180,216,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="animate-fade-in-up" style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 900,
            marginBottom: '1rem',
            lineHeight: 1.1,
          }}>
            <span className="gradient-text">PositionIQ</span>
          </h1>
          <p style={{
            fontSize: '1.3rem',
            color: 'var(--color-text-secondary)',
            fontWeight: 300,
            marginBottom: '0.5rem',
          }}>
            Position smarter. Risk better.
          </p>
          <p style={{
            fontSize: '0.95rem',
            color: 'var(--color-text-muted)',
            marginBottom: '2.5rem',
          }}>
            Built for Indian retail traders — equity, commodity, crypto.
          </p>
          <button
            onClick={() => navigate('/analyze')}
            className="btn-primary animate-pulse-glow"
            style={{
              fontSize: '1.1rem',
              padding: '1rem 2.5rem',
              borderRadius: '12px',
            }}
          >
            Analyze My Trade →
          </button>
        </div>
      </section>

      {/* Feature Cards */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem',
      }}>
        {features.map((f, i) => (
          <div
            key={i}
            className={`card animate-fade-in-up stagger-${i + 1}`}
            style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
            onClick={() => navigate(i === 0 ? '/analyze' : i === 1 ? '/averaging' : '/insights')}
          >
            {/* Gradient accent */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: f.gradient,
            }} />
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: f.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              marginBottom: '1rem',
            }}>{f.icon}</div>
            <h3 style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              marginBottom: '0.5rem',
            }}>{f.title}</h3>
            <p style={{
              fontSize: '0.9rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
            }}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Why PositionIQ */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
          color: 'var(--color-text-primary)',
        }}>Why PositionIQ</h2>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          {whyCards.map((w, i) => (
            <div key={i} style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-pill)',
              padding: '1rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              minWidth: '240px',
              transition: 'all 0.3s ease',
            }} className="animate-fade-in-up">
              <span style={{ fontSize: '1.5rem' }}>{w.icon}</span>
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{w.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{w.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Overview Dashboard Preview */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '1.3rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
        }}>📊 Dashboard Overview</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}>
          <StatCard
            label="Avg Risk/Trade"
            value={stats && !stats.locked ? `${stats.avgRiskPercent}%` : '—'}
            icon="🎯"
            color={stats && !stats.locked && stats.avgRiskPercent < 3 ? '#22c55e' : '#eab308'}
          />
          <StatCard
            label="Avg Risk:Reward"
            value={stats && !stats.locked ? `1:${stats.avgRR}` : '—'}
            icon="⚖️"
            color={stats && !stats.locked && stats.avgRR >= 1.5 ? '#22c55e' : '#eab308'}
          />
          <StatCard
            label="Win Rate"
            value={stats && !stats.locked ? `${stats.winRate}%` : '—'}
            icon="🏆"
            color={stats && !stats.locked && stats.winRate >= 50 ? '#22c55e' : '#eab308'}
          />
          <StatCard
            label="Portfolio Heat"
            value={stats && !stats.locked ? `${stats.portfolioHeat}%` : '—'}
            icon="🔥"
            color={stats && !stats.locked && stats.portfolioHeat < 4 ? '#22c55e' :
                   stats && !stats.locked && stats.portfolioHeat < 8 ? '#eab308' : '#ef4444'}
          />
        </div>
      </section>

      {/* Footer tagline */}
      <section style={{
        textAlign: 'center',
        padding: '2rem 0 1rem',
        borderTop: '1px solid var(--color-border)',
      }}>
        <p style={{
          color: 'var(--color-text-muted)',
          fontSize: '0.85rem',
          fontStyle: 'italic',
        }}>
          "Every broker shows you HOW to trade. Nobody shows you WHETHER you SHOULD trade."
        </p>
      </section>
    </div>
  );
}
