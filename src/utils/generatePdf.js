import jsPDF from "jspdf";
import "jspdf-autotable";

const COLORS = {
  primary: [212, 43, 43],     // red
  gold: [214, 178, 94],
  green: [31, 191, 117],
  blue: [94, 168, 214],
  dark: [30, 35, 42],
  muted: [120, 130, 145],
  light: [245, 247, 250],
  white: [255, 255, 255],
};

const AWARENESS_LABELS = {
  1: "Unaware",
  2: "Problem Aware",
  3: "Solution Aware",
  4: "Product Aware",
  5: "Most Aware",
};

const PAGE_W = 210;
const MARGIN = 20;
const CONTENT_W = PAGE_W - 2 * MARGIN;

let doc;
let y;

function checkPage(needed = 20) {
  if (y + needed > 275) {
    doc.addPage();
    y = 25;
  }
}

function sectionTitle(text) {
  checkPage(30);
  y += 8;
  doc.setFillColor(...COLORS.primary);
  doc.rect(MARGIN, y, CONTENT_W, 10, "F");
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(text.toUpperCase(), MARGIN + 4, y + 7);
  doc.setTextColor(...COLORS.dark);
  y += 16;
}

function subTitle(text) {
  checkPage(15);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text(text, MARGIN, y);
  y += 6;
}

function bodyText(text, indent = 0) {
  if (!text) return;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 65, 75);
  const lines = doc.splitTextToSize(text, CONTENT_W - indent);
  for (const line of lines) {
    checkPage(5);
    doc.text(line, MARGIN + indent, y);
    y += 4.5;
  }
  y += 2;
}

function bulletList(items, color = COLORS.dark) {
  if (!items?.length) return;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  for (const item of items) {
    checkPage(6);
    doc.setTextColor(...color);
    doc.text("\u2022", MARGIN + 2, y);
    doc.setTextColor(60, 65, 75);
    const lines = doc.splitTextToSize(item, CONTENT_W - 8);
    doc.text(lines[0], MARGIN + 7, y);
    y += 4.5;
    for (let i = 1; i < lines.length; i++) {
      checkPage(5);
      doc.text(lines[i], MARGIN + 7, y);
      y += 4.5;
    }
  }
  y += 2;
}

function badge(text, color, x, yPos) {
  doc.setFontSize(7);
  const w = doc.getTextWidth(text) + 4;
  doc.setFillColor(...color);
  doc.roundedRect(x, yPos - 3, w, 5, 1, 1, "F");
  doc.setTextColor(...COLORS.white);
  doc.text(text, x + 2, yPos);
  doc.setTextColor(...COLORS.dark);
  return w;
}

// --- Section renderers ---

function renderAudit(audit) {
  sectionTitle("Audit – Marketing Bewertung");

  // Score
  checkPage(20);
  const scoreColor = audit.score >= 80 ? COLORS.green : audit.score >= 60 ? COLORS.gold : COLORS.primary;
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...scoreColor);
  doc.text(`${audit.score}/100`, MARGIN, y + 8);
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text("Marketing Score", MARGIN + 35, y + 8);
  y += 14;

  bodyText(audit.diagnosis);

  if (audit.wins?.length) { subTitle("Staerken"); bulletList(audit.wins, COLORS.green); }
  if (audit.leaks?.length) { subTitle("Schwachstellen"); bulletList(audit.leaks, COLORS.primary); }

  if (audit.fixes?.length) {
    subTitle("Fixes");
    for (const fix of audit.fixes) {
      checkPage(14);
      const impactColor = fix.impact === "hoch" ? COLORS.primary : fix.impact === "mittel" ? COLORS.gold : COLORS.blue;
      badge(fix.impact?.toUpperCase() || "MITTEL", impactColor, MARGIN, y);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.dark);
      doc.text(fix.issue || "", MARGIN + 22, y);
      y += 5;
      bodyText(fix.fix, 4);
    }
  }
}

