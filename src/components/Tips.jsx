import { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";

const TipContext = createContext(null);

export function TipProvider({ children }) {
  const [tip, setTip] = useState(null);

  useEffect(() => {
    const hide = () => setTip(null);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, []);

  return (
    <TipContext.Provider value={setTip}>
      {children}
      {tip && <ReaderTip tip={tip} />}
    </TipContext.Provider>
  );
}

function ReaderTip({ tip }) {
  const width = 320;
  const margin = 12;
  const center = Math.min(
    window.innerWidth - margin - width / 2,
    Math.max(margin + width / 2, tip.x),
  );
  const below = tip.y < 128;
  const top = below ? tip.bottom + 10 : tip.y - 10;
  return createPortal(
    <div
      className={`reader-tip ${below ? "below" : "above"}`}
      style={{ left: center, top, width }}
      role="tooltip"
    >
      <strong>{tip.label}</strong>
      {tip.body && <span>{tip.body}</span>}
    </div>,
    document.body,
  );
}

const COPY = {
  claim: {
    label: "Central idea",
    body: "The sentence this passage is built on.",
  },
  key: {
    label: "Important sentence",
    body: "Keep this when you set the chapter against what comes later.",
  },
  term: {
    label: "Term",
    body: "A technical word. Its meaning is in Words to know.",
  },
};

export function HoverMark({ kind, term, definition, children }) {
  const setTip = useContext(TipContext);
  if (!setTip || !kind) return <span className={kind ? `mark mark-${kind}` : undefined}>{children}</span>;

  const show = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const preset = COPY[kind] || COPY.term;
    setTip({
      x: rect.left + rect.width / 2,
      y: rect.top,
      bottom: rect.bottom,
      label: kind === "term" && term ? term : preset.label,
      body: kind === "term" && definition ? definition : preset.body,
    });
  };

  return (
    <span
      className={`mark mark-${kind} hoverable`}
      onMouseEnter={show}
      onMouseLeave={() => setTip(null)}
      onFocus={show}
      onBlur={() => setTip(null)}
    >
      {children}
    </span>
  );
}
