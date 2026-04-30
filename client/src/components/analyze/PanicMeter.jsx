import { PieChart, Pie, Cell } from 'recharts';
import { getPanicColor, getPanicLabel } from '../../utils/formatters';

export default function PanicMeter({ score = 0 }) {
  const color = getPanicColor(score);
  const label = getPanicLabel(score);

  // Create the gauge segments: green, yellow, red
  const gaugeData = [
    { name: 'Safe', value: 30, color: '#22c55e' },
    { name: 'Caution', value: 30, color: '#eab308' },
    { name: 'Reckless', value: 40, color: '#ef4444' },
  ];

  // Background (unfilled part) — make it invisible
  const bgData = [{ value: 100 }];

  // Calculate needle angle: score 0 = 180°, score 100 = 0°
  const needleAngle = 180 - (score / 100) * 180;
  const needleRad = (needleAngle * Math.PI) / 180;
  const cx = 150;
  const cy = 130;
  const needleLen = 80;
  const needleX = cx + needleLen * Math.cos(needleRad);
  const needleY = cy - needleLen * Math.sin(needleRad);

  return (
    <div className="card" style={{ textAlign: 'center', position: 'relative' }}>
      <h3 style={{
        fontSize: '0.85rem',
        fontWeight: 600,
        color: 'var(--color-text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '0.5rem',
      }}>Panic Meter</h3>

      <div style={{ position: 'relative', display: 'inline-block' }}>
        <PieChart width={300} height={170}>
          {/* Gauge arc */}
          <Pie
            data={gaugeData}
            cx={150}
            cy={130}
            startAngle={180}
            endAngle={0}
            innerRadius={70}
            outerRadius={100}
            dataKey="value"
            stroke="none"
          >
            {gaugeData.map((entry, i) => (
              <Cell key={i} fill={entry.color} opacity={0.7} />
            ))}
          </Pie>
        </PieChart>

        {/* Needle SVG overlay */}
        <svg
          width={300}
          height={170}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        >
          {/* Needle line */}
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            style={{
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
          {/* Center dot */}
          <circle cx={cx} cy={cy} r={6} fill={color} />
          <circle cx={cx} cy={cy} r={3} fill="var(--color-bg-surface)" />
        </svg>

        {/* Score display */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}>
          <span style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: color,
            textShadow: `0 0 20px ${color}40`,
            transition: 'color 0.5s ease',
          }}>{score}</span>
          <p style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: color,
            marginTop: '0.1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>{label}</p>
        </div>
      </div>
    </div>
  );
}
