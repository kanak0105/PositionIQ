import { getVerdict } from '../../utils/formatters';

export default function VerdictCard({ panicScore, riskPercent }) {
  const verdict = getVerdict(panicScore, riskPercent);

  return (
    <div className={`${verdict.className} animate-fade-in-up`} style={{
      borderRadius: 'var(--radius-card)',
      padding: '1.25rem 1.5rem',
      transition: 'all 0.5s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.5rem' }}>{verdict.icon}</span>
        <div>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: '0.25rem',
          }}>
            {verdict.title}
          </h3>
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
          }}>
            {verdict.message}
          </p>
        </div>
      </div>
    </div>
  );
}
