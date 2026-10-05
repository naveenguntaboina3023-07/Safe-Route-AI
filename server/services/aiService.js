/**
 * SafeRoute AI — Backend AI Service
 * Supports: Groq, Gemini, OpenAI
 * Falls back to rule-based scoring if AI is unavailable or returns invalid output.
 * API key is NEVER exposed to the client.
 */

const { computeSafetyScore, classifyRisk, buildExplanation } = require('./scoringService');

// ---------------------------------------------------------------------------
// Prompt builder (SRS Section 6.3)
// ---------------------------------------------------------------------------
function buildPrompt(routes) {
  const routeSummaries = routes.map((r, i) => `
Route ${String.fromCharCode(65 + i)} (${r.name}):
  - Distance: ${r.distance}
  - Estimated travel time: ${r.estimatedTime}
  - Lighting quality: ${r.lightingQuality}
  - Security/CCTV points: ${r.securityPointCount}
  - Approved safety reports nearby: ${r.approvedReports?.length ?? r.reportCount ?? 0}
  - Crowd/activity level: ${r.crowdLevel}
  - Travel time of day: ${r.travelTime}
  - Rule-based safety score: ${r.safetyScore}/100`).join('\n');

  return `You are analyzing campus route safety using ONLY the data provided below.
Compare the routes based on lighting, reported issues, security points, crowd/activity level, distance and travel time.
Do NOT claim any route is completely safe. Use language like "better estimated safety profile".
Return ONLY valid JSON — no markdown, no extra text, no explanation outside the JSON.

${routeSummaries}

Required JSON format (return exactly this structure):
{
  "routes": [
    {
      "routeName": "Route A (Main Path)",
      "safetyScore": 85,
      "riskLevel": "Lower estimated risk",
      "reasons": ["reason 1", "reason 2", "reason 3"],
      "recommendation": false
    }
  ],
  "overallRecommendation": "Route B has the better estimated safety profile based on the available data.",
  "disclaimer": "Safety recommendations are estimates based on available data and may not reflect current real-world conditions."
}

riskLevel must be exactly one of: "Lower estimated risk", "Moderate estimated risk", "Higher estimated risk"
safetyScore must be a number between 0 and 100.
Set recommendation: true for the single best route only.`;
}

// ---------------------------------------------------------------------------
// Response validator
// ---------------------------------------------------------------------------
function validateAIResponse(data, expectedRouteCount) {
  if (!data || !Array.isArray(data.routes)) return false;
  if (data.routes.length !== expectedRouteCount) return false;

  const validLevels = [
    'Lower estimated risk',
    'Moderate estimated risk',
    'Higher estimated risk',
  ];

  for (const r of data.routes) {
    if (typeof r.safetyScore !== 'number') return false;
    if (r.safetyScore < 0 || r.safetyScore > 100) return false;
    if (!validLevels.includes(r.riskLevel)) return false;
    if (!Array.isArray(r.reasons) || r.reasons.length === 0) return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Rule-based fallback
// ---------------------------------------------------------------------------
function ruleFallback(routes) {
  const scored = routes.map((r, i) => {
    const { score, factors } = computeSafetyScore(r);
    const { level } = classifyRisk(score);
    const reasons = buildExplanation(factors, r);
    return {
      routeName: r.name || `Route ${String.fromCharCode(65 + i)}`,
      safetyScore: score,
      riskLevel: level,
      reasons,
      recommendation: false,
    };
  });

  const best = scored.reduce((a, b) => (a.safetyScore >= b.safetyScore ? a : b));
  best.recommendation = true;

  return {
    routes: scored,
    overallRecommendation: `${best.routeName} has the better estimated safety profile based on the available data.`,
    disclaimer: 'Safety recommendations are estimates based on available data and may not reflect current real-world conditions.',
    source: 'rule-based',
  };
}

// ---------------------------------------------------------------------------
// Parse raw text from any AI provider into JSON
// ---------------------------------------------------------------------------
function parseAIText(rawText) {
  if (!rawText) throw new Error('Empty AI response');
  // Strip markdown code fences if present
  let cleaned = rawText
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();
  // Extract JSON object if there's surrounding text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) cleaned = jsonMatch[0];
  return JSON.parse(cleaned);
}

// ---------------------------------------------------------------------------
// Groq API call
// ---------------------------------------------------------------------------
async function callGroq(prompt, apiKey, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'llama3-8b-8192',   // Fast, free Groq model
        messages: [
          {
            role: 'system',
            content: 'You are a campus safety analyst. Always respond with valid JSON only. No markdown, no extra text.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    clearTimeout(timer);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Gemini API call
// ---------------------------------------------------------------------------
async function callGemini(prompt, apiKey, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    clearTimeout(timer);

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// OpenAI API call
// ---------------------------------------------------------------------------
async function callOpenAI(prompt, apiKey, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a campus safety analyst. Always respond with valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    clearTimeout(timer);

    if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
    const data = await response.json();
    return data?.choices?.[0]?.message?.content;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Main analysis function
// ---------------------------------------------------------------------------
async function analyzeRoutes(routes) {
  const apiKey  = process.env.AI_API_KEY;
  const provider = (process.env.AI_PROVIDER || 'groq').toLowerCase().trim();

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_ai_api_key_here') {
    console.log('ℹ️  No AI API key configured — using rule-based scoring.');
    return ruleFallback(routes);
  }

  const prompt  = buildPrompt(routes);
  const timeout = 9000; // 9 s — fallback within 10 s per SRS NFR7

  try {
    let rawText;

    if (provider === 'groq') {
      console.log('🤖 Using Groq AI (llama3-8b-8192)');
      rawText = await callGroq(prompt, apiKey, timeout);
    } else if (provider === 'gemini') {
      console.log('🤖 Using Gemini AI');
      rawText = await callGemini(prompt, apiKey, timeout);
    } else if (provider === 'openai') {
      console.log('🤖 Using OpenAI');
      rawText = await callOpenAI(prompt, apiKey, timeout);
    } else {
      // Default to Groq if key starts with gsk_
      if (apiKey.startsWith('gsk_')) {
        console.log('🤖 Auto-detected Groq key — using Groq AI');
        rawText = await callGroq(prompt, apiKey, timeout);
      } else {
        console.log(`⚠️  Unknown provider "${provider}" — using rule-based fallback.`);
        return ruleFallback(routes);
      }
    }

    const parsed = parseAIText(rawText);

    if (!validateAIResponse(parsed, routes.length)) {
      throw new Error('AI response failed schema validation');
    }

    // Ensure exactly one route is marked recommended
    const hasRec = parsed.routes.some((r) => r.recommendation);
    if (!hasRec) {
      const best = parsed.routes.reduce((a, b) => (a.safetyScore >= b.safetyScore ? a : b));
      best.recommendation = true;
    }

    console.log('✅ AI analysis successful');
    return { ...parsed, source: provider };

  } catch (err) {
    console.warn(`⚠️  AI service error (${err.message}) — using rule-based fallback.`);
    return ruleFallback(routes);
  }
}

module.exports = { analyzeRoutes };
