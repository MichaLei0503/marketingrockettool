import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { MARKETING_KNOWLEDGE, buildResearchContext } from "./knowledge.js";

/**
 * Split analysis into focused sections.
 * Client calls this endpoint twice in parallel with different `part` values.
 * Each call generates fewer tokens and completes within 60s.
 */

const STRUCTURES = {
  analysis: `{
  "audit": { "score": 0, "diagnosis": "", "wins": [], "leaks": [], "fixes": [{"issue":"","fix":"","impact":"hoch|mittel|niedrig"}] },
  "offer": { "headline": "", "subheadline": "", "promise": "", "bullets": [], "guarantee": "", "bonuses": [{"name":"","value":"","description":""}], "cta": "", "urgency": "" },
  "pain": { "core_pain": "", "surface_pains": [], "hidden_pains": [], "desired_outcomes": [], "objections": [{"objection":"","reframe":""}], "emotional_triggers": [] },
  "spec": { "avatar": {"name":"","age":"","role":"","frustrations":[],"goals":[],"media_habits":[]}, "mechanism": "", "positioning": "", "tone": "", "channels": [{"channel":"","priority":"primär|sekundär|tertiär","reason":""}], "brand_voice": [] }
}`,
  creative: `{
  "hooks": [{"hook":"","angle":"","platform":"Meta|TikTok|YouTube|LinkedIn|Google|Universal","type":"pattern_interrupt|scroll_stopper|curiosity|controversy|storytelling|social_proof"}],
  "scripts": { "ads": [{"platform":"","format":"","hook":"","body":"","cta":""}], "emails": [{"purpose":"welcome|nurture|sales|abandoned_cart|reactivation","subject":"","preview":"","body":""}], "landing_page": {"hero_headline":"","hero_subheadline":"","sections":[{"type":"","content":""}]} },
  "funnel": { "strategy": "", "steps": [{"name":"","description":"","conversion_goal":"","content_type":""}], "kpis": [{"metric":"","target":"","why":""}] }
}`,
};

const PART_INSTRUCTIONS = {
  analysis: `Erstelle TEIL 1 der Analyse: Audit (Score 0-100 + Diagnose + Wins/Leaks/Fixes), Offer (Godfather-Angebot), Pain (Schmerzanalyse + Einwände), Spec (Avatar + Mechanismus + Kanäle).`,
  creative: `Erstelle TEIL 2 der Analyse: Hooks (mindestens 8, Thumb-Stop in 0.5s), Scripts (mind. 3 Ads + 3 Emails, copy-paste-fertig + Landing Page), Funnel (Strategie + Steps + KPIs).`,
};

function buildSystemPrompt(awarenessLevel) {
  const levels = {
    1: "UNAWARE: Problemaufdeckung, emotionale Trigger, Education-Content. Hooks neugierig ohne zu verkaufen. Funnel mit Awareness-Content.",
    2: "PROBLEM AWARE: Problemverstärkung, Agitation, Lösungsrichtung. Hooks validieren Schmerz. Funnel mit Education-Phase.",
    3: "SOLUTION AWARE: Differenzierung, einzigartiger Mechanismus, Proof. Hooks zeigen Überlegenheit. Funnel mit Social Proof.",
    4: "PRODUCT AWARE: Einwandbehandlung, Testimonials, Risiko-Umkehr. Hooks bauen Trust. Funnel mit Retargeting.",
    5: "MOST AWARE: Urgency, Scarcity, Deal-Sweetener. Hooks fordern zum Handeln auf. Funnel direkt zum Checkout.",
  };

  return `Du bist SCALE ENGINE, ein Elite Direct-Response Marketing Strategist (Hormozi, Suby, Brunson).
Awareness: ${levels[awarenessLevel] || levels[3]}

${MARKETING_KNOWLEDGE}

QUALITÄT: Spezifisch für das Unternehmen, keine Floskeln, copy-paste-fertig, Deutsch, conversion-fokussiert.
Antworte NUR mit validem JSON. Keine Erklärungen.`;
}

function extractJson(text) {
  const cleaned = text.trim()
    .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = cleaned.indexOf("{");
  if (start === -1) return null;
  let depth = 0, inString = false, escaped = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inString) {
      if (escaped) { escaped = false; continue; }
      if (ch === "\\") { escaped = true; continue; }
      if (ch === '"') { inString = false; continue; }
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === "{") depth++;
    if (ch === "}") { depth--; if (depth === 0) return cleaned.slice(start, i + 1); }
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, awarenessLevel, researchData, part } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: "prompt fehlt" });
  }

  const sectionPart = part === "creative" ? "creative" : "analysis";

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const modelId = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";

  if (!apiKey) {
    return res.status(500).json({
      error: "ANTHROPIC_API_KEY fehlt in den Environment Variables.",
    });
  }

  try {
    const anthropic = createAnthropic({ apiKey });

    const researchContext = buildResearchContext(researchData);
    const fullPrompt = `${prompt}
${researchContext ? researchContext : ""}

${PART_INSTRUCTIONS[sectionPart]}
JSON-Struktur:
${STRUCTURES[sectionPart]}`;

    const result = await generateText({
      model: anthropic(modelId),
      system: buildSystemPrompt(awarenessLevel || 3),
      prompt: fullPrompt,
      maxTokens: 4096,
      temperature: 0.3,
    });

    const jsonStr = extractJson(result.text);
    if (!jsonStr) {
      return res.status(502).json({
        error: `Kein gültiges JSON für Teil "${sectionPart}".`,
        preview: result.text?.slice(0, 300),
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return res.status(502).json({ error: "JSON konnte nicht geparst werden." });
    }

    return res.status(200).json({
      ok: true,
      part: sectionPart,
      result: parsed,
      meta: { model: modelId, finishReason: result.finishReason, usage: result.usage },
    });
  } catch (err) {
    const message = err?.message || "Unbekannter Serverfehler";
    const status = message.includes("API key") ? 401 : 500;
    return res.status(status).json({ error: message });
  }
}
