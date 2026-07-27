import { buildResearchContext } from "./knowledge.js";
import {
  COMPRESSED_CORE,
  META_CAMPAIGN_KNOWLEDGE,
  CREATIVES_KNOWLEDGE,
  COPY_KNOWLEDGE,
  OFFER_KNOWLEDGE,
  FUNNEL_KNOWLEDGE,
  PSYCHOLOGY_KNOWLEDGE,
  KPI_KNOWLEDGE,
} from "./ml-knowledge.js";

/**
 * Split analysis into 4 parallel parts for fastest execution + max quality.
 * Each part loads only the relevant knowledge module to keep prompts lean.
 *
 * part1: Summary + Audit + Pain (strategic overview)
 * part2: Offer + Hooks + Spec (creative foundation)
 * part3: Scripts + Funnel (execution assets)
 * part4: Meta Campaign Structure + Creatives & Angles (NEW — full IRON SOP)
 */

const STRUCTURES = {
  part1: `{"summary":{"executive_summary":"","key_insight":"","biggest_opportunity":"","immediate_actions":[],"expected_impact":"","target_audience_insight":""},"audit":{"score":0,"diagnosis":"","wins":[],"leaks":[],"fixes":[{"issue":"","fix":"","impact":"hoch|mittel|niedrig"}]},"pain":{"core_pain":"","surface_pains":[],"hidden_pains":[],"desired_outcomes":[],"objections":[{"objection":"","reframe":""}],"emotional_triggers":[]}}`,
  part2: `{"offer":{"headline":"","subheadline":"","promise":"","bullets":[],"guarantee":"","bonuses":[{"name":"","value":"","description":""}],"cta":"","urgency":"","bundle_math":{"total_value":"","offer_price":"","break_even_roas":""},"unique_mechanism":{"ump":"","ums":""}},"hooks":[{"hook":"","angle":"","platform":"Meta|TikTok|YouTube|LinkedIn|Google|Universal","type":"pattern_interrupt|scroll_stopper|curiosity|controversy|storytelling|social_proof"}],"spec":{"avatar":{"name":"","age":"","role":"","frustrations":[],"goals":[],"media_habits":[]},"mechanism":"","positioning":"","tone":"","channels":[{"channel":"","priority":"primär|sekundär|tertiär","reason":""}],"brand_voice":[]}}`,
  part3: `{"scripts":{"ads":[{"platform":"","format":"","hook":"","body":"","cta":""}],"emails":[{"purpose":"welcome|nurture|sales|abandoned_cart|reactivation","subject":"","preview":"","body":""}],"advertorial":{"title":"","diamond1_pain":"","diamond2_limiting_beliefs":"","diamond3_gain_beliefs":"","cta":""},"landing_page":{"hero_headline":"","hero_subheadline":"","sections":[{"type":"","content":""}]}},"funnel":{"strategy":"","steps":[{"name":"","description":"","conversion_goal":"","content_type":""}],"kpis":[{"metric":"","target":"","why":""}],"post_purchase":{"upsell_1":"","downsell_1":"","cross_sell":"","expected_aov_lift":""}}}`,
  part4: `{"meta_campaign":{"architecture":"","testing_campaign":{"name":"","budget_formula":"","budget_example":"","creative_batches":"","optimization":"","exclusions":"","attribution":""},"scaling_campaign":{"name":"","budget":"","strategy":"","when_to_promote":""},"advantage_plus":{"when_ready":"","creative_mix":"","budget_share":""},"portfolio_split":{"advantage_plus":"","retargeting":"","testing":""},"scaling_rules":{"rule_20_percent":"","72h_rule":"","fatigue_signals":[]},"budget_recommendations":{"start_daily":"","month_1_target":"","break_even_roas":""},"naming_convention":{"campaign":"","adset":"","ad":""}},"creatives":{"angles":[{"name":"","awareness_level":"","big_idea":"","hook":"","body":"","proof":"","cta":""}],"ad_concepts":[{"type":"founder_ad|ugc|product_aware|sale_image|advertorial_lead","format":"9:16 video|1:1 image|carousel","script":"","visual_direction":"","ideal_creator":""}],"ugc_briefings":[{"scenario":"","opening_line":"","key_points":[],"cta":"","duration":""}],"iteration_plan":{"audience_variations":[],"angle_variations":[],"format_variations":[]}}}`,
};