function renderOffer(offer) {
  sectionTitle("Offer – Angebotsstrategie");
  if (offer.headline) { subTitle("Headline"); bodyText(offer.headline); }
  if (offer.subheadline) bodyText(offer.subheadline);
  if (offer.promise) { subTitle("Versprechen"); bodyText(offer.promise); }
  if (offer.bullets?.length) { subTitle("Vorteile"); bulletList(offer.bullets, COLORS.green); }
  if (offer.guarantee) { subTitle("Garantie"); bodyText(offer.guarantee); }
  if (offer.bonuses?.length) {
    subTitle("Bonusse");
    for (const b of offer.bonuses) {
      checkPage(10);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`${b.name} (Wert: ${b.value})`, MARGIN + 4, y);
      y += 5;
      bodyText(b.description, 4);
    }
  }
  if (offer.cta) { subTitle("Call to Action"); bodyText(offer.cta); }
  if (offer.urgency) { subTitle("Urgency"); bodyText(offer.urgency); }
}

function renderPain(pain) {
  sectionTitle("Pain – Schmerzpunkte & Einwaende");
  if (pain.core_pain) { subTitle("Kernschmerz"); bodyText(pain.core_pain); }
  if (pain.surface_pains?.length) { subTitle("Oberflaechliche Schmerzen"); bulletList(pain.surface_pains); }
  if (pain.hidden_pains?.length) { subTitle("Versteckte Schmerzen"); bulletList(pain.hidden_pains); }
  if (pain.desired_outcomes?.length) { subTitle("Gewuenschte Ergebnisse"); bulletList(pain.desired_outcomes, COLORS.green); }
  if (pain.objections?.length) {
    subTitle("Einwaende & Reframes");
    for (const o of pain.objections) {
      checkPage(12);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.primary);
      doc.text(`Einwand: ${o.objection}`, MARGIN + 4, y);
      y += 5;
      doc.setTextColor(...COLORS.green);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(`Reframe: ${o.reframe}`, CONTENT_W - 8);
      for (const l of lines) { checkPage(5); doc.text(l, MARGIN + 4, y); y += 4.5; }
      doc.setTextColor(...COLORS.dark);
      y += 2;
    }
  }
  if (pain.emotional_triggers?.length) { subTitle("Emotionale Trigger"); bulletList(pain.emotional_triggers); }
}

function renderHooks(hooks) {
  sectionTitle("Hooks – Aufmerksamkeits-Hooks");
  if (!hooks?.length) return;

  const tableBody = hooks.map((h) => [
    h.platform || "",
    h.type || "",
    `"${h.hook}"`,
    h.angle || "",
  ]);

  doc.autoTable({
    startY: y,
    head: [["Plattform", "Typ", "Hook", "Angle"]],
    body: tableBody,
    margin: { left: MARGIN, right: MARGIN },
    styles: { fontSize: 8, cellPadding: 2, textColor: [60, 65, 75] },
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 249, 252] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 28 },
      2: { cellWidth: 75 },
      3: { cellWidth: 45 },
    },
  });

  y = doc.lastAutoTable.finalY + 6;
}

function renderScripts(scripts) {
  sectionTitle("Scripts – Fertige Werbetexte");

  if (scripts.ads?.length) {
    subTitle("Ad Scripts");
    for (const ad of scripts.ads) {
      checkPage(20);
      doc.setFillColor(...COLORS.light);
      doc.roundedRect(MARGIN, y - 2, CONTENT_W, 6, 1, 1, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`${ad.platform} – ${ad.format}`, MARGIN + 3, y + 2);
      y += 8;
      if (ad.hook) { bodyText(`Hook: ${ad.hook}`, 4); }
      if (ad.body) { bodyText(ad.body, 4); }
      if (ad.cta) { bodyText(`CTA: ${ad.cta}`, 4); }
      y += 3;
    }
  }

  if (scripts.emails?.length) {
    subTitle("E-Mail Scripts");
    for (const em of scripts.emails) {
      checkPage(20);
      doc.setFillColor(...COLORS.light);
      doc.roundedRect(MARGIN, y - 2, CONTENT_W, 6, 1, 1, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`${em.purpose} – Betreff: ${em.subject}`, MARGIN + 3, y + 2);
      y += 8;
      if (em.preview) bodyText(`Preview: ${em.preview}`, 4);
      if (em.body) bodyText(em.body, 4);
      y += 3;
    }
  }

  if (scripts.landing_page) {
    const lp = scripts.landing_page;
    subTitle("Landing Page");
    if (lp.hero_headline) bodyText(`Headline: ${lp.hero_headline}`);
    if (lp.hero_subheadline) bodyText(`Subheadline: ${lp.hero_subheadline}`);
    if (lp.sections?.length) {
      for (const s of lp.sections) {
        checkPage(10);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(s.type || "", MARGIN + 4, y);
        y += 5;
        bodyText(s.content, 4);
      }
    }
  }
}

