import { buildResearchContext } from "./knowledge.js";

/**
 * Split analysis into 3 parallel parts for fastest execution.
 * Each part generates fewer tokens → completes within 45s.
 */

const STRUCTURES = {
  part1: `{"summary":{"executive_summary":"","key_insight":"","biggest_opportunity":"","immediate_actions":[],"expected_impact":"","target_audience_insight":""},"audit":{"score":0,"diagnosis":"","wins":[],"leaks":[],"fixes":[{"issue":"","fix":"","impact":"hoch|mittel|niedrig"}]},"pain":{"core_pain":"","surface_pains":[],"hidden_pains":[],"desired_outcomes":[],"objections":[{"objection":"","reframe":""}],"emotional_triggers":[]}}`,
  part2: `{"offer":{"headline":"","subheadline":"","promise":"","bullets":[],"guarantee":"","bonuses":[{"name":"","value":"","description":""}],"cta":"","urgency":""},"hooks":[{"hook":"","angle":"","platform":"Meta|TikTok|YouTube|LinkedIn|Google|Universal","type":"pattern_interrupt|scroll_stopper|curiosity|controversy|storytelling|social_proof"}],"spec":{"avatar":{"name":"","age":"","role":"","frustrations":[],"goals":[],"media_habits":[]},"mechanism":"","positioning":"","tone":"","channels":[{"channel":"","priority":"primär|sekundär|tertiär","reason":""}],"brand_voice":[]}}`,
  part3: `{"scripts":{"ads":[{"platform":"","format":"","hook":"","body":"","cta":""}],"emails":[{"purpose":"welcome|nurture|sales|abandoned_cart|reactivation","subject":"","preview":"","body":""}],"landing_page":{"hero_headline":"","hero_subheadline":"","sections":[{"type":"","content":""}]}},"funnel":{"strategy":"","steps":[{"name":"","description":"","conversion_goal":"","content_type":""}],"kpis":[{"metric":"","target":"","why":""}]}}`,
};

const PART_TASKS = {
  part1: "Erstelle: Summary (Executive Summary 2-3 Sätze, Key Insight, größte Chance, 3-5 sofortige Handlungsschritte, erwarteter Impact, Zielgruppen-Insight basierend auf Forum-/Community-Daten falls vorhanden), Audit (Score 0-100, Diagnose, je 3+ Wins/Leaks, 3+ Fixes), Pain (Kernschmerz, Oberflächen-/versteckte Schmerzen, Einwände mit Reframes). Wenn Forum-Daten vorhanden sind, nutze die EXAKTE Sprache der Zielgruppe aus den Foren.",
  part2: "Erstelle: Offer (Godfather-Angebot mit Headline, Garantie, Bonuses, CTA), Hooks (8 Stück, Thumb-Stop 0.5s, verschiedene Plattformen und Typen), Spec (detaillierter Avatar mit Name/Alter/Rolle, Mechanismus, Positionierung, Tone, Kanäle mit Priorität).",
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

/**
 * Escape literal control characters inside JSON string values.
 * Claude often puts real newlines/tabs in strings instead of \n \t.
 */
function sanitizeJsonStrings(text) {
  let result = "";
  let inString = false;
  let escaped = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) { escaped = false; result += ch; continue; }
      if (ch === "\\") { escaped = true; result += ch; continue; }
      if (ch === '"') { inString = false; result += ch; continue; }
      // Escape literal control characters inside strings
      if (ch === "\n") { result += "\\n"; continue; }
      if (ch === "\r") { result += "\\r"; continue; }
      if (ch === "\t") { result += "\\t"; continue; }
      result += ch;
    } else {
      if (ch === '"') inString = true;
      result += ch;
    }
  }
  return result;
}

function extractJson(text) {
  // Find the first '{' in the raw text
  const start = text.indexOf("{");
  if (start === -1) return null;

  // Track brace depth to find matching closing brace
  let depth = 0, inString = false, escaped = false, end = -1;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
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
      if (depth === 0) { end = i; break; }
    }
  }

  // Extract the candidate (matched braces or everything from start)
  let candidate = end !== -1 ? text.slice(start, end + 1) : text.slice(start);

  // Strip trailing markdown fence if present (for truncated case)
  candidate = candidate.replace(/\s*```\s*$/, "");

  // Try 1: Direct parse
  try { return JSON.stringify(JSON.parse(candidate)); } catch {}

  // Try 2: Sanitize control characters in strings (Claude puts literal newlines)
  try {
    const sanitized = sanitizeJsonStrings(candidate);
    JSON.parse(sanitized);
    return sanitized;
  } catch {}

  // Try 3: Repair truncated JSON
  let partial = sanitizeJsonStrings(candidate);

  // If still inside an unclosed string, close it
  let inStr = false, esc = false;
  for (let i = 0; i < partial.length; i++) {
    const c = partial[i];
    if (inStr) { if (esc) { esc = false; } else if (c === "\\") { esc = true; } else if (c === '"') { inStr = false; } continue; }
    if (c === '"') inStr = true;
  }
  if (inStr) partial += '"';

  // Remove trailing incomplete key-value pairs or commas
  partial = partial.replace(/,\s*"[^"]*"?\s*:?\s*"?[^"]*$/, "");
  partial = partial.replace(/,\s*$/, "");

  // Count and close open brackets/braces
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

  try { JSON.parse(partial); return partial; } catch (e) {
    console.error("JSON repair failed:", e.message, "partial (last 200):", partial.slice(-200));
    return null;
  }
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
WICHTIG: Antworte NUR mit validem JSON. Kein Markdown, keine Code-Blöcke. Nutze \\n für Zeilenumbrüche in Strings.`;

  const researchCtx = buildResearchContext(researchData);
  const userPrompt = `${prompt}${researchCtx ? "\n" + researchCtx : ""}

${PART_TASKS[sectionPart]}
Antworte mit reinem JSON (kein \`\`\`json, kein Markdown). Nutze \\n statt echte Zeilenumbrüche in String-Werten.
JSON-Struktur:
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
      console.error("extractJson failed. First 300 chars:", text.slice(0, 300));
      console.error("Last 200 chars:", text.slice(-200));
      console.error("Text length:", text.length, "First char codes:", [...text.slice(0, 20)].map(c => c.charCodeAt(0)));
      return res.status(502).json({ error: "JSON-Extraktion fehlgeschlagen." });
    }

    const parsed = JSON.parse(jsonStr);
    return res.status(200).json({ ok: true, part: sectionPart, result: parsed });
  } catch (err) {
    console.error("Handler error:", err?.message);
    return res.status(500).json({ error: err?.message || "Serverfehler" });
  }
}
