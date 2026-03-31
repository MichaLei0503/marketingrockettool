/**
 * Kuratierte Marketing-Wissensbasis
 * Bewährte Frameworks von Top-Marketern + aktuelle Best Practices
 */

export const MARKETING_KNOWLEDGE = `
--- MARKETING-WISSENSBASIS (bewährte Frameworks & aktuelle Trends) ---

## ALEX HORMOZI – Offer & Ad Frameworks
- Grand Slam Offer: Dream Outcome × Perceived Likelihood ÷ (Time Delay × Effort/Sacrifice)
- Je wertvoller das Angebot wirkt, desto weniger musst du "verkaufen"
- Ads müssen aussehen wie Content, NICHT wie Werbung – natives Format, kein poliertes Werbevideo
- Die Ad bringt den Klick, die Landingpage/Shop verkauft – trenne diese Aufgaben klar
- "Make people an offer so good they feel stupid saying no"
- Bonusse > Rabatte: Erhöhe den wahrgenommenen Wert statt den Preis zu senken
- Stack Bonusse so, dass der Gesamtwert das 10-fache des Preises übersteigt
- Urgency + Scarcity nur wenn echt – Fake-Timer zerstören Trust
- Guarantee Framework: Bedingungslos > Bedingt > Implizit > Keine Garantie
- 100% Geld-zurück entfernt das Risiko komplett vom Käufer

## RUSSELL BRUNSON – Funnel & Story Frameworks
- Hook → Story → Offer: Jeder Touchpoint folgt diesem Dreiklang
- Attractive Character: Baue eine Persona die die Zielgruppe bewundert
- Value Ladder: Gratis → Low-Ticket → Mid-Ticket → High-Ticket → Continuity
- Jede Stufe löst ein spezifischeres Problem und qualifiziert für die nächste
- Lead Magnet muss ein spezifisches Problem lösen (nicht "alles über X")
- Tripwire/Self-Liquidating Offer: Günstiges Erstangebot das die Ad-Kosten deckt
- OTO (One-Time Offer) direkt nach dem Kauf – höchste Conversion im gesamten Funnel
- Soap Opera Sequence: E-Mail Serie die wie eine Story aufgebaut ist (Cliffhanger)
- Seinfeld Method: Tägliche E-Mails die unterhalten und verkaufen

## DIRECT RESPONSE COPYWRITING – Psychologische Trigger
- PAS (Problem-Agitate-Solve): Problem benennen → Schmerz verstärken → Lösung präsentieren
- AIDA (Attention-Interest-Desire-Action): Klassisches Werbeformat
- 4U-Formel für Headlines: Useful, Urgent, Unique, Ultra-specific
- Future Pacing: Lass den Kunden sich vorstellen, wie sein Leben NACH dem Kauf aussieht
- Social Proof Hierarchie: Zahlen > Testimonials > Logos > Erwähnungen
- Loss Aversion: Menschen reagieren 2x stärker auf Verlust als auf Gewinn
- Specificity: "347 Kunden in 14 Tagen" > "viele Kunden schnell"
- Power Words: "sofort", "garantiert", "bewährt", "exklusiv", "kostenlos", "neu"
- Open Loops: Offene Fragen die den Leser weiterlesen lassen
- Pattern Interrupt: Erwartungshaltung brechen um Aufmerksamkeit zu greifen

## PLATTFORM-SPEZIFISCHE AD-REGELN

### Meta (Facebook/Instagram)
- Thumb-Stop in den ersten 0,5 Sekunden – Bewegung, Gesicht, Kontrast
- UGC (User Generated Content) outperformed polierte Werbung 3:1
- Carousel Ads für Storytelling: Jede Karte = ein Argument
- Retargeting: Website-Besucher innerhalb 7 Tagen = höchste Conversion
- Broad Targeting + starke Creative > enge Zielgruppe + schwache Creative
- Video Ads: Quadratisch (1:1) für Feed, Vertikal (9:16) für Stories/Reels
- Headline unter dem Bild ist am wichtigsten – dort steht die Value Prop

### TikTok
- 3-Sekunden-Hook oder Tod – die ersten 3 Sekunden entscheiden alles
- Vertikal (9:16), roh, authentisch – KEIN Studio-Look
- Text Overlays groß und lesbar
- Trending Sounds nutzen wenn passend
- "POV:", "Storytime:", "Was ich gelernt habe:" Formate funktionieren
- Native Content > Werbung – soll aussehen wie ein normaler TikTok
- Duett/Stitch Formate für Reaktions-Hooks

### YouTube
- Long-Form für Education + Trust: 8-15 Min ideal für Retargeting
- Shorts für Reichweite und Awareness
- Die ersten 30 Sekunden müssen einen Grund liefern weiterzuschauen
- Pattern: "In diesem Video zeige ich dir [spezifisches Ergebnis]"
- End Screens + Cards für Funnel-Navigation
- SEO-optimierte Titel + Thumbnails = organischer Traffic

### LinkedIn
- Authority-Content: Insights, Frameworks, Daten
- Carousel PDFs für Thought Leadership
- Persönliche Geschichten mit Business-Lesson performen am besten
- B2B: Case Studies > Product Features
- Keine Hashtag-Spam – max 3-5 relevante

### Google Ads
- Search Intent ist König: Keywords nach Buyer Intent sortieren
- Branded Keywords immer schützen
- Landing Page muss exakt zum Ad-Text passen (Message Match)
- Extensions nutzen: Sitelinks, Callouts, Structured Snippets
- Negative Keywords pflegen um Budget-Verschwendung zu vermeiden

## AKTUELLE TRENDS (2025-2026)
- Content-First Advertising: Die besten Ads sind keine Ads – sie sind hilfreicher Content
- Community > Audience: Aufbau einer engagierten Community schlägt reine Reichweite
- Short-Form Video dominiert: TikTok, Reels, Shorts sind primäre Discovery-Kanäle
- AI-Personalisierung: Dynamic Creative basierend auf User-Segmenten
- Creator/UGC Marketing: Authentische Gesichter > Markenlogos
- Email Renaissance: Newsletter Boom, persönlicher Tone, Storytelling
- Micro-Funnels: Kürzere Funnels mit weniger Steps, schneller zum CTA
- Mobile-First ist Pflicht: 70%+ Traffic ist mobil
- Value-First-Selling: Erst Mehrwert liefern, dann verkaufen (Lead Magnet, freier Content)
- Zero-Click Content: Wertvoller Content direkt auf der Plattform, ohne Link zu brauchen
`;

