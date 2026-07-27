/**
 * ML-Ultimate-2Brain Knowledge Base — extracted from Michael's Obsidian Vault
 * Marketing framework: IRON / 2026
 *
 * Split into modules so each analysis part only loads relevant knowledge
 * to keep the system prompt lean and prevent timeouts.
 */

// ─────────────────────────────────────────────────────────────
// CORE: 7 Meta-Laws — always included in system prompt
// ─────────────────────────────────────────────────────────────
export const CORE_LAWS = `7 META-LAWS (Fundament):
1. Besseres Marketing schlägt besseres Produkt. Channel/Message-Market-Fit VOR Skalierung.
2. Menschen kaufen die bessere Version ihrer selbst — nicht dein Produkt. Identity Filter.
3. Enter the conversation in the customer's head mit exakten Worten (VoC).
4. Menschen kaufen Erklärungen, nicht Ergebnisse. Ohne Unique Mechanism bist du austauschbar.
5. One Asset = One Job. Zwei Jobs → splitten.
6. Spezifisch schlägt vage. IMMER. Zahlen, Namen, Studien, Zeiträume.
7. Speed + Iteration schlägt Perfektion.`;

// ─────────────────────────────────────────────────────────────
// META CAMPAIGN — for the meta_campaign analysis part
// ─────────────────────────────────────────────────────────────
export const META_CAMPAIGN_KNOWLEDGE = `META CAMPAIGN STRUCTURE (IRON SOP 2026):

ARCHITECTURE (99% der Fälle):
1) TESTING (ABO, cold) → 2) SCALING CBO → 3) ASC+ (Advantage+) → 4) Cost-/Bid-Cap
- Testing (ABO): Creative-Tests, Creator-Validierung. Winners → Scaling.
- Scaling CBO: Broad, meist 1 Adset, nur validierte Winners. Min. 100 €/Tag. Nur auf Ad-Ebene arbeiten.
- ASC+: Erst nach 10+ Winning Creatives mit gesundem Asset-Mix (TOF-Video + BOF-Image).
- Cost Cap/Bid Cap: Erst bei mehreren tausend Euro Tagesbudget. Bids = Ziel-CPA +15% / +25% / +50%.

PORTFOLIO-SPLIT:
- Advantage+ Sales: 70-80% (Broad, 15-30 Creatives)
- Retargeting: 15-20% (Visitors 7-30d + Cart Abandoners)
- Testing: 5-10% (Neue Konzepte, Winners graduieren zu ASC)
Existing-Customer-Budget-Cap setzen (sonst gravitiert Advantage+ zu Bestandskunden).

TARGETING:
- NUR Broad (Alter/Geschlecht/Location). Interests/Lookalikes nur als Suggestion.
- Granulares Interest-Targeting ist tot — Meta lernt aus Behavior.
- Kein Retargeting-Setup nötig — Meta serviert automatisch.
- 9:16 Vertical Video = Priority Format.

TESTING-SETUP (ABO):
- 1 Testing-Adset = 1 Creative Batch (3-5 Creatives).
- Daily Budget = AOV × #Ads ÷ 3.
- Optimization: Purchase (kein Pixel-Seasoning).
- Placements: Advantage+ (Safe Zones respektieren).
- Exclusions: 30-day buyers.
- Dynamic Creative Test (3-2-2): 3 Creatives × 2 Copies × 2 Headlines.
- Cadence: 1-2 Creative Batches/Woche.

OPTIMIZATION RULES (Ad-Ebene!):
Rule 1: Nach Launch 72h nicht anfassen. Log out.
Nach 3 Tagen:
- AOV verbraucht + sehr unprofitabel → Ad OFF
- Sehr profitabel → Budget +50%
- Break-Even/leicht profitabel → Warten, mehr Daten
- AOV noch nicht verbraucht → Zu früh
Nur Ads ausschalten, nicht Adsets. Nach 6 Tagen validiert → Scaling CBO.

VERTICAL SCALING (20% Rule):
Täglich/alle 2 Tage: Basis = letzte 3 Tage.
- Profitabel → +20%
- Break-Even → nichts
- Unprofitabel → -20%
Learning Phase ignorieren. Winners aggressiv skalieren.
Compound: 100 €/Tag + 20% = ~20k in 30 Tagen.

ATTRIBUTION:
- 7d-Click/1d-View: Ads am unteren Funnel — max Window.
- 1d-Click: Low AOV, Impulskäufe.
- Bis 50% Kostenunterschied → 2 Testing-Adsets gegeneinander.

LEARNING PHASE:
- ~50 Optimization Events/Woche nötig.
- CPAs 20-50% höher während Learning.
- Jede Änderung resettet Learning.
- Budget-Fragmentation = Fehler #1 2026. Min. 100 €/Tag pro Campaign.

FATIGUE-SIGNALE:
- CPMr steigt anhaltend → Creative Refresh
- Frequency > 3-4 auf Prospecting
- Fallende CTR, steigende CPA

NAMING CONVENTION:
- Campaign: ABO | Cold | Testing | Purchase
- Adset: Datum | Broad/Audience | Size | Creative Batch #
- Ad: Product | Creative-Type | Batch # | Creator-Code | Headline-ID`;

