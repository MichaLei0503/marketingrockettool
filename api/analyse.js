import { buildResearchContext } from "./knowledge.js";

/**
 * Split analysis into 3 parallel parts for fastest execution.
 * Each part generates fewer tokens → completes within 45s.
 */

const STRUCTURES = {
  part1: `{"audit":{"score":0,"diagnosis":"","wins":[],"leaks":[],"fixes":[{"issue":"","fix":"","impact":"hoch|mittel|niedrig"}]},"offer":{"headline":"","subheadline":"","promise":"","bullets":[],"guarantee":"","bonuses":[{"name":"","value":"","description":""}],"cta":"","urgency":""},"pain":{"core_pain":"","surface_pains":[],"hidden_pains":[],"desired_outcomes":[],"objections":[{"objection":"","reframe":""}],"emotional_triggers":[]}}`,
  part2: `{"hooks":[{"hook":"","angle":"","platform":"Meta|TikTok|YouTube|LinkedIn|Google|Universal","type":"pattern_interrupt|scroll_stopper|curiosity|controversy|storytelling|social_proof"}],"spec":{"avatar":{"name":"","age":"","role":"","frustrations":[],"goals":[],"media_habits":[]},"mechanism":"","positioning":"","tone":"","channels":[{"channel":"","priority":"primär|sekundär|tertiär","reason":""}],"brand_voice":[]}}`,
  part3: `{"scripts":{"ads":[{"platform":"","format":"","hook":"","body":"","cta":""}],"emails":[{"purpose":"welcome|nurture|sales|abandoned_cart|reactivation","subject":"","preview":"","body":""}],"landing_page":{"hero_headline":"","hero_subheadline":"","sections":[{"type":"","content":""}]}},"funnel":{"strategy":"","steps":[{"name":"","description":"","conversion_goal":"","content_type":""}],"kpis":[{"metric":"","target":"","why":""}]}}`,
};

const PART_TASKS = {
  part1: "Erstelle: Audit (Score 0-100, Diagnose, je 3+ Wins/Leaks, 3+ Fixes), Offer (Godfather-Angebot mit Headline, Garantie, Bonuses, CTA), Pain (Kernschmerz, Oberflächen-/versteckte Schmerzen, Einwände mit Reframes).",
  part2: "Erstelle: Hooks (8 Stück, Thumb-Stop 0.5s, verschiedene Plattformen und Typen), Spec (detaillierter Avatar mit Name/Alter/Rolle, Mechanismus, Positionierung, Tone, Kanäle mit Priorität).",
  part3: "Erstelle: Scripts (3 Ad-Scripts copy-paste-fertig mit Hook/Body/CTA, 3 E-Mail-Scripts mit Subject/Preview/Body, Landing Page mit Hero + Sektionen), Funnel (Strategie, 4+ Steps, 3+ KPIs).",
};

const AWARENESS = {
  1: "UNAWARE – kennt Problem nicht. Fokus: Problemaufdeckung, Education.",
  2: "PROBLEM AWARE – spürt Schmerz. Fokus: Agitation, Lösungsrichtung.",
  3: "SOLUTION AWARE – kennt Lösungen. Fokus: Differenzierung, Mechanismus.",
  4: "PRODUCT AWARE – kennt Produkt. Fokus: Einwandbehandlung, Trust.",
  5: "MOST AWARE – kaufbereit. Fokus: Urgency, Scarcity, CTA.",
};

// Condensed knowledge — key frameworks only, no bloat
const CORE_KNOWLEDGE = `FRAMEWORKS:
- GODFATHER-ANGEBOT (Suby): So gut dass Nein dumm wäre. Spezifisch+einzigartig+vorhersehbar. Starke Garantie (Bauchschmerz-Test). Volle Risiko-Umkehr.
- TRIPLE DIAMOND: D1=Schmerz vertiefen, D2=Konkurrenz disqualifizieren (Limiting Beliefs brechen), D3=Einzigartiger Mechanismus als Lösung.
- HALO-STRATEGIE: 3% kaufbereit, 17% informieren, 20% problembewusst, 60% unbewusst. Blue Ocean=97%.
- 33%-Regel: Bis 33% LTV für Akquise. Wer am meisten pro Kunde ausgeben kann gewinnt.
- Ads=Content (Hormozi). UGC>polierte Werbung 3:1. Thumb-Stop 0.5s.
- SPECTACLE STACKING: Produkt erklärt sich visuell. Show dont tell.
- Meta: Broad Targeting+starke Creative. Video 1:1 Feed, 9:16 Stories. Retargeting 7 Tage.
- TikTok: 3s Hook oder Tod. Vertikal, roh, authentisch. Native>Werbung.
- Scripts: Problem→Agitation→Disqualifikation→Authority→CTA.
- Funnel: Nie Traffic auf Homepage. Dedizierte Landingpages. Break-Even 30 Tage.`;

