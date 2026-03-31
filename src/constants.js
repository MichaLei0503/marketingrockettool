export const STORAGE_KEY = "scale_engine_state_v2";

export const TABS = [
  { id: "summary", label: "Summary", icon: "📋" },
  { id: "audit", label: "Audit", icon: "📊" },
  { id: "offer", label: "Offer", icon: "🎯" },
  { id: "pain", label: "Pain", icon: "💔" },
  { id: "hooks", label: "Hooks", icon: "🪝" },
  { id: "scripts", label: "Scripts", icon: "📝" },
  { id: "funnel", label: "Funnel", icon: "🔄" },
  { id: "spec", label: "Spec", icon: "🧬" },
];

export const STEPS = [
  "Foren & Communities durchsuchen",
  "Zielgruppe analysieren",
  "Schmerzpunkte identifizieren",
  "Strategie generieren",
  "Zusammenfassung erstellen",
];

export const AWARENESS = [
  { id: 1, label: "Unaware", desc: "Kennt Problem und Lösung noch nicht.", color: "#d42b2b" },
  { id: 2, label: "Problem Aware", desc: "Spürt das Problem, kennt aber noch keine Lösung.", color: "#d9a11b" },
  { id: 3, label: "Solution Aware", desc: "Kennt Lösungsrichtung, aber nicht dein Produkt.", color: "#d6b25e" },
  { id: 4, label: "Product Aware", desc: "Kennt dein Produkt, braucht aber noch Überzeugung.", color: "#5ea8d6" },
  { id: 5, label: "Most Aware", desc: "Ist sehr nah vor Kauf, braucht nur finalen Trigger.", color: "#1fbf75" },
];

export const EMPTY_FORM = {
  un: "",
  pr: "",
  px: "",
  br: "",
  zg: "",
  sm: "",
  url: "",
  bw: "",
};
