import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CopyBtn from "./components/CopyBtn";
import { AWARENESS, EMPTY_FORM, STEPS, STORAGE_KEY, TABS } from "./constants";

async function exportReport(result, form, aw) {
  const { generateReport } = await import("./utils/generateReport");
  generateReport(result, form, aw);
}

/* ── helpers ── */

function prettyLabel(key = "") {
  return String(key).replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

/* ── Tab-specific renderers ── */

function SummaryTab({ data }) {
  if (!data) return null;
  return (
    <div className="tab-content">
      <div className="summary-hero">
        <h2 className="summary-title">Executive Summary</h2>
        <p className="summary-text">{data.executive_summary}</p>
      </div>

      {data.key_insight && (
        <div className="kv-card" style={{ borderLeft: "3px solid var(--gold)" }}>
          <div className="kv-key">Wichtigste Erkenntnis</div>
          <div className="kv-value">{data.key_insight}</div>
        </div>
      )}

      {data.target_audience_insight && (
        <div className="kv-card" style={{ borderLeft: "3px solid var(--blue, #5ea8d6)" }}>
          <div className="kv-key">Zielgruppen-Insight (aus Community-Recherche)</div>
          <div className="kv-value">{data.target_audience_insight}</div>
        </div>
      )}

      {data.biggest_opportunity && (
        <div className="kv-card" style={{ borderLeft: "3px solid var(--green, #1fbf75)" }}>
          <div className="kv-key">Groesste Chance</div>
          <div className="kv-value">{data.biggest_opportunity}</div>
        </div>
      )}

      {data.immediate_actions?.length > 0 && (
        <>
          <h3 className="section-title gold-accent">Sofort umsetzen</h3>
          <div className="stack-sm">
            {data.immediate_actions.map((a, i) => (
              <div key={i} className="funnel-step">
                <div className="funnel-step-num">{i + 1}</div>
                <div className="funnel-step-body">
                  <p>{a}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {data.expected_impact && (
        <div className="kv-card urgency-card">
          <div className="kv-key">Erwarteter Impact</div>
          <div className="kv-value">{data.expected_impact}</div>
        </div>
      )}
    </div>
  );
}

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

function CreativesTab({ data }) {
  if (!data) return null;
  return (
    <div className="tab-content">
      {data.angles?.length > 0 && (
        <>
          <h3 className="section-title gold-accent">Winning Angles</h3>
          <div className="stack-md">
            {data.angles.map((a, i) => (
              <div key={i} className="script-card">
                <div className="script-head">
                  <span className="chip chip-gold">{a.name}</span>
                  {a.awareness_level && <span className="chip chip-sm chip-outline">{a.awareness_level}</span>}
                </div>
                <div className="script-section">
                  <strong>Big Idea:</strong>
                  <p>{a.big_idea}</p>
                </div>
                <div className="script-section">
                  <strong>Hook:</strong>
                  <p className="hook-text">"{a.hook}"</p>
                </div>
                <div className="script-section">
                  <strong>Body:</strong>
                  <p className="script-body">{a.body}</p>
                </div>
                {a.proof && (
                  <div className="script-section">
                    <strong>Proof:</strong>
                    <p>{a.proof}</p>
                  </div>
                )}
                <div className="script-section">
                  <strong>CTA:</strong>
                  <p className="cta-text">{a.cta}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {data.ad_concepts?.length > 0 && (
        <>
          <h3 className="section-title">Ad-Konzepte</h3>
          <div className="stack-md">
            {data.ad_concepts.map((c, i) => (
              <div key={i} className="script-card">
                <div className="script-head">
                  <span className="chip">{c.type?.replace(/_/g, " ")}</span>
                  <span className="chip chip-outline">{c.format}</span>
                </div>
                <div className="script-section">
                  <strong>Script:</strong>
                  <p className="script-body">{c.script}</p>
                </div>
                {c.visual_direction && (
                  <div className="script-section">
                    <strong>Visual:</strong>
                    <p>{c.visual_direction}</p>
                  </div>
                )}
                {c.ideal_creator && (
                  <div className="script-section muted">
                    Ideal Creator: {c.ideal_creator}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {data.ugc_briefings?.length > 0 && (
        <>
          <h3 className="section-title">UGC-Briefings (ready-to-shoot)</h3>
          <div className="stack-md">
            {data.ugc_briefings.map((b, i) => (
              <div key={i} className="script-card">
                <div className="script-head">
                  <span className="chip chip-gold">Szene {i + 1}</span>
                  {b.duration && <span className="chip chip-sm chip-outline">{b.duration}</span>}
                </div>
                <div className="script-section">
                  <strong>Szenario:</strong>
                  <p>{b.scenario}</p>
                </div>
                <div className="script-section">
                  <strong>Opening Line:</strong>
                  <p className="hook-text">"{b.opening_line}"</p>
                </div>
                {b.key_points?.length > 0 && (
                  <div className="script-section">
                    <strong>Key Points:</strong>
                    <ul>
                      {b.key_points.map((k, j) => <li key={j}>{k}</li>)}
                    </ul>
                  </div>
                )}
                <div className="script-section">
                  <strong>CTA:</strong>
                  <p className="cta-text">{b.cta}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {data.iteration_plan && (
        <>
          <h3 className="section-title">Iterations-Plan (Andromeda)</h3>
          <div className="stack-sm">
            {data.iteration_plan.audience_variations?.length > 0 && (
              <div className="kv-card">
                <div className="kv-key">Audience-Varianten</div>
                <ul>
                  {data.iteration_plan.audience_variations.map((v, i) => <li key={i}>{v}</li>)}
                </ul>
              </div>
            )}
            {data.iteration_plan.angle_variations?.length > 0 && (
              <div className="kv-card">
                <div className="kv-key">Angle-Varianten</div>
                <ul>
                  {data.iteration_plan.angle_variations.map((v, i) => <li key={i}>{v}</li>)}
                </ul>
              </div>
            )}
            {data.iteration_plan.format_variations?.length > 0 && (
              <div className="kv-card">
                <div className="kv-key">Format-Varianten</div>
                <ul>
                  {data.iteration_plan.format_variations.map((v, i) => <li key={i}>{v}</li>)}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function MetaCampaignTab({ data }) {
  if (!data) return null;
  return (
    <div className="tab-content">
      {data.architecture && (
        <div className="kv-card" style={{ borderLeft: "3px solid var(--gold)" }}>
          <div className="kv-key">Kampagnen-Architektur</div>
          <div className="kv-value">{data.architecture}</div>
        </div>
      )}

      {data.testing_campaign && (
        <>
          <h3 className="section-title">1. Testing Campaign (ABO)</h3>
          <div className="script-card">
            <div className="kv"><span className="kv-k">Name</span><span className="kv-v">{data.testing_campaign.name}</span></div>
            <div className="kv"><span className="kv-k">Budget-Formel</span><span className="kv-v">{data.testing_campaign.budget_formula}</span></div>
            <div className="kv"><span className="kv-k">Budget-Beispiel</span><span className="kv-v">{data.testing_campaign.budget_example}</span></div>
            <div className="kv"><span className="kv-k">Creative Batches</span><span className="kv-v">{data.testing_campaign.creative_batches}</span></div>
            <div className="kv"><span className="kv-k">Optimization</span><span className="kv-v">{data.testing_campaign.optimization}</span></div>
            <div className="kv"><span className="kv-k">Exclusions</span><span className="kv-v">{data.testing_campaign.exclusions}</span></div>
            <div className="kv"><span className="kv-k">Attribution</span><span className="kv-v">{data.testing_campaign.attribution}</span></div>
          </div>
        </>
      )}

      {data.scaling_campaign && (
        <>
          <h3 className="section-title">2. Scaling CBO</h3>
          <div className="script-card">
            <div className="kv"><span className="kv-k">Name</span><span className="kv-v">{data.scaling_campaign.name}</span></div>
            <div className="kv"><span className="kv-k">Budget</span><span className="kv-v">{data.scaling_campaign.budget}</span></div>
            <div className="kv"><span className="kv-k">Strategie</span><span className="kv-v">{data.scaling_campaign.strategy}</span></div>
            <div className="kv"><span className="kv-k">Wann Promote</span><span className="kv-v">{data.scaling_campaign.when_to_promote}</span></div>
          </div>
        </>
      )}

      {data.advantage_plus && (
        <>
          <h3 className="section-title">3. Advantage+ Sales (ASC+)</h3>
          <div className="script-card">
            <div className="kv"><span className="kv-k">Wann bereit</span><span className="kv-v">{data.advantage_plus.when_ready}</span></div>
            <div className="kv"><span className="kv-k">Creative-Mix</span><span className="kv-v">{data.advantage_plus.creative_mix}</span></div>
            <div className="kv"><span className="kv-k">Budget-Anteil</span><span className="kv-v">{data.advantage_plus.budget_share}</span></div>
          </div>
        </>
      )}

      {data.portfolio_split && (
        <>
          <h3 className="section-title">Portfolio-Split</h3>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-metric">Advantage+</div>
              <div className="kpi-target">{data.portfolio_split.advantage_plus}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-metric">Retargeting</div>
              <div className="kpi-target">{data.portfolio_split.retargeting}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-metric">Testing</div>
              <div className="kpi-target">{data.portfolio_split.testing}</div>
            </div>
          </div>
        </>
      )}

      {data.scaling_rules && (
        <>
          <h3 className="section-title gold-accent">Scaling Rules</h3>
          <div className="script-card">
            <div className="kv"><span className="kv-k">20% Rule</span><span className="kv-v">{data.scaling_rules.rule_20_percent}</span></div>
            <div className="kv"><span className="kv-k">72h Rule</span><span className="kv-v">{data.scaling_rules.72h_rule}</span></div>
            {data.scaling_rules.fatigue_signals?.length > 0 && (
              <div className="script-section">
                <strong>Fatigue-Signale:</strong>
                <ul>
                  {data.scaling_rules.fatigue_signals.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
          </div>
        </>
      )}

      {data.budget_recommendations && (
        <>
          <h3 className="section-title">Budget-Empfehlungen</h3>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-metric">Start täglich</div>
              <div className="kpi-target">{data.budget_recommendations.start_daily}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-metric">Monat 1 Ziel</div>
              <div className="kpi-target">{data.budget_recommendations.month_1_target}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-metric">Break-Even ROAS</div>
              <div className="kpi-target">{data.budget_recommendations.break_even_roas}</div>
            </div>
          </div>
        </>
      )}

      {data.naming_convention && (
        <>
          <h3 className="section-title">Naming Convention</h3>
          <div className="script-card">
            <div className="kv"><span className="kv-k">Campaign</span><span className="kv-v"><code>{data.naming_convention.campaign}</code></span></div>
            <div className="kv"><span className="kv-k">Adset</span><span className="kv-v"><code>{data.naming_convention.adset}</code></span></div>
            <div className="kv"><span className="kv-k">Ad</span><span className="kv-v"><code>{data.naming_convention.ad}</code></span></div>
          </div>
        </>
      )}
    </div>
  );
}

const TAB_RENDERERS = {
  summary: SummaryTab,
  audit: AuditTab,
  offer: OfferTab,
  pain: PainTab,
  hooks: HooksTab,
  creatives: CreativesTab,
  meta_campaign: MetaCampaignTab,
  scripts: ScriptsTab,
  funnel: FunnelTab,
  spec: SpecTab,
};

/* ── Main App ── */

export default function App() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [aw, setAw] = useState(3);
  const [tab, setTab] = useState("summary");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ls, setLs] = useState(-1);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [deepResearch, setDeepResearch] = useState(false);
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
      // Research data — depth depends on deepResearch flag
      let researchData = null;
      const shouldResearch = deepResearch || form.url?.trim();
      if (shouldResearch) {
        try {
          const rr = await fetch("/api/research", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: form.url?.trim(),
              industry: form.br?.trim(),
              product: form.pr?.trim(),
              targetAudience: form.zg?.trim(),
              painPoints: form.sm?.trim(),
              deepResearch,
            }),
          });
          const rd = await rr.json();
          if (rd.ok) researchData = rd.data;
        } catch { /* research is optional — continue without */ }
      }

      const callApi = async (part, attempt = 1) => {
        const r = await fetch("/api/analyse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, awarenessLevel: aw, researchData, part }),
        });
        if (r.status === 504) {
          if (attempt < 2) return callApi(part, attempt + 1);
          throw new Error("Analyse-Timeout. Bitte versuche es nochmal.");
        }
        let d;
        try { d = await r.json(); } catch {
          if (attempt < 2) return callApi(part, attempt + 1);
          throw new Error(`Server-Fehler (${r.status}). Bitte versuche es nochmal.`);
        }
        if (!r.ok) {
          if (attempt < 2) return callApi(part, attempt + 1);
          throw new Error(d?.error || `API Fehler ${r.status}`);
        }
        if (!d?.result) {
          if (attempt < 2) return callApi(part, attempt + 1);
          throw new Error(`Teil "${part}" lieferte kein Ergebnis.`);
        }
        return d.result;
      };

      // Run all 4 parts in parallel — each auto-retries once on failure
      const [p1, p2, p3, p4] = await Promise.all([
        callApi("part1"),
        callApi("part2"),
        callApi("part3"),
        callApi("part4"),
      ]);

      // Merge all parts into one result
      const merged = { ...p1, ...p2, ...p3, ...p4 };

      setResult(merged);
      setTab("summary");
      setLs(STEPS.length - 1);
    } catch (e) {
      setError(e?.message || "Unbekannter Fehler");
    } finally {
      if (timer.current) clearInterval(timer.current);
      setLoading(false);
    }
  }, [form, currentAwareness, isValid, aw, deepResearch]);

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
  const tabData =
    tab === "hooks" ? result?.hooks :
    tab === "summary" ? result?.summary :
    tab === "creatives" ? result?.creatives :
    tab === "meta_campaign" ? result?.meta_campaign :
    result?.[tab];

  return (
    <div className="app-shell">
      <div className="page">
        <header className="hero">
          <div>
            <div className="eyebrow">Marketing AI Tool</div>
            <h1>SCALE ENGINE</h1>
            <p className="hero-text">
              Full-Stack Marketing-Blueprint: Meta-Kampagne, Creatives & Angles, Offer-Stack, Funnel & Scripts.
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
                  try { await exportReport(result, form, aw); } finally { setPdfBusy(false); }
                }}
              >
                {pdfBusy ? "Wird erstellt…" : "Report herunterladen"}
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

            <div className="awareness-box" style={{ marginTop: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={deepResearch}
                  onChange={(e) => setDeepResearch(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: "pointer" }}
                />
                <div>
                  <div><strong>Deep Research aktivieren</strong></div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                    Reddit-Foren + YouTube-Kommentare + Web-Suche + Wettbewerber-Ads (+30-60s Analyse-Zeit)
                  </div>
                </div>
              </label>
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