// ─────────────────────────────────────────────────────────────
// CREATIVES & ANGLES — for creatives_angles analysis part
// ─────────────────────────────────────────────────────────────
export const CREATIVES_KNOWLEDGE = `CREATIVES & ANGLES (Andromeda-Zeitalter):

ANDROMEDA REALITY:
- Meta bewertet 1000e Creative-Permutationen parallel via Andromeda Ranking.
- Creative Diversity hat Audience-Targeting als primären Hebel abgelöst.
- ~80% Creative-Ops, 20% Media Buying.
- Andromeda gruppiert Ads nach TYPE (UGC/High Production/Founder Ad).
- 3 Hooks auf gleicher Founder-Ad = "die Founder-Ad" für Meta.
- ITERIERE KONZEPTE, nicht Hooks. Hook-Swap ist Andromeda-Killer.

3 ITERATION-STEPS (nach jedem Winner):
1. AUDIENCE — gleiche Idee für anderes Segment (Mann → Frau → Kind → Senior).
2. ANGLE — gleiches Argument komplett anders erklärt ("Taboo": das eine Wort darfst du nicht nutzen).
3. FORMAT — UGC / Image / Founder / AI Video.
→ Andromeda belohnt Diversity mit besserem ROAS.

DIVERSITY ≠ VOLUME:
- 50 Mini-Varianten des gleichen Fotos = redundant.
- 5 wirklich verschiedene Approaches (UGC-Clip, Demo, Testimonial, Text-Explainer, Lifestyle) geben dem System Raum.

CREATIVE TYPES (für Launches):
- Founder Ads (Mass Desire)
- UGC ("meine Erfahrung")
- Product-Aware ("everyone does X, we do Y")
- Sale-Image Ads

AD TYPES FÜR ADVERTORIALS:
- Simple Image Ads mit einem Hook (wenn Advertorial Pain & Belief abdeckt):
  * Attractive Headline die richtige Audience filtert
  * WTF-Image (Pattern-Interrupt)
  * Strong Curiosity (wie YouTube Thumbnails)
  * Fascinations eingebettet
  * Bsp: "Mehr Falten? 84% der deutschen Frauen — 3 fatale Skincare-Fehler..."
- Lead Ads (Curiosity only, tiefere Awareness):
  * "Wusstest du 94% der Schlafprobleme = Omega-3-Mangel? → Artikel: Link."
- Video Ads: Product-Pitching + Advertorial das weiter pitcht.

HOOK TYPES (Scroll-Stopper):
- Shock
- Secret ("Was X versteckt")
- Contrast ("Ich hab alles falsch gemacht")
- Statistic
- Direct Question
- Direct Audience Address: "An alle [Persona] die [Goal] wollen ohne [Pain]..."

KPI BENCHMARKS (Creative):
- Hook Rate (3s Views/Impressions) > 40% — Hook/Visual stark
- Hold Rate (ThruPlays/Impressions) > 10% — Lead/Painpoints treffen
- CTR (Link) > 2.5%
- CVR > 2%
- AOV > 50 €

COMPLIANCE (Meta):
- Seit März 2026: KI-generierte/modifizierte Inhalte in Ads müssen offengelegt werden.
- Fehlende Deklaration = häufigster Ablehnungsgrund.`;

