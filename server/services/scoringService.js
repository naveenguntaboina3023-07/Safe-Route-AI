/**
 * SafeRoute AI — Safety Scoring Service
 * Implements the weighted formula from SRS Section 6.
 *
 * S = 100 × (wL·L + wP·P + wR·R + wC·C + wT·T)
 * Weights: Lighting 0.30, Security 0.25, Reports 0.20, Crowd 0.15, Time 0.10
 */

const WEIGHTS = {
  lighting: 0.30,
  security: 0.25,
  reports:  0.20,
  crowd:    0.15,
  time:     0.10,
};

// ---------------------------------------------------------------------------
// Factor normalizers (each returns a value in [0, 1])
// ---------------------------------------------------------------------------

function lightingFactor(lightingQuality) {
  const map = { Good: 1.0, Moderate: 0.55, Poor: 0.1 };
  return map[lightingQuality] ?? 0.55;
}

function securityFactor(securityPointCount) {
  // 0 points → 0.0, 1 → 0.5, 2 → 0.75, 3+ → 1.0
  if (securityPointCount <= 0) return 0.0;
  if (securityPointCount === 1) return 0.5;
  if (securityPointCount === 2) return 0.75;
  return 1.0;
}

function reportsFactor(approvedReports) {
  // Each approved report reduces the score; high-severity reports penalize more
  let penalty = 0;
  approvedReports.forEach((r) => {
    if (r.severity === 'High')   penalty += 0.25;
    else if (r.severity === 'Medium') penalty += 0.15;
    else penalty += 0.08;
  });
  return Math.max(0, 1.0 - penalty);
}

function crowdFactor(level) {
  // More crowd activity → perceived safer during day; used as a mild positive
  const map = { High: 1.0, Medium: 0.65, Low: 0.3 };
  return map[level] ?? 0.65;
}

function timeFactor(travelTime) {
  // Morning / Afternoon → full score; Evening → reduced; Night → lowest
  if (!travelTime) return 0.7;
  const lower = travelTime.toLowerCase();
  if (lower.includes('morning') || lower.includes('afternoon')) return 1.0;
  if (lower.includes('evening')) return 0.55;
  if (lower.includes('night'))   return 0.3;
  return 0.7;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function computeSafetyScore(params) {
  const {
    lightingQuality = 'Moderate',
    securityPointCount = 0,
    approvedReports = [],
    crowdLevel = 'Medium',
    travelTime = 'Morning',
  } = params;

  const L = lightingFactor(lightingQuality);
  const P = securityFactor(securityPointCount);
  const R = reportsFactor(approvedReports);
  const C = crowdFactor(crowdLevel);
  const T = timeFactor(travelTime);

  const raw = WEIGHTS.lighting  * L
            + WEIGHTS.security  * P
            + WEIGHTS.reports   * R
            + WEIGHTS.crowd     * C
            + WEIGHTS.time      * T;

  const score = Math.round(Math.min(100, Math.max(0, raw * 100)));
  return { score, factors: { L, P, R, C, T } };
}

function classifyRisk(score) {
  if (score >= 80) return { level: 'Lower estimated risk',    color: 'green'  };
  if (score >= 50) return { level: 'Moderate estimated risk', color: 'amber'  };
  return             { level: 'Higher estimated risk',        color: 'red'    };
}

function buildExplanation(factors, params) {
  const reasons = [];

  if (factors.L >= 0.8)      reasons.push('Good lighting along this route');
  else if (factors.L <= 0.2) reasons.push('Poor lighting detected along this route');
  else                        reasons.push('Moderate lighting along this route');

  if (factors.P >= 0.75)     reasons.push(`${params.securityPointCount} security/CCTV points nearby`);
  else if (factors.P === 0)  reasons.push('No security or CCTV points near this route');

  const rCount = params.approvedReports?.length ?? 0;
  if (rCount === 0)           reasons.push('No approved safety reports near this route');
  else                        reasons.push(`${rCount} approved safety report(s) near this route`);

  if (factors.T < 0.4)       reasons.push('Night-time travel increases estimated risk');
  else if (factors.T < 0.6)  reasons.push('Evening travel — reduced activity level');

  return reasons;
}

module.exports = { computeSafetyScore, classifyRisk, buildExplanation };
