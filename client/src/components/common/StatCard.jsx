export default function StatCard({ label, value, subtext, color = '#00b4d8', icon, className = '' }) {
  return (
    <div className={`card animate-fade-in-up ${className}`} style={{
      minWidth: '160px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle gradient accent at top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${color}, transparent)`,
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem',
          }}>{label}</p>
          <p style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: color,
            lineHeight: 1.2,
          }}>{value}</p>
          {subtext && (
            <p style={{
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)',
              marginTop: '0.35rem',
            }}>{subtext}</p>
          )}
        </div>
        {icon && (
          <span style={{
            fontSize: '1.5rem',
            opacity: 0.5,
          }}>{icon}</span>
        )}
      </div>
    </div>
  );
}