function extractJson(text) {
  let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const start = cleaned.indexOf("{");
  if (start === -1) return null;

  let depth = 0, inString = false, escaped = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inString) {
      if (escaped) { escaped = false; continue; }
      if (ch === "\\") { escaped = true; continue; }
      if (ch === '"') { inString = false; }
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return cleaned.slice(start, i + 1);
    }
  }

  // JSON truncated — try to repair by closing open brackets/braces
  let partial = cleaned.slice(start);
  // Remove trailing incomplete content: find last complete value
  // Strip from last unmatched quote to end
  if (inString) {
    // We're inside a string — find and close it, then trim
    partial = partial.replace(/"[^"\\]*(?:\\.[^"\\]*)*$/, '"');
  }
  // Remove trailing comma or incomplete key-value
  partial = partial.replace(/,\s*"[^"]*"?\s*:?\s*"?[^"]*$/, "");
  partial = partial.replace(/,\s*$/, "");
  // Count open brackets and braces
  let braces = 0, brackets = 0;
  let inStr2 = false, esc2 = false;
  for (let i = 0; i < partial.length; i++) {
    const c = partial[i];
    if (inStr2) { if (esc2) { esc2 = false; } else if (c === "\\") { esc2 = true; } else if (c === '"') { inStr2 = false; } continue; }
    if (c === '"') { inStr2 = true; continue; }
    if (c === "{") braces++;
    if (c === "}") braces--;
    if (c === "[") brackets++;
    if (c === "]") brackets--;
  }
  while (brackets > 0) { partial += "]"; brackets--; }
  while (braces > 0) { partial += "}"; braces--; }
  try { JSON.parse(partial); return partial; } catch { return null; }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt, awarenessLevel, researchData, part } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "prompt fehlt" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY fehlt." });

  const validParts = ["part1", "part2", "part3"];
  const sectionPart = validParts.includes(part) ? part : "part1";
  const modelId = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";

  const system = `Du bist SCALE ENGINE, ein Elite Direct-Response Marketing Strategist (Hormozi, Suby, Brunson).
Awareness: ${AWARENESS[awarenessLevel] || AWARENESS[3]}
${CORE_KNOWLEDGE}
Alle Texte Deutsch, conversion-fokussiert, spezifisch fürs Unternehmen, keine Floskeln.
WICHTIG: Antworte NUR mit reinem JSON. KEIN Markdown, KEIN \`\`\`json.`;

  const researchCtx = buildResearchContext(researchData);
  const userPrompt = `${prompt}${researchCtx ? "\n" + researchCtx : ""}

${PART_TASKS[sectionPart]}
JSON:
${STRUCTURES[sectionPart]}`;

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
        max_tokens: 8192,
        temperature: 0.3,
        system,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic error:", response.status, errText.slice(0, 300));
      return res.status(502).json({ error: `Claude API Fehler (${response.status})` });
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text || "";

    if (!text) {
      return res.status(502).json({ error: "Leere Antwort von Claude." });
    }

    const jsonStr = extractJson(text);
    if (!jsonStr) {
      console.error("extractJson failed:", text.slice(0, 500));
      return res.status(502).json({ error: "JSON-Extraktion fehlgeschlagen." });
    }

    const parsed = JSON.parse(jsonStr);
    return res.status(200).json({ ok: true, part: sectionPart, result: parsed });
  } catch (err) {
    console.error("Handler error:", err?.message);
    return res.status(500).json({ error: err?.message || "Serverfehler" });
  }
}
