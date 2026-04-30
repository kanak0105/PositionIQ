import { NavLink } from 'react-router-dom';
import { useState } from 'react';

const navItems = [
  { path: '/', label: 'Overview', icon: '◈' },
  { path: '/analyze', label: 'Analyze', icon: '◉' },
  { path: '/averaging', label: 'Averaging', icon: '◎' },
  { path: '/journal', label: 'Journal', icon: '☰' },
  { path: '/analytics', label: 'Analytics', icon: '◫' },
  { path: '/insights', label: 'Insights', icon: '✦' },
];

export default function Navbar({ user, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav style={{
      background: 'linear-gradient(180deg, #141820 0%, #0f1117 100%)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Logo */}
        <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #00b4d8, #7c3aed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            fontWeight: 800,
            color: 'white',
          }}>P</div>
          <span style={{
            fontSize: '1.2rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #00b4d8, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}>PositionIQ</span>
        </NavLink>

        {/* Desktop Nav */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
        }} className="desktop-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#00b4d8' : '#94a3b8',
                background: isActive ? 'rgba(0, 180, 216, 0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(0, 180, 216, 0.25)' : '1px solid transparent',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: isActive ? '0 0 12px rgba(0, 180, 216, 0.15)' : 'none',
              })}
            >
              <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {/* User + Logout */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.75rem', paddingLeft: '0.75rem', borderLeft: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>👤 {user.name}</span>
              <button onClick={onLogout} style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}>Logout</button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="mobile-menu-btn"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: '#f1f5f9',
            fontSize: '1.5rem',
            cursor: 'pointer',
          }}
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileOpen && (
        <div style={{
          padding: '1rem',
          background: '#141820',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }} className="mobile-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                textDecoration: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#00b4d8' : '#94a3b8',
                background: isActive ? 'rgba(0, 180, 216, 0.1)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              })}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobile-nav { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