// ─────────────────────────────────────────────────────────────
// COPY & COPYWRITING — for scripts/hooks analysis parts
// ─────────────────────────────────────────────────────────────
export const COPY_KNOWLEDGE = `COPY & COPYWRITING FRAMEWORKS:

COPY GROUND LAWS:
- Konversationell schreiben — wie an einen Freund.
- Kurze Sätze. Ein Gedanke pro Absatz.
- Benefits > Features. "Du" > "Wir". Aktiv > Passiv.
- Slippery Slide (Sugarman): Jeder Satz hat einen Job — dass der nächste Satz gelesen wird.
- Kein Marketing-Sprech ("revolutionär", "innovativ", "premium").
- Zeig dass du das Problem verstehst; lass den Kunden schlussfolgern dass dein Produkt die Lösung ist.

FRAMEWORKS (wann welches):
- PAS (Problem-Agitate-Solution): Cold Traffic, Problem-Aware. Default für aggressive DR Advertorials.
- AIDA (Attention-Interest-Desire-Action): Universell.
- BAB (Before-After-Bridge): Transformation sichtbar machen.
- 4Ps (Promise-Picture-Proof-Push): Outcome-driven.
Framework-Wahl folgt Awareness-Level: cold → PAS (Long Form); warm → kürzer, offer-focused.

HEADLINE-FORMELN:
How-to ohne Pain / Frage ("Machst du diesen Fehler?") / Zahl / Warnung / Secret / Story / Kontrovers / Spezifisch.

VOICE OF CUSTOMER (höchster ROI-Hebel):
3 Fragen an Kunden/Leads, Wording VERBATIM erfassen:
1. Was nervt dich AKTUELL am meisten?
2. Was ist AKTUELL dein größtes Problem zwischen dir und deinem Ziel?
3. Was ist dein größtes Ziel — und warum willst du es WIRKLICH?
→ Deckt Current State, Barrier, Dream State ab.

SALES ARGUMENT STRUKTUR (Long Form/VSL):
Hook → Lead (Brücke, persönlich) → Problem-Deepening (twist the knife) → UMP → Alternative-Bashing → Proof of Mechanism → UMS → Product Intro → Benefits (Outcome-Bullets) → Money Close → Future Pacing → Social Proof Cluster → Offer Stack (CFO 3.0) → CTA + Scarcity`;

// ─────────────────────────────────────────────────────────────
// OFFER & CFO — for offer analysis part
// ─────────────────────────────────────────────────────────────
export const OFFER_KNOWLEDGE = `COLD FRIENDLY OFFER (CFO 3.0):

WARUM KRITISCH:
Kein CFO = Grund #1 für keinen Paid-Ads Erfolg.

CFO 3.0 STRUKTUR:
[Hauptprodukt]           €X (UVP)
+ Bonus Product 1        €Y
+ Bonus Product 2        €Z
+ Digital Bonus/Guide    €A
+ Free Shipping          €B
──────────────────────────────
Gesamtwert €(X+Y+Z+A+B) → Heute nur €Price (60-70% Ersparnis)
+ 30/60-Tage Geld-zurück + Limited Stock/Timer

4 BUILDING BLOCKS:
A. Perceived Value: All-in-One für Problem/Desire, Unit Economics, Preis-Vorteil.
B. Short Sales Cycle: Scarcity + Urgency + Garantie.
C. Market: Desire Uptrend, Narrative Uptrend, Cycle Timing.
D. Unfair Advantages: Ungelöstes Problem, neue Lösung, bessere Business-Struktur (CLTV), neuer Markt, untapped Traffic Source.

BUNDLE-MATH (IRON: Bundle statt Discount):
- Discount-Method: 25% off 149€ = 111.75€ / 37.50€ Marge / Break-Even ROAS 2.03×.
- IRON Bundle: "Kaufe 149€ Produkt + bekomme 89€ Produkt gratis" = 149€ / 89€ Marge / Break-Even ROAS 1.92×.
- Bundle mit: komplementären Produkten / "mehr vom gleichen" / Info-Produkten.

RISK REVERSAL:
- Keine-Fragen Garantie (100 Tage)
- Lange Garantie (3 Jahre)
- Try before pay
- Objections kreativ in Garantie verwandeln.

ANTI-PATTERNS:
Free Shipping als USP, generisch "Bestseller", pure Feature-Liste, pure Discount als Scaling-Lever.

UNIQUE MECHANISM (UMP + UMS):
Erklärt in logischer Kette: Cause → Theoretical Solution → Product.
- UMP (Problem): "Das wahre Problem ist nicht X, sondern Y." (tieferer Trigger)
- UMS (Solution): Teil 1 theoretisch ("Wenn wir Y könnten..."), Teil 2 Produkt-Mechanismus.
Liefert: Differenzierung + Credibility + Attention-Hook + Preis-Raum.`;

