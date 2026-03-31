/**
 * Generates a complete HTML report that opens in a new tab.
 * User can print to PDF via Ctrl+P / Cmd+P or save the HTML directly.
 * Much more reliable than jsPDF — handles Umlaute, complex layouts, and long content.
 */

const AWARENESS_LABELS = {
  1: "Unaware",
  2: "Problem Aware",
  3: "Solution Aware",
  4: "Product Aware",
  5: "Most Aware",
};

function esc(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderList(items, className = "") {
  if (!items?.length) return "";
  return `<ul class="${className}">${items.map(i => `<li>${esc(i)}</li>`).join("")}</ul>`;
}

function renderSummary(s) {
  if (!s) return "";
  return `
    <section class="section">
      <h2 class="section-title">Executive Summary</h2>
      <div class="summary-box">
        <p class="summary-text">${esc(s.executive_summary)}</p>
      </div>
      ${s.key_insight ? `<div class="insight-card gold"><div class="card-label">Wichtigste Erkenntnis</div><p>${esc(s.key_insight)}</p></div>` : ""}
      ${s.target_audience_insight ? `<div class="insight-card blue"><div class="card-label">Zielgruppen-Insight (Community-Recherche)</div><p>${esc(s.target_audience_insight)}</p></div>` : ""}
      ${s.biggest_opportunity ? `<div class="insight-card green"><div class="card-label">Gr\u00f6\u00dfte Chance</div><p>${esc(s.biggest_opportunity)}</p></div>` : ""}
      ${s.immediate_actions?.length ? `
        <h3>Sofort umsetzen</h3>
        <ol class="action-list">${s.immediate_actions.map(a => `<li>${esc(a)}</li>`).join("")}</ol>
      ` : ""}
      ${s.expected_impact ? `<div class="insight-card dark"><div class="card-label">Erwarteter Impact</div><p>${esc(s.expected_impact)}</p></div>` : ""}
    </section>`;
}

function renderAudit(a) {
  if (!a) return "";
  const n = Number(a.score);
  const cls = n >= 80 ? "good" : n >= 60 ? "mid" : "bad";
  return `
    <section class="section">
      <h2 class="section-title">Audit - Marketing Bewertung</h2>
      <div class="score-box score-${cls}">
        <span class="score-num">${n}</span><span class="score-of">/100</span>
      </div>
      <p class="diagnosis">${esc(a.diagnosis)}</p>
      <div class="two-col">
        <div>
          <h3 class="green">St\u00e4rken (Wins)</h3>
          ${renderList(a.wins, "wins")}
        </div>
        <div>
          <h3 class="red">Schwachstellen (Leaks)</h3>
          ${renderList(a.leaks, "leaks")}
        </div>
      </div>
      ${a.fixes?.length ? `
        <h3>Fixes</h3>
        <table class="data-table">
          <thead><tr><th>Impact</th><th>Problem</th><th>L\u00f6sung</th></tr></thead>
          <tbody>${a.fixes.map(f => `
            <tr>
              <td><span class="badge badge-${f.impact}">${esc(f.impact)}</span></td>
              <td><strong>${esc(f.issue)}</strong></td>
              <td>${esc(f.fix)}</td>
            </tr>`).join("")}
          </tbody>
        </table>` : ""}
    </section>`;
}

function renderOffer(o) {
  if (!o) return "";
  return `
    <section class="section">
      <h2 class="section-title">Offer - Angebotsstrategie</h2>
      <div class="offer-hero">
        <h3 class="offer-headline">${esc(o.headline)}</h3>
        ${o.subheadline ? `<p class="offer-sub">${esc(o.subheadline)}</p>` : ""}
      </div>
      ${o.promise ? `<div class="kv"><span class="kv-k">Versprechen</span><span class="kv-v">${esc(o.promise)}</span></div>` : ""}
      ${o.bullets?.length ? `<h3>Vorteile</h3>${renderList(o.bullets, "check-list")}` : ""}
      ${o.guarantee ? `<div class="kv highlight"><span class="kv-k">Garantie</span><span class="kv-v">${esc(o.guarantee)}</span></div>` : ""}
      ${o.bonuses?.length ? `
        <h3>Bonusse</h3>
        ${o.bonuses.map(b => `
          <div class="bonus-card">
            <strong>${esc(b.name)}</strong> <span class="muted">(Wert: ${esc(b.value)})</span>
            <p>${esc(b.description)}</p>
          </div>`).join("")}` : ""}
      ${o.cta ? `<div class="kv cta"><span class="kv-k">Call to Action</span><span class="kv-v">${esc(o.cta)}</span></div>` : ""}
      ${o.urgency ? `<div class="kv urgency"><span class="kv-k">Urgency</span><span class="kv-v">${esc(o.urgency)}</span></div>` : ""}
    </section>`;
}

function renderPain(p) {
  if (!p) return "";
  return `
    <section class="section">
      <h2 class="section-title">Pain - Schmerzpunkte & Einw\u00e4nde</h2>
      ${p.core_pain ? `<div class="kv highlight-red"><span class="kv-k">Kernschmerz</span><span class="kv-v">${esc(p.core_pain)}</span></div>` : ""}
      <div class="two-col">
        <div>
          <h3>Oberfl\u00e4chen-Schmerzen</h3>
          ${renderList(p.surface_pains)}
        </div>
        <div>
          <h3 class="red">Verborgene Schmerzen</h3>
          ${renderList(p.hidden_pains, "leaks")}
        </div>
      </div>
      ${p.desired_outcomes?.length ? `<h3 class="green">Gew\u00fcnschte Ergebnisse</h3>${renderList(p.desired_outcomes, "wins")}` : ""}
      ${p.objections?.length ? `
        <h3>Einw\u00e4nde & Reframes</h3>
        ${p.objections.map(o => `
          <div class="objection">
            <div class="obj-q">\u201e${esc(o.objection)}\u201c</div>
            <div class="obj-a">\u2192 ${esc(o.reframe)}</div>
          </div>`).join("")}` : ""}
      ${p.emotional_triggers?.length ? `
        <h3>Emotionale Trigger</h3>
        <div class="chip-row">${p.emotional_triggers.map(t => `<span class="chip">${esc(t)}</span>`).join("")}</div>` : ""}
    </section>`;
}

function renderHooks(hooks) {
  if (!hooks?.length) return "";
  return `
    <section class="section">
      <h2 class="section-title">Hooks - Aufmerksamkeit</h2>
      <table class="data-table">
        <thead><tr><th>Plattform</th><th>Typ</th><th>Hook</th><th>Angle</th></tr></thead>
        <tbody>${hooks.map(h => `
          <tr>
            <td><span class="badge badge-blue">${esc(h.platform)}</span></td>
            <td>${esc(h.type?.replace(/_/g, " "))}</td>
            <td class="hook-text">\u201e${esc(h.hook)}\u201c</td>
            <td class="muted">${esc(h.angle)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </section>`;
}

function renderScripts(s) {
  if (!s) return "";
  return `
    <section class="section">
      <h2 class="section-title">Scripts - Fertige Werbetexte</h2>
      ${s.ads?.length ? `
        <h3>Ad Scripts</h3>
        ${s.ads.map(ad => `
          <div class="script-card">
            <div class="script-head">
              <span class="badge badge-blue">${esc(ad.platform)}</span>
              <span class="badge badge-outline">${esc(ad.format)}</span>
            </div>
            <div class="script-section"><strong>Hook:</strong> ${esc(ad.hook)}</div>
            <div class="script-section script-body"><strong>Body:</strong><br>${esc(ad.body)}</div>
            <div class="script-section cta-line"><strong>CTA:</strong> ${esc(ad.cta)}</div>
          </div>`).join("")}` : ""}
      ${s.emails?.length ? `
        <h3>E-Mail Scripts</h3>
        ${s.emails.map(em => `
          <div class="script-card">
            <div class="script-head"><span class="badge badge-gold">${esc(em.purpose)}</span></div>
            <div class="script-section"><strong>Betreff:</strong> ${esc(em.subject)}</div>
            ${em.preview ? `<div class="script-section muted"><strong>Preview:</strong> ${esc(em.preview)}</div>` : ""}
            <div class="script-section script-body">${esc(em.body)}</div>
          </div>`).join("")}` : ""}
      ${s.landing_page ? `
        <h3>Landing Page</h3>
        <div class="script-card">
          <h4 class="offer-headline">${esc(s.landing_page.hero_headline)}</h4>
          <p class="offer-sub">${esc(s.landing_page.hero_subheadline)}</p>
          ${(s.landing_page.sections || []).map(sec => `
            <div class="kv"><span class="kv-k">${esc(sec.type)}</span><span class="kv-v">${esc(sec.content)}</span></div>`).join("")}
        </div>` : ""}
    </section>`;
}

function renderFunnel(f) {
  if (!f) return "";
  return `
    <section class="section">
      <h2 class="section-title">Funnel - Conversion Strategie</h2>
      ${f.strategy ? `<div class="kv"><span class="kv-k">Strategie</span><span class="kv-v">${esc(f.strategy)}</span></div>` : ""}
      ${f.steps?.length ? `
        <h3>Funnel Steps</h3>
        <div class="funnel-steps">
          ${f.steps.map((s, i) => `
            <div class="funnel-step">
              <div class="step-num">${i + 1}</div>
              <div class="step-body">
                <strong>${esc(s.name)}</strong>
                <p>${esc(s.description)}</p>
                <div class="step-meta">
                  <span class="chip">Ziel: ${esc(s.conversion_goal)}</span>
                  <span class="chip chip-outline">${esc(s.content_type)}</span>
                </div>
              </div>
            </div>`).join("")}
        </div>` : ""}
      ${f.kpis?.length ? `
        <h3>KPIs</h3>
        <table class="data-table">
          <thead><tr><th>Metrik</th><th>Ziel</th><th>Warum</th></tr></thead>
          <tbody>${f.kpis.map(k => `
            <tr><td><strong>${esc(k.metric)}</strong></td><td>${esc(k.target)}</td><td>${esc(k.why)}</td></tr>`).join("")}
          </tbody>
        </table>` : ""}
    </section>`;
}

function renderSpec(sp) {
  if (!sp) return "";
  const a = sp.avatar || {};
  return `
    <section class="section">
      <h2 class="section-title">Spec - Markenspezifikation</h2>
      <div class="avatar-box">
        <h3>\ud83d\udc64 ${esc(a.name)} (${esc(a.age)}, ${esc(a.role)})</h3>
        <div class="two-col">
          <div>
            <h4 class="red">Frustrationen</h4>
            ${renderList(a.frustrations, "leaks")}
          </div>
          <div>
            <h4 class="green">Ziele</h4>
            ${renderList(a.goals, "wins")}
          </div>
        </div>
        ${a.media_habits?.length ? `
          <h4>Mediennutzung</h4>
          <div class="chip-row">${a.media_habits.map(m => `<span class="chip">${esc(m)}</span>`).join("")}</div>` : ""}
      </div>
      ${sp.mechanism ? `<div class="kv"><span class="kv-k">Mechanismus / USP</span><span class="kv-v">${esc(sp.mechanism)}</span></div>` : ""}
      ${sp.positioning ? `<div class="kv"><span class="kv-k">Positionierung</span><span class="kv-v">${esc(sp.positioning)}</span></div>` : ""}
      ${sp.tone ? `<div class="kv"><span class="kv-k">Tonalit\u00e4t</span><span class="kv-v">${esc(sp.tone)}</span></div>` : ""}
      ${sp.brand_voice?.length ? `<div class="chip-row">${sp.brand_voice.map(v => `<span class="chip chip-gold">${esc(v)}</span>`).join("")}</div>` : ""}
      ${sp.channels?.length ? `
        <h3>Kan\u00e4le</h3>
        <table class="data-table">
          <thead><tr><th>Kanal</th><th>Priorit\u00e4t</th><th>Grund</th></tr></thead>
          <tbody>${sp.channels.map(c => `
            <tr>
              <td><strong>${esc(c.channel)}</strong></td>
              <td><span class="badge badge-${c.priority === 'prim\u00e4r' ? 'green' : c.priority === 'sekund\u00e4r' ? 'gold' : 'blue'}">${esc(c.priority)}</span></td>
              <td>${esc(c.reason)}</td>
            </tr>`).join("")}
          </tbody>
        </table>` : ""}
    </section>`;
}

function renderImplementation(result) {
  const parts = [];
  parts.push(`<section class="section"><h2 class="section-title">Umsetzungsplan</h2>`);

  // Phase 1: High-impact fixes
  const highFixes = result.audit?.fixes?.filter(f => f.impact === "hoch") || [];
  if (highFixes.length) {
    parts.push(`<h3>Phase 1: Sofort umsetzen (High Impact)</h3>`);
    parts.push(`<ol class="action-list">${highFixes.map(f => `<li><strong>${esc(f.issue)}:</strong> ${esc(f.fix)}</li>`).join("")}</ol>`);
  }

  // Phase 2: Funnel
  if (result.funnel?.steps?.length) {
    parts.push(`<h3>Phase 2: Funnel aufbauen</h3>`);
    if (result.funnel.strategy) parts.push(`<p>${esc(result.funnel.strategy)}</p>`);
    parts.push(`<ol>${result.funnel.steps.map((s, i) => `<li><strong>${esc(s.name)}:</strong> ${esc(s.description)}</li>`).join("")}</ol>`);
  }

  // Phase 3: Content
  parts.push(`<h3>Phase 3: Content erstellen</h3><ul>`);
  if (result.hooks?.length) {
    result.hooks.slice(0, 3).forEach(h => parts.push(`<li>[${esc(h.platform)}] Hook: \u201e${esc(h.hook)}\u201c</li>`));
  }
  if (result.scripts?.ads?.length) {
    result.scripts.ads.slice(0, 2).forEach(a => parts.push(`<li>Ad Script: ${esc(a.platform)} ${esc(a.format)}</li>`));
  }
  if (result.scripts?.emails?.length) {
    result.scripts.emails.slice(0, 2).forEach(e => parts.push(`<li>E-Mail: ${esc(e.purpose)} \u2013 ${esc(e.subject)}</li>`));
  }
  parts.push(`</ul>`);

  // Phase 4: Channels
  if (result.spec?.channels?.length) {
    parts.push(`<h3>Phase 4: Kan\u00e4le aktivieren</h3><ul>`);
    const sorted = [...result.spec.channels].sort((a, b) => {
      const o = { "prim\u00e4r": 0, "sekund\u00e4r": 1, "terti\u00e4r": 2 };
      return (o[a.priority] ?? 1) - (o[b.priority] ?? 1);
    });
    sorted.forEach(c => parts.push(`<li><strong>[${esc(c.priority?.toUpperCase())}] ${esc(c.channel)}:</strong> ${esc(c.reason)}</li>`));
    parts.push(`</ul>`);
  }

  // Phase 5: KPIs
  if (result.funnel?.kpis?.length) {
    parts.push(`<h3>Phase 5: KPIs tracken</h3><ul>`);
    result.funnel.kpis.forEach(k => parts.push(`<li><strong>${esc(k.metric)}:</strong> Ziel ${esc(k.target)} \u2013 ${esc(k.why)}</li>`));
    parts.push(`</ul>`);
  }

  // Medium fixes
  const medFixes = result.audit?.fixes?.filter(f => f.impact === "mittel") || [];
  if (medFixes.length) {
    parts.push(`<h3>Phase 6: Weitere Optimierungen</h3><ul>`);
    medFixes.forEach(f => parts.push(`<li><strong>${esc(f.issue)}:</strong> ${esc(f.fix)}</li>`));
    parts.push(`</ul>`);
  }

  parts.push(`</section>`);
  return parts.join("");
}

export function generateReport(result, form, awarenessLevel) {
  const dateStr = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
  const awLabel = AWARENESS_LABELS[awarenessLevel] || "Solution Aware";

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SCALE ENGINE \u2013 ${esc(form.un)} \u2013 ${dateStr}</title>
<style>
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
    .section { page-break-inside: avoid; }
    @page { margin: 15mm; }
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e2330; background: #f5f7fa; line-height: 1.6; }
  .container { max-width: 900px; margin: 0 auto; padding: 24px; }

  /* Cover */
  .cover { background: linear-gradient(135deg, #1e2330, #2a3040); color: #fff; padding: 60px 40px; text-align: center; border-radius: 16px; margin-bottom: 32px; }
  .cover h1 { font-size: 36px; color: #d42b2b; letter-spacing: 2px; margin-bottom: 8px; }
  .cover .subtitle { color: #d6b25e; font-size: 16px; margin-bottom: 32px; }
  .cover .company { font-size: 24px; margin-bottom: 8px; }
  .cover .meta { color: #78829a; font-size: 14px; }
  .cover .divider { border: none; border-top: 1px solid #d42b2b33; margin: 24px auto; width: 50%; }

  /* Print bar */
  .print-bar { background: #1e2330; color: #fff; padding: 12px 24px; text-align: center; position: sticky; top: 0; z-index: 100; }
  .print-bar button { background: #d42b2b; color: #fff; border: none; padding: 8px 24px; border-radius: 6px; font-size: 14px; cursor: pointer; margin: 0 8px; }
  .print-bar button:hover { background: #b82525; }
  .print-bar .hint { color: #78829a; font-size: 12px; margin-left: 12px; }

  /* Sections */
  .section { background: #fff; border-radius: 12px; padding: 28px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  .section-title { font-size: 20px; color: #d42b2b; border-bottom: 2px solid #d42b2b; padding-bottom: 8px; margin-bottom: 20px; }
  h3 { font-size: 15px; color: #1e2330; margin: 18px 0 10px; }
  h4 { font-size: 13px; color: #1e2330; margin: 12px 0 6px; }
  p { margin-bottom: 8px; }

  /* Summary */
  .summary-box { background: #f0f2f8; border-radius: 8px; padding: 20px; margin-bottom: 16px; }
  .summary-text { font-size: 15px; line-height: 1.7; }
  .insight-card { border-left: 4px solid #ccc; padding: 14px 18px; margin-bottom: 12px; border-radius: 0 8px 8px 0; background: #fafbfc; }
  .insight-card.gold { border-color: #d6b25e; background: #fdf8ef; }
  .insight-card.green { border-color: #1fbf75; background: #eefbf4; }
  .insight-card.blue { border-color: #5ea8d6; background: #eef6fc; }
  .insight-card.dark { border-color: #1e2330; background: #f0f2f8; }
  .card-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #78829a; letter-spacing: 0.5px; margin-bottom: 4px; }

  /* Score */
  .score-box { text-align: center; margin: 16px 0; }
  .score-num { font-size: 48px; font-weight: 800; }
  .score-of { font-size: 20px; color: #78829a; }
  .score-good .score-num { color: #1fbf75; }
  .score-mid .score-num { color: #d6b25e; }
  .score-bad .score-num { color: #d42b2b; }
  .diagnosis { text-align: center; color: #555; font-size: 14px; margin-bottom: 16px; }

  /* Layout */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 12px; }
  @media (max-width: 600px) { .two-col { grid-template-columns: 1fr; } }

  /* Lists */
  ul, ol { padding-left: 20px; margin-bottom: 12px; }
  li { margin-bottom: 4px; font-size: 13px; }
  .wins li::marker { color: #1fbf75; }
  .leaks li::marker { color: #d42b2b; }
  .check-list { list-style: none; padding: 0; }
  .check-list li::before { content: "\\2713 "; color: #1fbf75; font-weight: bold; }
  .action-list li { margin-bottom: 8px; font-size: 14px; }

  /* Key-Value */
  .kv { display: flex; gap: 12px; padding: 12px 16px; background: #fafbfc; border-radius: 8px; margin-bottom: 8px; align-items: baseline; }
  .kv-k { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #78829a; min-width: 110px; flex-shrink: 0; }
  .kv-v { font-size: 13px; }
  .kv.highlight { border-left: 3px solid #d6b25e; }
  .kv.highlight-red { border-left: 3px solid #d42b2b; }
  .kv.cta { border-left: 3px solid #1fbf75; }
  .kv.urgency { border-left: 3px solid #d42b2b; background: #fdf0f0; }

  /* Tables */
  .data-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px; }
  .data-table th { background: #1e2330; color: #fff; padding: 10px 12px; text-align: left; font-size: 12px; }
  .data-table td { padding: 10px 12px; border-bottom: 1px solid #eee; vertical-align: top; }
  .data-table tr:nth-child(even) td { background: #fafbfc; }
  .hook-text { font-style: italic; }

  /* Badges & Chips */
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; color: #fff; }
  .badge-hoch { background: #d42b2b; }
  .badge-mittel { background: #d6b25e; }
  .badge-niedrig { background: #5ea8d6; }
  .badge-blue { background: #5ea8d6; }
  .badge-green { background: #1fbf75; }
  .badge-gold { background: #d6b25e; }
  .badge-outline { background: transparent; border: 1px solid #78829a; color: #78829a; }
  .chip-row { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
  .chip { background: #eef0f5; padding: 4px 10px; border-radius: 20px; font-size: 12px; }
  .chip-outline { border: 1px solid #78829a; background: transparent; }
  .chip-gold { background: #fdf8ef; color: #8a6d1b; border: 1px solid #d6b25e; }

  /* Cards */
  .offer-hero { background: linear-gradient(135deg, #1e2330, #2a3040); color: #fff; padding: 24px; border-radius: 10px; margin-bottom: 16px; }
  .offer-headline { color: #d6b25e; font-size: 18px; }
  .offer-sub { color: #aab3c5; font-size: 14px; margin-top: 6px; }
  .bonus-card { background: #fdf8ef; border: 1px solid #d6b25e33; padding: 12px 16px; border-radius: 8px; margin-bottom: 8px; }
  .objection { padding: 12px 16px; background: #fafbfc; border-radius: 8px; margin-bottom: 8px; }
  .obj-q { color: #d42b2b; font-style: italic; margin-bottom: 4px; }
  .obj-a { color: #1fbf75; }
  .avatar-box { background: #f0f2f8; padding: 20px; border-radius: 10px; margin-bottom: 16px; }

  /* Scripts */
  .script-card { border: 1px solid #e2e5ec; border-radius: 10px; padding: 18px; margin-bottom: 14px; }
  .script-head { margin-bottom: 10px; display: flex; gap: 8px; }
  .script-section { margin-bottom: 8px; font-size: 13px; }
  .script-body { white-space: pre-wrap; background: #fafbfc; padding: 10px; border-radius: 6px; font-size: 12px; line-height: 1.5; }
  .cta-line { color: #1fbf75; font-weight: 600; }

  /* Funnel */
  .funnel-steps { position: relative; padding-left: 40px; }
  .funnel-step { display: flex; gap: 14px; margin-bottom: 16px; }
  .step-num { width: 28px; height: 28px; background: #d6b25e; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0; }
  .step-body { flex: 1; }
  .step-meta { display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap; }

  /* Colors */
  .green { color: #1fbf75; }
  .red { color: #d42b2b; }
  .muted { color: #78829a; }

  /* Footer */
  .footer { text-align: center; color: #78829a; font-size: 12px; padding: 24px; }
</style>
</head>
<body>

<div class="print-bar no-print">
  <button onclick="window.print()">Als PDF speichern (Ctrl+P)</button>
  <span class="hint">W\u00e4hle im Druckdialog "Als PDF speichern" als Drucker</span>
</div>

<div class="container">
  <div class="cover">
    <h1>SCALE ENGINE</h1>
    <div class="subtitle">Marketing Analyse & Strategie</div>
    <hr class="divider">
    <div class="company">${esc(form.un)}</div>
    <div class="meta">${esc(form.pr)}${form.px ? ` \u2013 ${esc(form.px)}` : ""}</div>
    <div class="meta">Awareness Level ${awarenessLevel}: ${esc(awLabel)}</div>
    <div class="meta">${dateStr}</div>
  </div>

  ${renderSummary(result.summary)}
  ${renderAudit(result.audit)}
  ${renderOffer(result.offer)}
  ${renderPain(result.pain)}
  ${renderHooks(result.hooks)}
  ${renderScripts(result.scripts)}
  ${renderFunnel(result.funnel)}
  ${renderSpec(result.spec)}
  ${renderImplementation(result)}

  <div class="footer">
    Erstellt mit SCALE ENGINE \u2013 AI-Powered Marketing Intelligence \u2013 ${dateStr}
  </div>
</div>

</body>
</html>`;

  // Open in new tab
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");

  // Also offer direct download
  const a = document.createElement("a");
  a.href = url;
  const safeName = (form.un || "Analyse").replace(/[^a-zA-Z0-9\u00e4\u00f6\u00fc\u00c4\u00d6\u00dc\u00df\-_]/g, "_");
  a.download = `ScaleEngine_${safeName}_${new Date().toISOString().slice(0, 10)}.html`;
  a.click();
}
