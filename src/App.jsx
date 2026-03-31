import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CopyBtn from "./components/CopyBtn";
import { AWARENESS, EMPTY_FORM, STEPS, STORAGE_KEY, TABS } from "./constants";

async function exportPdf(result, form, aw) {
  const { generatePdf } = await import("./utils/generatePdf");
  await generatePdf(result, form, aw);
}

/* ── helpers ── */

function prettyLabel(key = "") {
  return String(key).replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

/* ── Tab-specific renderers ── */

function AuditTab({ data }) {
  if (!data) return null;
  const n = Number(data.score);
  const cls = n >= 80 ? "good" : n >= 60 ? "mid" : "bad";

  return (
    <div className="tab-content">
      <div className="score-hero">
        <div className={`score-ring score-ring-${cls}`}>
          <span className="score-number">{n}</span>
          <span className="score-label">/ 100</span>
        </div>
        <p className="diagnosis">{data.diagnosis}</p>
      </div>

      <div className="two-col">
        <div>
          <h3 className="section-title green-accent">Wins</h3>
          {data.wins?.map((w, i) => (
            <div key={i} className="pill-card pill-good">{w}</div>
          ))}
        </div>
        <div>
          <h3 className="section-title red-accent">Leaks</h3>
          {data.leaks?.map((l, i) => (
            <div key={i} className="pill-card pill-bad">{l}</div>
          ))}
        </div>
      </div>

      <h3 className="section-title gold-accent">Fixes</h3>
      <div className="stack-sm">
        {data.fixes?.map((f, i) => (
          <div key={i} className="fix-card">
            <div className="fix-head">
              <span className={`impact-badge impact-${f.impact}`}>{f.impact}</span>
              <strong>{f.issue}</strong>
            </div>
            <p className="fix-body">{f.fix}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function OfferTab({ data }) {
  if (!data) return null;
  return (
    <div className="tab-content">
      <div className="offer-hero">
        <h2 className="offer-headline">{data.headline}</h2>
        <p className="offer-sub">{data.subheadline}</p>
      </div>
      <div className="kv-card">
        <div className="kv-key">Versprechen</div>
        <div className="kv-value">{data.promise}</div>
      </div>
      <h3 className="section-title">Bullet Points</h3>
      <div className="stack-sm">
        {data.bullets?.map((b, i) => (
          <div key={i} className="bullet-card">✓ {b}</div>
        ))}
      </div>
      <div className="two-col">
        <div className="kv-card">
          <div className="kv-key">Garantie</div>
          <div className="kv-value">{data.guarantee}</div>
        </div>
        <div className="kv-card">
          <div className="kv-key">CTA</div>
          <div className="kv-value cta-text">{data.cta}</div>
        </div>
      </div>
      {data.urgency && (
        <div className="kv-card urgency-card">
          <div className="kv-key">Urgency</div>
          <div className="kv-value">{data.urgency}</div>
        </div>
      )}
      {data.bonuses?.length > 0 && (
        <>
          <h3 className="section-title gold-accent">Bonusse</h3>
          <div className="stack-sm">
            {data.bonuses.map((b, i) => (
              <div key={i} className="bonus-card">
                <strong>{b.name}</strong>
                <span className="bonus-value">Wert: {b.value}</span>
                <p>{b.description}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PainTab({ data }) {
  if (!data) return null;
  return (
    <div className="tab-content">
      <div className="kv-card core-pain-card">
        <div className="kv-key">Kern-Schmerz</div>
        <div className="kv-value">{data.core_pain}</div>
      </div>

      <div className="two-col">
        <div>
          <h3 className="section-title">Oberflächen-Schmerzen</h3>
          {data.surface_pains?.map((p, i) => (
            <div key={i} className="pill-card">{p}</div>
          ))}
        </div>
        <div>
          <h3 className="section-title red-accent">Verborgene Schmerzen</h3>
          {data.hidden_pains?.map((p, i) => (
            <div key={i} className="pill-card pill-bad">{p}</div>
          ))}
        </div>
      </div>

      <h3 className="section-title green-accent">Gewünschte Ergebnisse</h3>
      <div className="stack-sm">
        {data.desired_outcomes?.map((o, i) => (
          <div key={i} className="pill-card pill-good">{o}</div>
        ))}
      </div>

      <h3 className="section-title gold-accent">Einwände & Reframes</h3>
      <div className="stack-sm">
        {data.objections?.map((o, i) => (
          <div key={i} className="objection-card">
            <div className="objection-q">"{o.objection}"</div>
            <div className="objection-a">→ {o.reframe}</div>
          </div>
        ))}
      </div>

      {data.emotional_triggers?.length > 0 && (
        <>
          <h3 className="section-title">Emotionale Trigger</h3>
          <div className="chip-row">
            {data.emotional_triggers.map((t, i) => (
              <span key={i} className="chip">{t}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function HooksTab({ data }) {
  if (!Array.isArray(data)) return null;
  const grouped = {};
  data.forEach((h) => {
    const key = h.platform || "Universal";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(h);
  });

  return (
    <div className="tab-content">
      {Object.entries(grouped).map(([platform, hooks]) => (
        <div key={platform}>
          <h3 className="section-title">{platform}</h3>
          <div className="stack-sm">
            {hooks.map((h, i) => (
              <div key={i} className="hook-card">
                <div className="hook-text">"{h.hook}"</div>
                <div className="hook-meta">
                  <span className="chip chip-sm">{h.type?.replace(/_/g, " ")}</span>
                  <span className="muted">{h.angle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ScriptsTab({ data }) {
  if (!data) return null;
  return (
    <div className="tab-content">
      <h3 className="section-title">Ad Scripts</h3>
      <div className="stack-md">
        {data.ads?.map((ad, i) => (
          <div key={i} className="script-card">
            <div className="script-head">
              <span className="chip">{ad.platform}</span>
              <span className="chip chip-outline">{ad.format}</span>
            </div>
            <div className="script-section">
              <strong>Hook:</strong>
              <p>{ad.hook}</p>
            </div>
            <div className="script-section">
              <strong>Body:</strong>
              <p className="script-body">{ad.body}</p>
            </div>
            <div className="script-section">
              <strong>CTA:</strong>
              <p className="cta-text">{ad.cta}</p>
            </div>
          </div>
        ))}
      </div>

      <h3 className="section-title">E-Mail Scripts</h3>
      <div className="stack-md">
        {data.emails?.map((em, i) => (
          <div key={i} className="script-card">
            <div className="script-head">
              <span className="chip">{em.purpose}</span>
            </div>
            <div className="script-section">
              <strong>Betreff:</strong> {em.subject}
            </div>
            {em.preview && (
              <div className="script-section muted">
                Preview: {em.preview}
              </div>
            )}
            <div className="script-section">
              <p className="script-body">{em.body}</p>
            </div>
          </div>
        ))}
      </div>

      {data.landing_page && (
        <>
          <h3 className="section-title">Landing Page</h3>
          <div className="script-card">
            <h4 className="offer-headline">{data.landing_page.hero_headline}</h4>
            <p className="offer-sub">{data.landing_page.hero_subheadline}</p>
            <div className="stack-sm" style={{ marginTop: 12 }}>
              {data.landing_page.sections?.map((s, i) => (
                <div key={i} className="kv-card">
                  <div className="kv-key">{s.type}</div>
                  <div className="kv-value">{s.content}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FunnelTab({ data }) {
  if (!data) return null;
  return (
    <div className="tab-content">
      {data.strategy && (
        <div className="kv-card">
          <div className="kv-key">Strategie</div>
          <div className="kv-value">{data.strategy}</div>
        </div>
      )}

      <h3 className="section-title">Funnel Steps</h3>
      <div className="funnel-steps">
        {data.steps?.map((s, i) => (
          <div key={i} className="funnel-step">
            <div className="funnel-step-num">{i + 1}</div>
            <div className="funnel-step-body">
              <strong>{s.name}</strong>
              <p>{s.description}</p>
              <div className="funnel-meta">
                <span className="chip chip-sm">Ziel: {s.conversion_goal}</span>
                <span className="chip chip-sm chip-outline">{s.content_type}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="section-title gold-accent">KPIs</h3>
      <div className="kpi-grid">
        {data.kpis?.map((k, i) => (
          <div key={i} className="kpi-card">
            <div className="kpi-metric">{k.metric}</div>
            <div className="kpi-target">{k.target}</div>
            <div className="kpi-why">{k.why}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpecTab({ data }) {
  if (!data) return null;
  const avatar = data.avatar || {};

  return (
    <div className="tab-content">
      <div className="avatar-card">
        <div className="avatar-head">
          <div className="avatar-icon">👤</div>
          <div>
            <strong>{avatar.name}</strong>
            <span className="muted"> · {avatar.age} · {avatar.role}</span>
          </div>
        </div>
        <div className="two-col" style={{ marginTop: 12 }}>
          <div>
            <div className="kv-key">Frustrationen</div>
            {avatar.frustrations?.map((f, i) => (
              <div key={i} className="pill-card pill-bad">{f}</div>
            ))}
          </div>
          <div>
            <div className="kv-key">Ziele</div>
            {avatar.goals?.map((g, i) => (
              <div key={i} className="pill-card pill-good">{g}</div>
            ))}
          </div>
        </div>
        {avatar.media_habits?.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div className="kv-key">Mediennutzung</div>
            <div className="chip-row">
              {avatar.media_habits.map((m, i) => (
                <span key={i} className="chip">{m}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="two-col">
        <div className="kv-card">
          <div className="kv-key">Mechanismus / USP</div>
          <div className="kv-value">{data.mechanism}</div>
        </div>
        <div className="kv-card">
          <div className="kv-key">Positionierung</div>
          <div className="kv-value">{data.positioning}</div>
        </div>
      </div>

      <div className="kv-card">
        <div className="kv-key">Tonalität</div>
        <div className="kv-value">{data.tone}</div>
      </div>

      {data.brand_voice?.length > 0 && (
        <div className="chip-row" style={{ marginTop: 12 }}>
          {data.brand_voice.map((v, i) => (
            <span key={i} className="chip chip-gold">{v}</span>
          ))}
        </div>
      )}

      <h3 className="section-title">Kanäle</h3>
      <div className="stack-sm">
        {data.channels?.map((c, i) => (
          <div key={i} className="channel-card">
            <div className="channel-head">
              <strong>{c.channel}</strong>
              <span className={`priority-badge priority-${c.priority}`}>{c.priority}</span>
            </div>
            <p className="muted">{c.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const TAB_RENDERERS = {
  audit: AuditTab,
  offer: OfferTab,
  pain: PainTab,
  hooks: HooksTab,
  scripts: ScriptsTab,
  funnel: FunnelTab,
  spec: SpecTab,
};

/* ── Main App ── */

export default function App() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [aw, setAw] = useState(3);
  const [tab, setTab] = useState("audit");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ls, setLs] = useState(-1);
  const [pdfBusy, setPdfBusy] = useState(false);
  const timer = useRef(null);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.form) setForm({ ...EMPTY_FORM, ...parsed.form });
      if (parsed?.aw) setAw(parsed.aw);
      if (parsed?.result) setResult(parsed.result);
      if (parsed?.tab) setTab(parsed.tab);
    } catch {}
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, aw, result, tab }));
    } catch {}
  }, [form, aw, result, tab]);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const isValid = useMemo(
    () => form.un.trim() && form.pr.trim() && form.zg.trim() && form.sm.trim(),
    [form]
  );

  const currentAwareness = useMemo(
    () => AWARENESS.find((x) => x.id === aw) || AWARENESS[2],
    [aw]
  );

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const analyse = useCallback(async () => {
    if (!isValid) {
      setError("Bitte fülle Unternehmensname, Produkt, Zielgruppe und Schmerzen aus.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setLs(0);

    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setLs((i) => Math.min(i + 1, STEPS.length - 1));
    }, 1200);

    const prompt = `
Unternehmen: ${form.un}
Produkt/Dienstleistung: ${form.pr}
Preis: ${form.px || "nicht angegeben"}
Branche: ${form.br || "nicht angegeben"}
Zielgruppe: ${form.zg}
Schmerzen/Probleme: ${form.sm}
Website: ${form.url || "keine"}
Bisherige Werbung/Marketing: ${form.bw || "keine Angabe"}
Awareness-Level: ${currentAwareness.id} – ${currentAwareness.label} (${currentAwareness.desc})

Erstelle die vollständige SCALE-ENGINE-Analyse für dieses Unternehmen.
Passe alle Inhalte spezifisch auf dieses Business an – keine generischen Floskeln.
`;

    try {
      // Optional: research data (website scan + web search)
      let researchData = null;
      if (form.url?.trim() || form.br?.trim()) {
        try {
          const rr = await fetch("/api/research", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: form.url?.trim(), industry: form.br?.trim(), product: form.pr?.trim() }),
          });
          const rd = await rr.json();
          if (rd.ok) researchData = rd.data;
        } catch { /* research is optional — continue without */ }
      }

      const callApi = async (part) => {
        const r = await fetch("/api/analyse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, awarenessLevel: aw, researchData, part }),
        });
        if (r.status === 504) throw new Error("Analyse-Timeout. Bitte versuche es nochmal.");
        let d;
        try { d = await r.json(); } catch { throw new Error(`Server-Fehler (${r.status}). Bitte versuche es nochmal.`); }
        if (!r.ok) throw new Error(d?.error || `API Fehler ${r.status}`);
        if (!d?.result) throw new Error(`Teil "${part}" lieferte kein Ergebnis.`);
        return d.result;
      };

      // Run both parts in parallel — each completes within 60s
      const [analysis, creative] = await Promise.all([
        callApi("analysis"),
        callApi("creative"),
      ]);

      // Merge both parts into one result
      const merged = { ...analysis, ...creative };

      setResult(merged);
      setTab("audit");
      setLs(STEPS.length - 1);
    } catch (e) {
      setError(e?.message || "Unbekannter Fehler");
    } finally {
      if (timer.current) clearInterval(timer.current);
      setLoading(false);
    }
  }, [form, currentAwareness, isValid, aw]);

  const resetAll = () => {
    if (!confirm("Wirklich alle Eingaben und Ergebnisse zurücksetzen?")) return;
    setForm(EMPTY_FORM);
    setAw(3);
    setTab("audit");
    setResult(null);
    setError("");
    localStorage.removeItem(STORAGE_KEY);
  };

  const TabRenderer = TAB_RENDERERS[tab];
  const tabData = tab === "hooks" ? result?.hooks : result?.[tab];

  return (
    <div className="app-shell">
      <div className="page">
        <header className="hero">
          <div>
            <div className="eyebrow">Marketing AI Tool</div>
            <h1>SCALE ENGINE</h1>
            <p className="hero-text">
              Full-Funnel Analyse: Audit, Offer, Pain, Hooks, Scripts, Funnel & Spec.
            </p>
          </div>
          <div className="hero-actions">
            {result && (
              <button
                type="button"
                className="btn btn-ghost"
                disabled={pdfBusy}
                onClick={async () => {
                  setPdfBusy(true);
                  try { await exportPdf(result, form, aw); } finally { setPdfBusy(false); }
                }}
              >
                {pdfBusy ? "PDF…" : "PDF herunterladen"}
              </button>
            )}
            <CopyBtn
              text={result ? JSON.stringify(result, null, 2) : ""}
              label="JSON kopieren"
            />
            <button type="button" className="btn btn-danger" onClick={resetAll}>
              Reset
            </button>
          </div>
        </header>

        <section className="grid">
          {/* ── LEFT: Input ── */}
          <div className="panel">
            <div className="panel-head">
              <h2>Input</h2>
              <div className="muted">* = Pflichtfeld</div>
            </div>

            <div className="form-grid">
              <label className="field">
                <span>Unternehmen *</span>
                <input value={form.un} onChange={(e) => update("un", e.target.value)} placeholder="z.B. Lovemorial" />
              </label>
              <label className="field">
                <span>Produkt *</span>
                <input value={form.pr} onChange={(e) => update("pr", e.target.value)} placeholder="z.B. personalisierter Schmuck" />
              </label>
              <label className="field">
                <span>Preis</span>
                <input value={form.px} onChange={(e) => update("px", e.target.value)} placeholder="z.B. 89 €" />
              </label>
              <label className="field">
                <span>Branche</span>
                <input value={form.br} onChange={(e) => update("br", e.target.value)} placeholder="z.B. E-Commerce" />
              </label>
              <label className="field field-full">
                <span>Zielgruppe *</span>
                <textarea rows="3" value={form.zg} onChange={(e) => update("zg", e.target.value)} placeholder="Wer soll kaufen? Alter, Geschlecht, Interessen..." />
              </label>
              <label className="field field-full">
                <span>Schmerzen / Probleme *</span>
                <textarea rows="4" value={form.sm} onChange={(e) => update("sm", e.target.value)} placeholder="Welches Problem will die Zielgruppe lösen?" />
              </label>
              <label className="field field-full">
                <span>URL</span>
                <input value={form.url} onChange={(e) => update("url", e.target.value)} placeholder="https://..." />
              </label>
              <label className="field field-full">
                <span>Bisherige Werbung</span>
                <textarea rows="3" value={form.bw} onChange={(e) => update("bw", e.target.value)} placeholder="Welche Ads / Hooks / Claims wurden bisher genutzt?" />
              </label>
            </div>

            <div className="awareness-box">
              <div className="awareness-head">
                <strong>Awareness Level</strong>
                <span className="awareness-tag" style={{ borderColor: currentAwareness.color, color: currentAwareness.color }}>
                  {currentAwareness.id}/5 – {currentAwareness.label}
                </span>
              </div>
              <input type="range" min="1" max="5" step="1" value={aw} onChange={(e) => setAw(Number(e.target.value))} />
              <div className="awareness-desc">{currentAwareness.desc}</div>
            </div>

            <div className="action-row">
              <button type="button" className="btn btn-primary" disabled={!isValid || loading} onClick={analyse}>
                {loading ? "Analysiere..." : "Analyse starten"}
              </button>
            </div>

            {loading && (
              <div className="steps">
                {STEPS.map((step, idx) => (
                  <div key={step} className={`step-pill ${idx <= ls ? "step-pill-active" : ""}`}>
                    {idx <= ls && <span className="step-check">✓</span>}
                    {step}
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="error-box">
                <strong>Fehler:</strong> {error}
              </div>
            )}
          </div>

          {/* ── RIGHT: Results ── */}
          <div className="panel">
            <div className="panel-head">
              <h2>Ergebnis</h2>
              {result?.audit?.score !== undefined && (
                <div className={`score-badge score-badge-${Number(result.audit.score) >= 80 ? "good" : Number(result.audit.score) >= 60 ? "mid" : "bad"}`}>
                  Score: {result.audit.score}
                </div>
              )}
            </div>

            {!result ? (
              <div className="empty-state">
                {loading ? (
                  <div className="loading-state">
                    <div className="spinner" />
                    <p>Analyse wird generiert...</p>
                    <p className="muted">Das dauert ca. 15–30 Sekunden</p>
                  </div>
                ) : (
                  <>
                    <p>Starte links eine Analyse.</p>
                    <p className="muted">
                      Danach erscheinen hier Audit, Offer, Pain, Hooks, Scripts, Funnel & Spec.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="tabs">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`tab ${tab === t.id ? "tab-active" : ""}`}
                      onClick={() => setTab(t.id)}
                    >
                      <span className="tab-icon">{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="tab-toolbar">
                  <div className="muted">
                    {TABS.find((t) => t.id === tab)?.icon}{" "}
                    <strong>{prettyLabel(tab)}</strong>
                  </div>
                  <CopyBtn text={JSON.stringify(tabData ?? {}, null, 2)} label="Tab kopieren" />
                </div>

                <div className="result-box">
                  {TabRenderer && <TabRenderer data={tabData} />}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