const PART_TASKS = {
  part1: "Erstelle: Summary (Executive Summary 2-3 Sätze, Key Insight, größte Chance, 3-5 sofortige Handlungsschritte, erwarteter Impact, Zielgruppen-Insight basierend auf Forum-/Community-Daten falls vorhanden), Audit (Score 0-100, Diagnose, je 3+ Wins/Leaks, 3+ Fixes), Pain (Kernschmerz, Oberflächen-/versteckte Schmerzen, Einwände mit Reframes). Wenn Forum-Daten vorhanden: nutze die EXAKTE Sprache der Zielgruppe.",
  part2: "Erstelle: Offer (CFO 3.0 - Godfather mit Headline, Bundle-Math statt Discount, Garantie mit Bauchschmerz-Test, 3+ Bonuses, Break-Even-ROAS-Berechnung, UMP + UMS - Unique Mechanism of Problem und Solution), Hooks (8 Stück nach den 5 Hook-Types: Shock/Secret/Contrast/Statistic/Direct Question, Thumb-Stop 0.5s), Spec (Avatar mit Namen/Alter/Rolle, Mechanismus, Positionierung, Tone, Kanäle mit Priorität).",
  part3: "Erstelle: Scripts (3 Ad-Scripts copy-paste-fertig, 3 E-Mail-Scripts, ADVERTORIAL nach Triple Diamond: Diamond1=Pain-Aktivierung, Diamond2=Limiting Beliefs zerstören + Root Cause, Diamond3=Gain Beliefs + Warum wir), Landing Page mit Hero + Sektionen), Funnel (Strategie, 4+ Steps, 3+ KPIs, Post-Purchase-Sequenz: More-of-Same → Downsell → Cross-Sell → AOV-Lift-Estimation).",
  part4: "Erstelle: META CAMPAIGN STRUCTURE (kompletter IRON SOP: Testing-Campaign mit AOV×#Ads÷3 Budget-Formel, konkretes Zahlenbeispiel, Scaling-CBO, Advantage+ Ready-Kriterien, Portfolio-Split 70-80%/15-20%/5-10%, 20%-Rule, 72h-Rule, Fatigue-Signale, Break-Even-ROAS-Ziel, Naming-Convention). CREATIVES & ANGLES (5-7 Winning Angles jeweils mit Big Idea/Hook/Body/Proof/CTA + Awareness Level, 4-6 Ad-Konzepte in verschiedenen Types (founder_ad/ugc/product_aware/sale_image/advertorial_lead), 3 UGC-Briefings ready-to-shoot, Iterations-Plan mit Audience/Angle/Format-Varianten für Andromeda).",
};

const AWARENESS = {
  1: "UNAWARE – kennt Problem nicht. Fokus: Problemaufdeckung, Long Form Education.",
  2: "PROBLEM AWARE – spürt Schmerz. Fokus: Agitation, Root Cause, Long Form Advertorial.",
  3: "SOLUTION AWARE – kennt Lösungen. Fokus: Differenzierung via Unique Mechanism.",
  4: "PRODUCT AWARE – kennt Produkt. Fokus: Einwandbehandlung, Trust, Short Offer Page.",
  5: "MOST AWARE – kaufbereit. Fokus: Urgency, Scarcity, CFO, direkter CTA.",
};

// Per-part knowledge injection — only load relevant sections to keep prompts lean
const PART_KNOWLEDGE = {
  part1: `${PSYCHOLOGY_KNOWLEDGE}\n\n${KPI_KNOWLEDGE}`,
  part2: `${OFFER_KNOWLEDGE}\n\n${COPY_KNOWLEDGE}`,
  part3: `${FUNNEL_KNOWLEDGE}\n\n${COPY_KNOWLEDGE}`,
  part4: `${META_CAMPAIGN_KNOWLEDGE}\n\n${CREATIVES_KNOWLEDGE}`,
};

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
  const start = text.indexOf("{");
  if (start === -1) return null;

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

  let candidate = end !== -1 ? text.slice(start, end + 1) : text.slice(start);
  candidate = candidate.replace(/\s*```\s*$/, "");

  try { return JSON.stringify(JSON.parse(candidate)); } catch {}

  try {
    const sanitized = sanitizeJsonStrings(candidate);
    JSON.parse(sanitized);
    return sanitized;
  } catch {}

  let partial = sanitizeJsonStrings(candidate);

  let inStr = false, esc = false;
  for (let i = 0; i < partial.length; i++) {
    const c = partial[i];
    if (inStr) { if (esc) { esc = false; } else if (c === "\\") { esc = true; } else if (c === '"') { inStr = false; } continue; }
    if (c === '"') inStr = true;
  }
  if (inStr) partial += '"';

  partial = partial.replace(/,\s*"[^"]*"?\s*:?\s*"?[^"]*$/, "");
  partial = partial.replace(/,\s*$/, "");

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

  const validParts = ["part1", "part2", "part3", "part4"];
  const sectionPart = validParts.includes(part) ? part : "part1";
  const modelId = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";

  const system = `Du bist SCALE ENGINE, ein Elite Direct-Response Marketing Strategist im IRON-Framework (Sabri Suby, Alex Hormozi, Direct-Response 2026).
Awareness: ${AWARENESS[awarenessLevel] || AWARENESS[3]}

${COMPRESSED_CORE}

${PART_KNOWLEDGE[sectionPart]}

REGELN:
- Alle Texte Deutsch, conversion-fokussiert, spezifisch fürs Unternehmen, keine Floskeln.
- Nutze VoC-Sprache aus Foren/Kommentaren (falls vorhanden) VERBATIM.
- Konkrete Zahlen, Namen, Zeiträume statt vager Aussagen.
- Antworte NUR mit validem JSON. Kein Markdown, keine Code-Blöcke. Nutze \\n für Zeilenumbrüche in Strings.`;

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

    if (!text) return res.status(502).json({ error: "Leere Antwort von Claude." });

    const jsonStr = extractJson(text);
    if (!jsonStr) {
      console.error("extractJson failed. First 300 chars:", text.slice(0, 300));
      console.error("Last 200 chars:", text.slice(-200));
      return res.status(502).json({ error: "JSON-Extraktion fehlgeschlagen." });
    }

    const parsed = JSON.parse(jsonStr);
    return res.status(200).json({ ok: true, part: sectionPart, result: parsed });
  } catch (err) {
    console.error("Handler error:", err?.message);
    return res.status(500).json({ error: err?.message || "Serverfehler" });
  }
}
