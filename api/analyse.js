import { MARKETING_KNOWLEDGE, buildResearchContext } from "./knowledge.js";

/**
 * Direct Anthropic API call — no AI SDK overhead for fastest cold start.
 * Split into 2 parts (analysis/creative), called in parallel from client.
 */

const STRUCTURES = {
  analysis: `{"audit":{"score":0,"diagnosis":"","wins":[],"leaks":[],"fixes":[{"issue":"","fix":"","impact":""}]},"offer":{"headline":"","subheadline":"","promise":"","bullets":[],"guarantee":"","bonuses":[{"name":"","value":"","description":""}],"cta":"","urgency":""},"pain":{"core_pain":"","surface_pains":[],"hidden_pains":[],"desired_outcomes":[],"objections":[{"objection":"","reframe":""}],"emotional_triggers":[]},"spec":{"avatar":{"name":"","age":"","role":"","frustrations":[],"goals":[],"media_habits":[]},"mechanism":"","positioning":"","tone":"","channels":[{"channel":"","priority":"","reason":""}],"brand_voice":[]}}`,
  creative: `{"hooks":[{"hook":"","angle":"","platform":"","type":""}],"scripts":{"ads":[{"platform":"","format":"","hook":"","body":"","cta":""}],"emails":[{"purpose":"","subject":"","preview":"","body":""}],"landing_page":{"hero_headline":"","hero_subheadline":"","sections":[{"type":"","content":""}]}},"funnel":{"strategy":"","steps":[{"name":"","description":"","conversion_goal":"","content_type":""}],"kpis":[{"metric":"","target":"","why":""}]}}`,
};

const PART_TASKS = {
  analysis: "Erstelle: Audit (Score 0-100, Diagnose, Wins, Leaks, Fixes), Offer (Godfather-Angebot), Pain (Schmerz + Einwände), Spec (Avatar + Mechanismus + Kanäle).",
  creative: "Erstelle: Hooks (mind. 8, Thumb-Stop 0.5s, verschiedene Plattformen+Typen), Scripts (mind. 3 Ads + 3 Emails copy-paste-fertig + Landing Page), Funnel (Strategie + Steps + KPIs).",
};

const AWARENESS = {
  1: "UNAWARE – kennt Problem nicht. Fokus: Problemaufdeckung, Education.",
  2: "PROBLEM AWARE – spürt Schmerz. Fokus: Agitation, Lösungsrichtung.",
  3: "SOLUTION AWARE – kennt Lösungen. Fokus: Differenzierung, Mechanismus.",
  4: "PRODUCT AWARE – kennt Produkt. Fokus: Einwandbehandlung, Trust.",
  5: "MOST AWARE – kaufbereit. Fokus: Urgency, Scarcity, CTA.",
};

function extractJson(text) {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = cleaned.indexOf("{");
  if (start === -1) return null;
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < cleaned.length; i++) {
    const c = cleaned[i];
    if (inStr) { if (esc) { esc = false; } else if (c === "\\") { esc = true; } else if (c === '"') { inStr = false; } continue; }
    if (c === '"') { inStr = true; continue; }
    if (c === "{") depth++;
    if (c === "}") { depth--; if (depth === 0) return cleaned.slice(start, i + 1); }
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt, awarenessLevel, researchData, part } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "prompt fehlt" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY fehlt." });

  const sectionPart = part === "creative" ? "creative" : "analysis";
  const modelId = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";

  const system = `Du bist SCALE ENGINE, ein Elite Direct-Response Marketing Strategist (Hormozi, Suby, Brunson).
Awareness: ${AWARENESS[awarenessLevel] || AWARENESS[3]}
Alle Texte Deutsch, conversion-fokussiert, spezifisch fürs Unternehmen, keine Floskeln.
Antworte NUR mit validem JSON.`;

  const researchCtx = buildResearchContext(researchData);

  const userPrompt = `${prompt}
${researchCtx}

MARKETING-WISSEN:
${MARKETING_KNOWLEDGE}

AUFGABE: ${PART_TASKS[sectionPart]}
JSON-Struktur: ${STRUCTURES[sectionPart]}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: modelId,
        max_tokens: 4096,
        temperature: 0.3,
        system,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", response.status, err);
      return res.status(502).json({ error: `Anthropic API: ${response.status}` });
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text || "";

    const jsonStr = extractJson(text);
    if (!jsonStr) {
      console.error("No JSON found in:", text.slice(0, 300));
      return res.status(502).json({ error: "Kein gültiges JSON in der Antwort." });
    }

    const parsed = JSON.parse(jsonStr);
    return res.status(200).json({ ok: true, part: sectionPart, result: parsed });
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: err?.message || "Serverfehler" });
  }
}