/**
 * Generiert Kontext aus Recherche-Daten für den Claude-Prompt
 */
export function buildResearchContext(researchData) {
  if (!researchData) return "";

  const parts = [];

  if (researchData.siteData) {
    const s = researchData.siteData;
    parts.push("--- WEBSITE-ANALYSE (automatisch gescannt) ---");
    if (s.title) parts.push(`Seitentitel: ${s.title}`);
    if (s.description) parts.push(`Meta-Beschreibung: ${s.description}`);
    if (s.headings?.length) parts.push(`Überschriften: ${s.headings.join(" | ")}`);
    if (s.content) parts.push(`Seiteninhalt (Auszug):\n${s.content}`);
    parts.push("Nutze diese echten Website-Daten um Stärken und Schwächen im aktuellen Marketing zu identifizieren.");
  }

  if (researchData.searchResults?.length) {
    parts.push("\n--- MARKT-RECHERCHE (aktuelle Suchergebnisse) ---");
    for (const r of researchData.searchResults) {
      parts.push(`• ${r.title}: ${r.snippet}`);
    }
    parts.push("Nutze diese aktuellen Marktdaten um Trends und Wettbewerber-Strategien einzubeziehen.");
  }

  if (researchData.adInsights?.length) {
    parts.push("\n--- AD-LIBRARY INSIGHTS (langfristig erfolgreiche Ads) ---");
    for (const a of researchData.adInsights) {
      parts.push(`• [${a.platform}] ${a.advertiser}: ${a.text?.slice(0, 200)}`);
    }
    parts.push("Analysiere die Muster dieser nachweislich erfolgreichen Ads und wende sie auf dieses Unternehmen an.");
  }

  return parts.length ? "\n\n" + parts.join("\n") : "";
}