// ─────────────────────────────────────────────────────────────
// FUNNEL & PSYCHOLOGY — for funnel/pain analysis parts
// ─────────────────────────────────────────────────────────────
export const FUNNEL_KNOWLEDGE = `FUNNEL & LANDING PAGES:

2026 STANDARD FUNNEL:
Ad → Advertorial/Pre-Sale Page → Offer Page → Checkout (mit Upsells) → Post-Purchase Upsells/Downsells

3-TIER PAGE HIERARCHY:
- Long Form Sales Page: Cold Traffic (Pre-Sale + Offer kombiniert). CVR 3-6%+
- Listicle Pre-Sale: Mid-Funnel, High CPM, Pre-Qualification.
- Short Form Offer Page: Warm/Hot. CVR 5-10%
- Klassische PDP: Nur Anfangsphase / etablierte Brand. CVR 1-2%

Red Flags: Cold Traffic → normale PDP / Cold Audience → Short Form / Mismatch Ad-Promise vs Landing-Headline.

ADVERTORIAL (Triple Diamond):
- Diamond 1 - Pain: Aktiviere schmerzhafte Fragen.
- Diamond 2 - Limiting Beliefs: "Nichts anderes im Markt funktioniert."
  Physio → hilft nicht. Painkiller → nicht langfristig. OP → zu schmerzhaft.
  ABER lösbar wenn wir die Root Cause adressieren = Root Solution = Mechanism.
- Diamond 3 - Gain Beliefs: "Wir sind die einzigen oder besten."

DIAMOND FILES:
Ein Funnel = Kette aus Pains + Beliefs die zu "Ich will kaufen" führen.
- Double Diamond (LOW Market Sophistication): PAIN → GAIN BELIEFS.
- Triple Diamond (HIGH): PAIN → LIMITING BELIEFS geändert → GAIN BELIEFS.
Advertorial/VSL startet wo die Ad endet in der Diamond-Kette.

POST-PURCHASE / UPSELL FUNNEL:
Landing → Checkout
→ Upsell-TSL #1 (More of the Same, Refills)
→ Downsell (10-20% mehr Rabatt)
→ Cross-Sell #2 (Faster Results / Second Problem)
→ Downsell
→ Thank You
Upsell TSL bringt ~20% CVR. Reine Marge, keine neuen Ad-Costs.
Post-purchase Upsell kann ~100 € Order Value drauflegen.

AOV PUSH:
Bundling + gratis Produkte bei Cart-Threshold + Cart/Checkout/Post-Purchase-Upsells.

SHOPIFY PRODUCT-PAGE STRUKTUR (Hero):
Offer sofort klar + Sales Reason + Urgency + Scarcity + Garantie + Titel + Preis + USPs + Social Proof.
Dann: Problem-Reminder → USPs/Mechanism → Application → Us-vs-Them → Testimonials.`;

export const PSYCHOLOGY_KNOWLEDGE = `PSYCHOLOGIE DES KAUFENS:

AWARENESS-LEVEL (Schwartz) — wichtigster Diagnostik:
Unaware → Problem-Aware → Solution-Aware → Product-Aware → Most Aware
- Cold Traffic (Unaware/Problem-Aware): Braucht Education → Long Form.
- Warm Traffic (Product-/Most-Aware): Braucht nur Urgency + Offer → Short Form.
- Jede Message failt wenn sie falsches Awareness-Level trifft.

MARKET SOPHISTICATION (1-5):
- Level 1-3: "Besser/schneller/natürlich" Claims funktionieren noch.
- Level 4-5: Alle Claims maxed out → Sieg nur via Unique Mechanism ODER Sub-Audience-Positioning.
- 9 von 10 Brands sind heute Product-Aware.
- Verbinde mit existierender Narrative + gehe einen Schritt weiter.

CIALDINI'S 7:
- Reciprocity: Wertvoll geben (HVCO, Free Lead)
- Commitment/Consistency: Micro-Yes vor Macro-Yes
- Social Proof: Testimonials mit Foto, "30k+ Kunden", Before/After
- Authority: Expert Badge, Presse-Logos, Data Points
- Sympathy: "Ich war genau wie du bis..." — Similarity + Story
- Scarcity: Zeit/Menge/Access — auch was sie VERLIEREN
- Unity: Shared Identity ("als Unternehmer...", "für deine Liebsten")

Scarcity-Formel: Loss Aversion > Gain. "Du verlierst X" > "Du gewinnst X".

IDENTITY & DESIRE:
- Verkaufe den End State, nicht das Feature.
- Adler Minus → Plus: Weakness→Control, Isolation→Belonging, Insecurity→Confidence.
- Identity Filter: Jeder Kauf → "Passt das zu wem ich sein will?"`;

