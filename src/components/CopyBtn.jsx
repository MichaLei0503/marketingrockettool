import { useState } from "react";

export default function CopyBtn({ text = "", label = "Copy", className = "" }) {
  const [done, setDone] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(String(text || ""));
      setDone(true);
      setTimeout(() => setDone(false), 1400);
    } catch {
      alert("Kopieren fehlgeschlagen.");
    }
  }

  return (
    <button type="button" className={`btn btn-ghost ${className}`} onClick={onCopy}>
      {done ? "✓ Kopiert" : label}
    </button>
  );
}
