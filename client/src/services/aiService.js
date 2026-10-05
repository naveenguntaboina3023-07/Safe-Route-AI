/**
 * SafeRoute AI — Client-side Mock AI Service
 * Returns realistic structured JSON matching SRS Section 6.3 AI prompt design.
 * No API key required. Simulates 800ms network delay.
 */

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Helpers ──────────────────────────────────────────────────────────────────

function scoreToRisk(score) {
  if (score >= 80) return 'Lower estimated risk';
  if (score >= 50) return 'Moderate estimated risk';
  return 'Higher estimated risk';
}

function buildReasons(route) {
  const reasons = [];
  if (route.lightingQuality === 'Good')     reasons.push('Good lighting coverage along the route');
  else if (route.lightingQuality === 'Poor') reasons.push('Poor lighting detected along this route');
  else                                        reasons.push('Moderate lighting along the route');

  if (route.securityPointCount >= 2) reasons.push(`${route.securityPointCount} security/CCTV points provide coverage`);
  else if (route.securityPointCount === 1)   reasons.push('One security point provides partial coverage');
  else                                        reasons.push('No security or CCTV points near this route');

  const rCount = route.reportCount ?? route.approvedReports?.length ?? 0;
  if (rCount === 0) reasons.push('No approved safety reports for this route');
  else              reasons.push(`${rCount} approved safety report(s) affect this route's score`);

  if (route.crowdLevel === 'High')   reasons.push('High crowd activity offers additional perceived safety');
  else if (route.crowdLevel === 'Low') reasons.push('Low crowd activity may increase perceived isolation');

  const lower = (route.travelTime || '').toLowerCase();
  if (lower.includes('night'))   reasons.push('Night-time travel increases estimated risk');
  else if (lower.includes('evening')) reasons.push('Evening travel — reduced visibility and activity');

  return reasons;
}

// ── Main mock function ────────────────────────────────────────────────────────

export async function getMockAIAnalysis(routes) {
  await delay(800); // simulate AI latency

  const scored = routes.map((r, i) => ({
    routeName: r.name || `Route ${String.fromCharCode(65 + i)}`,
    safetyScore: r.safetyScore ?? Math.floor(Math.random() * 40 + 55),
    riskLevel: scoreToRisk(r.safetyScore ?? 65),
    reasons: buildReasons(r),
    recommendation: false,
  }));

  // Mark best
  const best = scored.reduce((a, b) => (a.safetyScore >= b.safetyScore ? a : b));
  best.recommendation = true;

  return {
    routes: scored,
    overallRecommendation: `${best.routeName} has the better estimated safety profile based on available data.`,
    disclaimer:
      'Safety recommendations are estimates based on available data and may not reflect current real-world conditions.',
    source: 'mock-ai',
  };
}

// Standalone helpers for other pages if needed
export function getScoreBadgeClass(score) {
  if (score >= 80) return 'badge-safe';
  if (score >= 50) return 'badge-moderate';
  return 'badge-danger';
}

export function getScoreColorClass(score) {
  if (score >= 80) return 'text-green-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-red-600';
}

export function getRiskLabel(score) {
  return scoreToRisk(score);
}