// ─────────────────────────────────────────────────────────────
// KPIs & SCALING — for kpi/scaling analysis
// ─────────────────────────────────────────────────────────────
export const KPI_KNOWLEDGE = `KPI DIAGNOSE & SCALING:

KPI DIAGNOSE (Top-Down):
- Hook Rate (3s/Impr) > 40% — sonst Hook schwach
- Hold Rate (ThruPlay/Impr) > 10% — sonst Lead schwach
- CTR (Link) > 2.5% — sonst Main Body/Angle/CTA schwach
- CVR > 2% — sonst Page-Problem
- AOV > 50 € — sonst CFO/Bundle-Problem
Regel: Schwacher KPI downstream → upstream zuerst prüfen.

UNIT ECONOMICS (5 KPIs):
- COGS: Einkauf + Versand — <30% des AOV
- AOV: 50-150€ Start (Bundles, Mengenrabatt, Up/Cross-Sell)
- CPA: Ad-Kosten pro Purchase
- DB1: Nettopreis − COGS = Break-Even CPA (min. 20€)
- DB2: DB1 − Ad-Costs = echte Profitabilität

Break-Even ROAS = Nettopreis ÷ DB1 → Zielband 1.4-1.8.

DB2 SCALING RULES:
- >20% → Budget hoch + Creative Output hoch
- 10-20% → Langsam hoch + Funnel optimieren
- <10% → Halten/senken + Funnel fixen
- Negativ → Budget auf Min, Bottleneck-Analyse

TRACKING INTEGRITY:
- Pixel + Browser + CAPI/Server-Side sauber (Shopify).
- Pixel/CAPI-Diskrepanzen (bis 5x Overcounting) → Meta optimiert auf falsche Signale.
- Server-side via Conversion API = am meisten übersehener Failure Point.
- Hyros als 2. Source of Truth (sehr genau).
- Real ROAS oft 20-40% über Meta-reported.`;

// ─────────────────────────────────────────────────────────────
// COMPRESSED — used in every prompt (~1.5KB)
// ─────────────────────────────────────────────────────────────
export const COMPRESSED_CORE = `${CORE_LAWS}

KERN-FRAMEWORKS:
- IRON Master Workflow: Research → Sophistication → UMP+UMS → CFO → Advertorial/VSL → Ad → LP → Test/Iterate.
- Triple Diamond: Pain → Limiting Beliefs → Gain Beliefs (High Sophistication).
- UMP/UMS: Unique Mechanism of Problem + Solution.
- CFO 3.0: All-in-One Bundle + Risk Reversal + Urgency + Unfair Advantage.
- 3-Tier Page: Long Form (cold) / Listicle (mid) / Short Offer (warm) / PDP (etabliert).
- Awareness Levels (Schwartz): Unaware→Problem→Solution→Product→Most Aware.
- Market Sophistication 4-5: Nur UMP/UMS oder Sub-Audience gewinnt.
- Andromeda: Iteriere KONZEPTE (Audience→Angle→Format), nicht Hooks.
- 20% Rule: Skaliere Winners ±20% täglich basierend auf letzte 3 Tage.
- 72h Rule: Nach Launch nicht anfassen.
- AOV×#Ads÷3: Testing-Adset Daily Budget.
- Bundle statt Discount (höhere Marge bei gleichem PV).
- VoC 3 Fragen: Current Annoyance / Biggest Barrier / Real Goal + Why.
- Break-Even ROAS Zielband: 1.4-1.8.`;
