// Format date to readable string
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// Safety score helpers
export function getScoreColor(score) {
  if (score >= 80) return '#16a34a';
  if (score >= 50) return '#d97706';
  return '#dc2626';
}

export function getScoreBg(score) {
  if (score >= 80) return 'bg-green-50 border-green-200';
  if (score >= 50) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

export function getRiskLabel(score) {
  if (score >= 80) return 'Lower estimated risk';
  if (score >= 50) return 'Moderate estimated risk';
  return 'Higher estimated risk';
}

export function getRiskBadge(score) {
  if (score >= 80) return 'badge-safe';
  if (score >= 50) return 'badge-moderate';
  return 'badge-danger';
}

export function getStatusBadge(status) {
  const map = { Pending: 'badge-pending', Approved: 'badge-approved', Rejected: 'badge-rejected' };
  return map[status] || 'badge-pending';
}

export function getSeverityBadge(severity) {
  const map = { Low: 'badge-safe', Medium: 'badge-moderate', High: 'badge-danger' };
  return map[severity] || 'badge-pending';
}

// Truncate long strings
export function truncate(str, len = 60) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

// Extract error message from Axios error
export function getErrorMessage(err) {
  return err?.response?.data?.message || err?.message || 'Something went wrong.';
}
