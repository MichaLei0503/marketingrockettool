import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

const JSON_STRUCTURE = `{
  "audit": { "score": 0, "diagnosis": "", "wins": [], "leaks": [], "fixes": [{"issue":"","fix":"","impact":"hoch|mittel|niedrig"}] },
  "offer": { "headline": "", "subheadline": "", "promise": "", "bullets": [], "guarantee": "", "bonuses": [{"name":"","value":"","description":""}], "cta": "", "urgency": "" },
  "pain": { "core_pain": "", "surface_pains": [], "hidden_pains": [], "desired_outcomes": [], "objections": [{"objection":"","reframe":""}], "emotional_triggers": [] },
  "hooks": [{"hook":"","angle":"","platform":"Meta|TikTok|YouTube|LinkedIn|Google|Universal","type":"pattern_interrupt|scroll_stopper|curiosity|controversy|storytelling|social_proof"}],
  "scripts": { "ads": [{"platform":"","format":"","hook":"","body":"","cta":""}], "emails": [{"purpose":"welcome|nurture|sales|abandoned_cart|reactivation","subject":"","preview":"","body":""}], "landing_page": {"hero_headline":"","hero_subheadline":"","sections":[{"type":"","content":""}]} },
  "funnel": { "strategy": "", "steps": [{"name":"","description":"","conversion_goal":"","content_type":""}], "kpis": [{"metric":"","target":"","why":""}] },
  "spec": { "avatar": {"name":"","age":"","role":"","frustrations":[],"goals":[],"media_habits":[]}, "mechanism": "", "positioning": "", "tone": "", "channels": [{"channel":"","priority":"primär|sekundär|tertiär","reason":""}], "brand_voice": [] }
}`;

function buildSystemPrompt(awarenessLevel) {
  const awarenessInstructions = {
    1: `Der Kunde ist UNAWARE – kennt weder sein Problem noch eine Lösung.
Fokus: Problemaufdeckung, emotionale Trigger, Education-Content.
Hooks müssen neugierig machen ohne direkt zu verkaufen.
Funnel beginnt mit Awareness-Content und Lead Magnets.
Ads sollen Probleme aufzeigen die der Kunde noch nicht benennen kann.`,
    2: `Der Kunde ist PROBLEM AWARE – spürt den Schmerz, kennt aber keine Lösung.
Fokus: Problemverstärkung, Agitation, dann Lösungsrichtung zeigen.
Hooks sollen den Schmerz validieren ("Kennst du das?").
Funnel braucht Education- und Nurturing-Phase vor dem Angebot.
E-Mails fokussieren auf Empathie und schrittweise Lösung.`,
    3: `Der Kunde ist SOLUTION AWARE – kennt Lösungswege, aber nicht dieses Produkt.
Fokus: Differenzierung, einzigartiger Mechanismus, Proof.
Hooks sollen die Überlegenheit der Lösung demonstrieren.
Funnel kann schneller zum Angebot führen, braucht aber starken Social Proof.
Vergleich mit Alternativen und klare USP-Kommunikation.`,
    4: `Der Kunde ist PRODUCT AWARE – kennt das Produkt, braucht noch Überzeugung.
Fokus: Einwandbehandlung, Testimonials, Risiko-Umkehr.
Hooks sollen Trust aufbauen und letzte Zweifel beseitigen.
Funnel braucht Retargeting, Testimonials und starke Garantien.
E-Mails fokussieren auf Case Studies und FAQ.`,
    5: `Der Kunde ist MOST AWARE – steht kurz vor dem Kauf.
Fokus: Urgency, Scarcity, Deal-Sweetener, direkter CTA.
Hooks sollen direkt zum Handeln auffordern.
Funnel braucht minimale Schritte – direkt zum Checkout.
Bonusse und zeitlich begrenzte Angebote sind entscheidend.`,
  };

  return `Du bist SCALE ENGINE, ein Elite Direct-Response Marketing Strategist.

Deine Aufgabe: Erstelle eine vollständige, conversion-optimierte Marketing-Analyse.

${awarenessInstructions[awarenessLevel] || awarenessInstructions[3]}

QUALITÄTSSTANDARDS:
- Jeder Hook muss sofort Aufmerksamkeit greifen – kein generischer Filler
- Scripts müssen copy-paste-fertig sein – echte Texte, keine Platzhalter
- Einwand-Reframes müssen psychologisch fundiert sein
- Funnel-Steps müssen logisch aufeinander aufbauen
- Alle Texte auf Deutsch, professionell, conversion-fokussiert
- Sei spezifisch für das Unternehmen – keine generischen Marketing-Floskeln
- Denke wie ein Top-Copywriter der €50.000+ für eine Kampagne berechnet
- Mindestens 8 Hooks, 3 Ad-Scripts, 3 E-Mail Scripts

AUSGABEFORMAT:
Antworte ausschließlich mit einem einzigen validen JSON-Objekt.
Keine Markdown-Codeblöcke. Keine Erklärungen davor oder danach.
Das JSON muss exakt dieser Struktur folgen:
${JSON_STRUCTURE}`;
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

  const { prompt, awarenessLevel } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: "prompt fehlt" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const modelId = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";

  if (!apiKey) {
    return res.status(500).json({
      error: "ANTHROPIC_API_KEY fehlt in den Environment Variables.",
    });
  }

  try {
    const anthropic = createAnthropic({ apiKey });

    const result = await generateText({
      model: anthropic(modelId),
      system: buildSystemPrompt(awarenessLevel || 3),
      prompt,
      maxTokens: 8000,
      temperature: 0.3,
    });

    const jsonStr = extractJson(result.text);
    if (!jsonStr) {
      return res.status(502).json({
        error: "Kein gültiges JSON in der Antwort gefunden.",
        preview: result.text?.slice(0, 500),
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return res.status(502).json({
        error: "JSON konnte nicht geparst werden.",
        preview: jsonStr.slice(0, 500),
      });
    }

    return res.status(200).json({
      ok: true,
      result: parsed,
      meta: {
        model: modelId,
        finishReason: result.finishReason,
        usage: result.usage,
      },
    });
  } catch (err) {
    const message = err?.message || "Unbekannter Serverfehler";
    const status = message.includes("API key") ? 401 : 500;
    return res.status(status).json({ error: message });
  }
}
