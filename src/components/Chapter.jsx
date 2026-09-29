import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import series from "../data/series.json";
import { partById } from "../lib/parts";
import {
  episodeLabel,
  glossaryMap,
  groupSections,
  loadChapter,
  pullCallouts,
  splitSubsections,
} from "../lib/text";
import { Flow, Video } from "./Blocks";
import { RichText } from "./RichText";
import { useReadingProgress } from "./Shell";

export function Chapter() {
  const { slug } = useParams();
  const meta = series.chapters.find((chapter) => chapter.slug === slug);
  const [body, setBody] = useState(null);
  const [active, setActive] = useState("");
  const setProgress = useReadingProgress();

  useEffect(() => {
    let live = true;
    setBody(null);
    if (!meta) return undefined;
    document.title = `${meta.title} · What AI changed`;
    loadChapter(slug).then((data) => {
      if (live) setBody(data);
    });
    return () => {
      live = false;
    };
  }, [slug, meta]);

  useEffect(() => {
    if (!body) return undefined;
    if (window.location.hash) {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
    return undefined;
  }, [body, slug]);

  useEffect(() => {
    const onScroll = () => {
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      setProgress({
        value: max > 0 ? root.scrollTop / max : 0,
        color: partById(meta?.part).bg,
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      setProgress({ value: 0, color: "#1c1917" });
    };
  }, [slug, body, meta, setProgress]);

  const grouped = useMemo(() => (body ? groupSections(body.blocks) : null), [body]);
  const glossary = useMemo(() => (body ? glossaryMap(body.blocks) : new Map()), [body]);

  useEffect(() => {
    if (!grouped) return undefined;
    const nodes = [...document.querySelectorAll(".chapter-section")];
    if (!nodes.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-18% 0px -62% 0px", threshold: [0.1, 0.25, 0.6] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [grouped, slug]);

  if (!meta) {
    return (
      <div className="wrap missing">
        <h1>That chapter is not in the series.</h1>
        <Link to="/">Back to the map</Link>
      </div>
    );
  }

  const part = partById(meta.part);
  const index = series.chapters.findIndex((chapter) => chapter.slug === slug);
  const previous = series.chapters[index - 1];
  const next = series.chapters[index + 1];
  const feature = grouped
    ? pullCallouts(grouped.lead, ["sentence", "plain"])
    : { picked: {}, rest: [] };

  return (
    <article className="chapter" style={{ "--part": part.bg, "--part-soft": part.soft }}>
      <div className="wrap reading">
        <header className="chapter-hero">
          <p className="eyebrow">
            {part.id === "map" ? "Front matter" : `Part ${part.numeral}`}
            <span> · {part.label}</span>
          </p>
          <p className="ep-kicker">Episode {episodeLabel(meta.episode)}</p>
          <h1>
            {meta.mark && <span aria-hidden="true">{meta.mark} </span>}
            {meta.title}
          </h1>
          <p className="status">
            {[meta.answer, meta.date, meta.status].filter(Boolean).join(" · ")}
          </p>
          <div className="hero-actions">
            <a className="btn solid" href={meta.docx} download={meta.docxName}>
              Download Word
            </a>
            <a className="btn ghost" href="#episode">
              Play the episode
            </a>
            <span className="quiet">
              {meta.duration} watch · {meta.minutes} min read · {meta.figures}{" "}
              {meta.figures === 1 ? "figure" : "figures"}
            </span>
          </div>
        </header>

        <Video meta={{ ...meta, presenter: series.presenter }} />

        {(feature.picked.sentence || feature.picked.plain) && (
          <div className="feature-pair">
            {feature.picked.sentence && (
              <blockquote className="sentence">
                <p className="callout-kicker">In one sentence</p>
                {feature.picked.sentence.paragraphs.map((runs, i) => (
                  <p key={i}>
                    <RichText runs={runs} glossary={glossary} />
                  </p>
                ))}
              </blockquote>
            )}
            {feature.picked.plain && (
              <aside className="plain-panel">
                <p className="callout-kicker">In plain words</p>
                {feature.picked.plain.paragraphs.map((runs, i) => (
                  <p key={i}>
                    <RichText runs={runs} glossary={glossary} />
                  </p>
                ))}
              </aside>
            )}
          </div>
        )}

        <div className="layout">
          <div className="sheet">
            {body ? (
              <>
                <Flow blocks={feature.rest} glossary={glossary} opening />
                {grouped.sections.map((section) => (
                  <Section key={section.heading.id} section={section} glossary={glossary} />
                ))}
              </>
            ) : (
              <p className="quiet">Opening the chapter…</p>
            )}

            <nav className="pager" aria-label="Chapters">
              {previous ? (
                <Link to={`/read/${previous.slug}`}>
                  <small>Previous</small>
                  {previous.title}
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link to={`/read/${next.slug}`}>
                  <small>Next</small>
                  {next.title}
                </Link>
              ) : (
                <span />
              )}
            </nav>
          </div>

          <aside className="rail">
            <details className="toc-mobile">
              <summary>On this page</summary>
              <Toc sections={grouped?.sections || []} active={active} />
            </details>
            <div className="toc-desktop">
              <p>On this page</p>
              <Toc sections={grouped?.sections || []} active={active} />
              <a className="doc-link" href={meta.docx} download={meta.docxName}>
                Download {meta.docxName}
              </a>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}

function Section({ section, glossary }) {
  const { intro, cards } = splitSubsections(section.blocks);
  return (
    <section className="chapter-section" id={section.heading.id}>
      <header className="section-head">
        {section.heading.mark && <span className="mark-tile">{section.heading.mark}</span>}
        <h2>{section.heading.text}</h2>
      </header>
      <Flow blocks={intro} glossary={glossary} />
      {cards.length >= 4 && (
        <nav className="chip-nav" aria-label={section.heading.text}>
          {cards.map((card) => (
            <a key={card.heading.id} href={`#${card.heading.id}`}>
              {card.heading.text}
            </a>
          ))}
        </nav>
      )}
      {cards.map((card) => (
        <article className="subcard" id={card.heading.id} key={card.heading.id}>
          <h3>
            {card.heading.mark && <span aria-hidden="true">{card.heading.mark} </span>}
            {card.heading.text}
          </h3>
          <Flow blocks={card.blocks} glossary={glossary} />
        </article>
      ))}
    </section>
  );
}

function Toc({ sections, active }) {
  if (!sections.length) return <p className="quiet">A short chapter.</p>;
  return (
    <ol>
      {sections.map((section) => (
        <li key={section.heading.id}>
          <a
            href={`#${section.heading.id}`}
            aria-current={active === section.heading.id ? "true" : undefined}
          >
            {section.heading.text}
          </a>
        </li>
      ))}
    </ol>
  );
}
