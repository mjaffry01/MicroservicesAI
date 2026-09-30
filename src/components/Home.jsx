import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import series from "../data/series.json";
import { PARTS, partById } from "../lib/parts";
import { episodeLabel } from "../lib/text";
import { Video } from "./Blocks";
import { ShareBar, useShareMeta } from "./Share";

export function Home() {
  const [query, setQuery] = useState("");
  const chapters = series.chapters;
  const map = chapters[0];
  const aim = chapters.find((chapter) => chapter.slug === "the-aim");

  useShareMeta({
    title: "How AI changed microservice architecture",
    description:
      aim?.sentence ||
      "A research series on how AI changed microservice architecture.",
  });

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return null;
    return chapters.filter((chapter) =>
      [chapter.title, chapter.sentence, chapter.plain, chapter.status]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [chapters, query]);

  return (
    <div className="wrap home">
      <section className="hero">
        <p className="eyebrow">Eighteen episodes · videos and the reading edition</p>
        <h1>How AI changed microservice architecture</h1>
        <p className="byline">{series.credit}</p>
        <p className="deck">{aim?.sentence}</p>
        <div className="hero-actions">
          <Link className="btn solid" to="/read/the-aim">
            Start with the question
          </Link>
          <Link className="btn ghost" to="/read/the-map">
            Open the map
          </Link>
        </div>
        <ShareBar
          title="How AI changed microservice architecture"
          text={aim?.sentence || "A research series on microservice architecture."}
        />
        <div className="spine-colors" aria-hidden="true">
          {PARTS.filter((part) => part.id !== "map").map((part) => (
            <span key={part.id} style={{ background: part.bg }} />
          ))}
        </div>
      </section>

      <section className="theater">
        <div>
          <p className="eyebrow">Episode 00 · {map.duration}</p>
          <h2>Watch the map, then read in order</h2>
          <p className="deck tight">{map.plain}</p>
        </div>
        <Video meta={{ ...map, presenter: series.presenter, credit: series.credit }} />
      </section>

      <section className="finder">
        <label>
          Find a chapter
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="History, saga, Kubernetes, tenants…"
            type="search"
          />
        </label>
      </section>

      {filtered ? (
        <section className="results">
          <h2>
            {filtered.length} {filtered.length === 1 ? "chapter" : "chapters"}
          </h2>
          <div className="chapter-grid">
            {filtered.map((chapter) => (
              <ChapterCard key={chapter.slug} chapter={chapter} />
            ))}
          </div>
        </section>
      ) : (
        PARTS.filter((part) => part.id !== "map").map((part) => {
          const items = chapters.filter((chapter) => chapter.part === part.id);
          return (
            <section key={part.id} className="part" style={{ "--part": part.bg, "--part-soft": part.soft }}>
              <header className="part-label">
                <span>{part.numeral}</span>
                <h2>{part.label}</h2>
                <p>{part.short}</p>
              </header>
              <div className="chapter-grid">
                {items.map((chapter) => (
                  <ChapterCard key={chapter.slug} chapter={chapter} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

function ChapterCard({ chapter }) {
  const part = partById(chapter.part);
  return (
    <Link
      className="chapter-card"
      to={`/read/${chapter.slug}`}
      style={{ "--part": part.bg, "--part-soft": part.soft }}
    >
      <span className="ep">Episode {episodeLabel(chapter.episode)}</span>
      <h3>
        <span aria-hidden="true">{chapter.mark}</span> {chapter.title}
      </h3>
      <p>{chapter.sentence}</p>
      <span className="card-meta">
        {chapter.duration} watch · {chapter.minutes} min read · Word
      </span>
    </Link>
  );
}
