import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Analyze from './pages/Analyze';
import Averaging from './pages/Averaging';
import Journal from './pages/Journal';
import Analytics from './pages/Analytics';
import Insights from './pages/Insights';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('positioniq_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('positioniq_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('positioniq_user');
  };

  return (
    <Router>
      <Routes>
        {/* Auth routes — no layout */}
        <Route path="/login" element={
          user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
        } />
        <Route path="/register" element={
          user ? <Navigate to="/" /> : <Register onLogin={handleLogin} />
        } />

        {/* Protected app routes */}
        <Route path="/" element={
          user ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
        }>
          <Route index element={<Landing />} />
          <Route path="analyze" element={<Analyze />} />
          <Route path="averaging" element={<Averaging />} />
          <Route path="journal" element={<Journal />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="insights" element={<Insights />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