function renderFunnel(funnel) {
  sectionTitle("Funnel – Conversion Strategie");
  if (funnel.strategy) { subTitle("Strategie"); bodyText(funnel.strategy); }

  if (funnel.steps?.length) {
    subTitle("Funnel Steps");
    for (let i = 0; i < funnel.steps.length; i++) {
      const s = funnel.steps[i];
      checkPage(16);
      // Step number circle
      doc.setFillColor(...COLORS.gold);
      doc.circle(MARGIN + 4, y, 3, "F");
      doc.setTextColor(...COLORS.white);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}`, MARGIN + 2.8, y + 1.2);
      doc.setTextColor(...COLORS.dark);
      doc.setFontSize(9);
      doc.text(s.name, MARGIN + 10, y + 1);
      y += 6;
      bodyText(s.description, 10);
      if (s.conversion_goal) bodyText(`Ziel: ${s.conversion_goal}`, 10);
      if (s.content_type) bodyText(`Content: ${s.content_type}`, 10);
    }
  }

  if (funnel.kpis?.length) {
    subTitle("KPIs");
    const tableBody = funnel.kpis.map((k) => [k.metric, k.target, k.why]);
    doc.autoTable({
      startY: y,
      head: [["Metrik", "Ziel", "Warum"]],
      body: tableBody,
      margin: { left: MARGIN, right: MARGIN },
      styles: { fontSize: 8, cellPadding: 2, textColor: [60, 65, 75] },
      headStyles: { fillColor: COLORS.gold, textColor: COLORS.white, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 249, 252] },
    });
    y = doc.lastAutoTable.finalY + 6;
  }
}

function renderSpec(spec) {
  sectionTitle("Spec – Markenspezifikation");

  if (spec.avatar) {
    const a = spec.avatar;
    subTitle(`Avatar: ${a.name || "Zielkunde"} (${a.age || ""}, ${a.role || ""})`);
    if (a.frustrations?.length) { bodyText("Frustrationen:"); bulletList(a.frustrations, COLORS.primary); }
    if (a.goals?.length) { bodyText("Ziele:"); bulletList(a.goals, COLORS.green); }
    if (a.media_habits?.length) { bodyText("Medienverhalten:"); bulletList(a.media_habits); }
  }

  if (spec.mechanism) { subTitle("Mechanismus / USP"); bodyText(spec.mechanism); }
  if (spec.positioning) { subTitle("Positionierung"); bodyText(spec.positioning); }
  if (spec.tone) { subTitle("Tonalitaet"); bodyText(spec.tone); }
  if (spec.brand_voice?.length) { subTitle("Brand Voice"); bulletList(spec.brand_voice, COLORS.gold); }

  if (spec.channels?.length) {
    subTitle("Kanaele");
    const tableBody = spec.channels.map((c) => [c.channel, c.priority, c.reason]);
    doc.autoTable({
      startY: y,
      head: [["Kanal", "Prioritaet", "Grund"]],
      body: tableBody,
      margin: { left: MARGIN, right: MARGIN },
      styles: { fontSize: 8, cellPadding: 2, textColor: [60, 65, 75] },
      headStyles: { fillColor: COLORS.blue, textColor: COLORS.white, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 249, 252] },
    });
    y = doc.lastAutoTable.finalY + 6;
  }
}

function renderImplementationGuide(result) {
  sectionTitle("Umsetzungsplan – Schritt fuer Schritt");

  // 1. Sofort umsetzen (high-impact fixes)
  const highFixes = result.audit?.fixes?.filter((f) => f.impact === "hoch") || [];
  if (highFixes.length) {
    subTitle("1. Sofort umsetzen (High Impact)");
    bulletList(highFixes.map((f) => `${f.issue}: ${f.fix}`), COLORS.primary);
  }

  // 2. Funnel aufbauen
  if (result.funnel?.steps?.length) {
    subTitle("2. Funnel aufbauen");
    bodyText(result.funnel.strategy || "");
    bulletList(result.funnel.steps.map((s, i) => `Schritt ${i + 1}: ${s.name} – ${s.description}`));
  }

  // 3. Content erstellen
  subTitle("3. Content erstellen (Prioritaet)");
  const contentTasks = [];
  if (result.hooks?.length) {
    const topHooks = result.hooks.slice(0, 3);
    contentTasks.push(...topHooks.map((h) => `[${h.platform}] Hook: "${h.hook}"`));
  }
  if (result.scripts?.ads?.length) {
    contentTasks.push(...result.scripts.ads.slice(0, 2).map((a) => `Ad Script: ${a.platform} ${a.format}`));
  }
  if (result.scripts?.emails?.length) {
    contentTasks.push(...result.scripts.emails.slice(0, 2).map((e) => `E-Mail: ${e.purpose} – ${e.subject}`));
  }
  if (contentTasks.length) bulletList(contentTasks);

  // 4. Kanaele aktivieren
  if (result.spec?.channels?.length) {
    subTitle("4. Kanaele aktivieren");
    const sorted = [...result.spec.channels].sort((a, b) => {
      const order = { "primaer": 0, "sekundaer": 1, "tertiaer": 2 };
      return (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
    });
    bulletList(sorted.map((c) => `[${c.priority?.toUpperCase()}] ${c.channel}: ${c.reason}`));
  }

  // 5. KPIs tracken
  if (result.funnel?.kpis?.length) {
    subTitle("5. KPIs tracken");
    bulletList(result.funnel.kpis.map((k) => `${k.metric}: Ziel ${k.target} – ${k.why}`));
  }

  // 6. Medium-impact fixes
  const medFixes = result.audit?.fixes?.filter((f) => f.impact === "mittel") || [];
  if (medFixes.length) {
    subTitle("6. Weitere Optimierungen (Medium Impact)");
    bulletList(medFixes.map((f) => `${f.issue}: ${f.fix}`));
  }
}

export async function generatePdf(result, form, awarenessLevel) {
  doc = new jsPDF({ unit: "mm", format: "a4" });
  y = 25;

  // --- Cover page ---
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, PAGE_W, 297, "F");

  // Logo / Title
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text("SCALE ENGINE", PAGE_W / 2, 80, { align: "center" });

  doc.setTextColor(...COLORS.gold);
  doc.setFontSize(14);
  doc.text("Marketing Analyse & Strategie", PAGE_W / 2, 92, { align: "center" });

  // Company info
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(20);
  doc.text(form.un || "Unternehmen", PAGE_W / 2, 130, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(...COLORS.muted);
  if (form.pr) doc.text(form.pr, PAGE_W / 2, 142, { align: "center" });

  // Awareness badge
  const awLabel = AWARENESS_LABELS[awarenessLevel] || "Solution Aware";
  doc.setFontSize(10);
  doc.text(`Awareness Level ${awarenessLevel}: ${awLabel}`, PAGE_W / 2, 160, { align: "center" });

  // Date
  const dateStr = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(dateStr, PAGE_W / 2, 172, { align: "center" });

  // Branding line
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(60, 185, 150, 185);
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text("Erstellt mit SCALE ENGINE \u2013 AI-Powered Marketing Intelligence", PAGE_W / 2, 192, { align: "center" });

  // --- Content pages ---
  doc.addPage();
  y = 25;
  doc.setFillColor(...COLORS.white);

  if (result.audit) renderAudit(result.audit);
  if (result.offer) renderOffer(result.offer);
  if (result.pain) renderPain(result.pain);
  if (result.hooks) renderHooks(result.hooks);
  if (result.scripts) renderScripts(result.scripts);
  if (result.funnel) renderFunnel(result.funnel);
  if (result.spec) renderSpec(result.spec);

  // Implementation guide
  renderImplementationGuide(result);

  // Footer on every page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 2; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.muted);
    doc.text(`SCALE ENGINE \u2013 ${form.un || ""}`, MARGIN, 290);
    doc.text(`Seite ${i - 1} von ${pageCount - 1}`, PAGE_W - MARGIN, 290, { align: "right" });
  }

  // Download
  const safeName = (form.un || "Analyse").replace(/[^a-zA-Z0-9äöüÄÖÜß\-_]/g, "_");
  doc.save(`ScaleEngine_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
