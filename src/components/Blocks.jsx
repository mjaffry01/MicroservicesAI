import { useRef } from "react";
import { plain } from "../lib/text";
import { Prose, RichText } from "./RichText";

function ReadingKey() {
  return (
    <aside className="reading-key" aria-label="How to read this edition">
      <p>Hover a marked word</p>
      <ul>
        <li>
          <span className="swatch claim" />
          Yellow — the central idea
        </li>
        <li>
          <span className="swatch key" />
          Blue — an important sentence
        </li>
        <li>
          <span className="swatch term" />
          Plum — a term, with its meaning
        </li>
      </ul>
    </aside>
  );
}

function Takeaway({ block }) {
  const items = [];
  for (const runs of block.paragraphs) {
    const bits = plain(runs)
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
    for (const bit of bits) items.push(bit.replace(/^\d+\s*[.)]\s*/, ""));
  }
  return (
    <section className="takeaway">
      <h2>{block.title}</h2>
      <ol>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </section>
  );
}

function Callout({ block, glossary }) {
  if (block.variant === "read") return <ReadingKey />;
  if (block.variant === "takeaway") return <Takeaway block={block} />;
  return (
    <aside className={`callout callout-${block.variant}`}>
      <p className="callout-kicker">{block.title}</p>
      {block.paragraphs.map((runs, index) => (
        <p key={index}>
          <RichText runs={runs} glossary={glossary} />
        </p>
      ))}
    </aside>
  );
}

function Glossary({ block }) {
  return (
    <section className="glossary" id="words-to-know">
      <h2>{block.title}</h2>
      <dl>
        {block.items.map((item) => (
          <div key={item.term}>
            <dt>{item.term}</dt>
            <dd>{item.definition}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Figure({ block }) {
  const dialog = useRef(null);
  return (
    <figure className="plate">
      <button
        type="button"
        className="plate-button"
        onClick={() => dialog.current?.showModal()}
      >
        <img src={block.src} alt={block.alt || block.caption || ""} />
      </button>
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <dialog
        ref={dialog}
        className="lightbox"
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current.close();
        }}
      >
        <img src={block.src} alt="" />
      </dialog>
    </figure>
  );
}

function isYear(value) {
  return /^(c\.\s*)?(\d{4}|[A-Za-z]{3,9}\.?\s+\d{4}|\d{4}\s*[–—-]\s*\d{4})/.test(
    (value || "").trim(),
  );
}

function headerRow(rows) {
  const first = rows[0];
  if (!first || first.length < 2) return false;
  if (!first.every((cell) => cell && cell.length < 52 && !cell.includes("\n"))) return false;
  return first.some((cell) =>
    /^(pattern|characteristic|level|term|name|record|what|job|the job|how|when|layer|model|plane|requirement|area|process|part|chapter|year|event|date)/i.test(
      cell.trim(),
    ),
  );
}

function DataTable({ rows }) {
  if (!rows?.length) return null;
  const hasHeader = headerRow(rows);
  const headers = hasHeader ? rows[0] : null;
  const body = hasHeader ? rows.slice(1) : rows;
  const cols = Math.max(...rows.map((row) => row.length));
  const firstLengths = body.map((row) => (row[0] || "").length);
  const avgFirst =
    firstLengths.reduce((sum, length) => sum + length, 0) / Math.max(1, firstLengths.length);
  const yearHits = body.filter((row) => isYear(row[0])).length;

  if (body.length >= 3 && yearHits >= Math.max(3, body.length * 0.55)) {
    return (
      <ol className="timeline">
        {body.map((row, index) => (
          <li key={index}>
            <time>{row[0]}</time>
            <div>
              {row.slice(1).map((cell) => (
                <p key={cell}>{cell}</p>
              ))}
            </div>
          </li>
        ))}
      </ol>
    );
  }

  if (
    headers &&
    /^level$/i.test(headers[0]) &&
    body.length >= 2 &&
    body.length <= 6
  ) {
    return (
      <ol className="ladder">
        {body.map((row, index) => (
          <li key={row[0]}>
            <span>{index + 1}</span>
            <div>
              <h3>{row[0]}</h3>
              {row[1] && <p>{row[1]}</p>}
              {row[2] && <p className="when">{row[2]}</p>}
            </div>
          </li>
        ))}
      </ol>
    );
  }

  if (cols >= 2 && cols <= 4 && avgFirst > 0 && avgFirst < 64 && body.length >= 1) {
    return (
      <div className={cols === 2 ? "pairs" : "card-grid"}>
        {body.map((row, index) =>
          cols === 2 ? (
            <div className="pair" key={index}>
              <h3>{row[0]}</h3>
              <p>{row[1]}</p>
            </div>
          ) : (
            <article className="info-card" key={index}>
              <h3>{row[0]}</h3>
              {row[1] && <p>{row[1]}</p>}
              {row.slice(2).filter(Boolean).map((cell, cellIndex) =>
                cell.length <= 24 && !cell.includes("\n") ? (
                  <span className="pill" key={cellIndex}>
                    {cell}
                  </span>
                ) : (
                  <p className="extra" key={cellIndex}>
                    {cell}
                  </p>
                ),
              )}
            </article>
          ),
        )}
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        {headers && (
          <thead>
            <tr>
              {headers.map((cell) => (
                <th key={cell}>{cell}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {body.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Flow({ blocks, glossary, opening = false }) {
  let leadPending = opening;
  return blocks.map((block, index) => {
    if (block.type === "prose") {
      const lead = leadPending;
      leadPending = false;
      return <Prose key={index} runs={block.runs} glossary={glossary} lead={lead} />;
    }
    if (block.type === "heading") {
      const Tag = block.level <= 2 ? "h2" : "h3";
      return (
        <Tag key={index} id={block.id} className="flow-heading">
          {block.mark && <span className="mark-tile">{block.mark}</span>}
          {block.text}
        </Tag>
      );
    }
    if (block.type === "list") {
      return (
        <ul key={index} className="points">
          {block.items.map((runs, itemIndex) => (
            <li key={itemIndex}>
              <RichText runs={runs} glossary={glossary} />
            </li>
          ))}
        </ul>
      );
    }
    if (block.type === "source") {
      return (
        <p key={index} className="source">
          <RichText runs={block.runs} glossary={glossary} />
        </p>
      );
    }
    if (block.type === "callout") return <Callout key={index} block={block} glossary={glossary} />;
    if (block.type === "glossary") return <Glossary key={index} block={block} />;
    if (block.type === "figure") return <Figure key={index} block={block} />;
    if (block.type === "table") return <DataTable key={index} rows={block.rows} />;
    return null;
  });
}

export function Video({ meta }) {
  return (
    <figure className="player" id="episode">
      <video controls preload="metadata" playsInline>
        <source src={meta.video} type="video/mp4" />
        {meta.captions && (
          <track label="English" kind="captions" srcLang="en" src={meta.captions} default />
        )}
      </video>
      <figcaption>
        Episode {String(meta.episode).padStart(2, "0")}
        {meta.duration ? ` · ${meta.duration}` : ""}
        <span> · Spoken by {meta.presenter || "Mohammad Ali Jaffry"}</span>
      </figcaption>
    </figure>
  );
}
