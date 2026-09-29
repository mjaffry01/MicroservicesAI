import { findTerm, plain } from "../lib/text";
import { HoverMark } from "./Tips";

function Pieces({ text }) {
  const lines = text.split("\n");
  return lines.map((line, index) => (
    <span key={index}>
      {index > 0 && <br />}
      {line}
    </span>
  ));
}

const HOVERABLE = new Set(["claim", "key", "term"]);

function Marked({ run, glossary, children }) {
  if (!HOVERABLE.has(run.role)) {
    return <span className={`mark mark-${run.role}`}>{children}</span>;
  }
  const entry = run.role === "term" ? findTerm(glossary, run.t) : null;
  return (
    <HoverMark kind={run.role} term={entry?.term} definition={entry?.definition}>
      {children}
    </HoverMark>
  );
}

export function RichText({ runs = [], glossary }) {
  return runs.map((run, index) => {
    const body = <Pieces text={run.t} />;
    const marked = run.role ? (
      <Marked run={run} glossary={glossary}>
        {body}
      </Marked>
    ) : (
      body
    );
    if (run.href) {
      return (
        <a key={index} href={run.href} target="_blank" rel="noreferrer">
          {marked}
        </a>
      );
    }
    return <span key={index}>{marked}</span>;
  });
}

export function Prose({ runs, glossary, lead = false }) {
  const text = plain(runs).trim();
  if (!text) return null;
  const roles = runs.filter((run) => run.t.trim()).map((run) => run.role);
  const every = (role) => roles.length > 0 && roles.every((item) => item === role);
  const className = [
    "prose",
    lead ? "lead" : "",
    every("claim") ? "pull" : "",
    every("key") ? "keyline" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <p className={className}>
      <RichText runs={runs} glossary={glossary} />
    </p>
  );
}
