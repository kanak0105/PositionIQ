import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout({ user, onLogout }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <Navbar user={user} onLogout={onLogout} />
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '1.5rem',
      }}>
        <Outlet />
      </main>
    </div>
  );
}
