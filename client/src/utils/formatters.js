// ===== Formatting Utilities =====

/**
 * Format number as Indian Rupees with ₹ symbol
 */
export function formatINR(value) {
  if (value === null || value === undefined || isNaN(value)) return '₹0';
  const absVal = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  // Use Indian numbering system (lakhs, thousands)
  const formatted = absVal.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return `${sign}₹${formatted}`;
}

/**
 * Get color class based on thresholds
 * @param {number} value
 * @param {object} thresholds - { green: max, yellow: max, red: above }
 * @returns {'green' | 'yellow' | 'red'}
 */
export function getColorLevel(value, thresholds) {
  if (value <= thresholds.green) return 'green';
  if (value <= thresholds.yellow) return 'yellow';
  return 'red';
}

/**
 * Risk % color: green < 3%, yellow 3-5%, red > 5%
 */
export function getRiskColor(riskPercent) {
  if (riskPercent < 3) return '#22c55e';
  if (riskPercent <= 5) return '#eab308';
  return '#ef4444';
}

/**
 * R:R color: green ≥ 1.5, yellow 1-1.5, red < 1
 */
export function getRRColor(rr) {
  if (rr >= 1.5) return '#22c55e';
  if (rr >= 1) return '#eab308';
  return '#ef4444';
}

/**
 * Panic score color
 */
export function getPanicColor(score) {
  if (score <= 30) return '#22c55e';
  if (score <= 60) return '#eab308';
  return '#ef4444';
}

/**
 * Get panic label
 */
export function getPanicLabel(score) {
  if (score <= 30) return 'Safe Trade';
  if (score <= 60) return 'Caution';
  return 'Reckless Trade';
}

/**
 * Get verdict data based on panic score
 */
export function getVerdict(panicScore, riskPercent) {
  if (panicScore <= 30) {
    return {
      type: 'safe',
      icon: '✅',
      title: 'Healthy Trade',
      message: 'Risk is within limits. Reward justifies the risk.',
      className: 'verdict-safe',
    };
  }
  if (panicScore <= 60) {
    return {
      type: 'caution',
      icon: '⚠️',
      title: 'Moderate Risk',
      message: 'Consider reducing position size or tightening the stop loss.',
      className: 'verdict-caution',
    };
  }
  return {
    type: 'danger',
    icon: '❌',
    title: 'Reckless Trade',
    message: `You are risking ${riskPercent.toFixed(1)}% of capital. Reduce size or tighten stop.`,
    className: 'verdict-danger',
  };
}

/**
 * Outcome badge color
 */
export function getOutcomeColor(outcome) {
  switch (outcome) {
    case 'Win': return '#22c55e';
    case 'Loss': return '#ef4444';
    case 'Breakeven': return '#eab308';
    default: return '#00b4d8';
  }
}

/**
 * Format a date string nicely
 */
export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Truncate text
 */
export function truncate(str, len = 40) {
  if (!str) return '';
  return str.length > len ? str.substring(0, len) + '...' : str;
}
