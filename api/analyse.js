import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { buildResearchContext } from "./knowledge.js";

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
Du kombinierst Strategien von Alex Hormozi, Sabri Suby, Russell Brunson.

${awarenessInstructions[awarenessLevel] || awarenessInstructions[3]}

KERN-FRAMEWORKS (kurzgefasst):
- GODFATHER-ANGEBOT: So gut dass Nein sagen dumm waere. Spezifisch+einzigartig+vorhersehbar. Starke Garantie (Bauchschmerz-Test). Risiko-Umkehr.
- TRIPLE DIAMOND: D1=Schmerz vertiefen, D2=Konkurrenz disqualifizieren (Limiting Beliefs brechen), D3=Einzigartiger Mechanismus als Loesung.
- HALO-STRATEGIE: 3% kaufbereit, 17% informieren sich, 20% problembewusst, 60% unbewusst. Blue Ocean der 97%.
- SPECTACLE STACKING: Produkt muss seine Funktion VISUELL erklaeren. Show dont tell.
- Ads die wie Content aussehen (Hormozi-Prinzip). UGC > polierte Werbung. Thumb-Stop in 0.5 Sek.
- 33%-Regel: Bis 33% des LTV fuer Akquise. Wer am meisten pro Kunde ausgeben kann gewinnt.
- CLAIM: "Ich helfe [Zielgruppe], [Ergebnis] in [Zeitraum], ohne [Schmerzpunkt], oder [Konsequenz]."

REGELN:
- Alle Texte auf Deutsch, conversion-fokussiert, spezifisch fuer das Unternehmen
- Hooks: mindestens 8, Aufmerksamkeit in 0.5 Sek
- Scripts: mindestens 3 Ads + 3 Emails, copy-paste-fertig
- Sei konkret – keine generischen Floskeln

AUSGABEFORMAT:
Antworte NUR mit validem JSON. Keine Erklaerungen. Exakt diese Struktur:
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

  const { prompt, awarenessLevel, researchData } = req.body || {};

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

    const researchContext = buildResearchContext(researchData);
    const fullPrompt = researchContext ? prompt + researchContext : prompt;

    const result = await generateText({
      model: anthropic(modelId),
      system: buildSystemPrompt(awarenessLevel || 3),
      prompt: fullPrompt,
      maxTokens: 5000,
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
