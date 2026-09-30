import { createContext, useContext, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import series from "../data/series.json";
import { episodeLabel } from "../lib/text";

const ProgressContext = createContext(() => {});

export function useReadingProgress() {
  return useContext(ProgressContext);
}

function ChapterMenu() {
  const menu = useRef(null);
  const close = () => {
    if (menu.current) menu.current.open = false;
  };
  return (
    <details className="menu" ref={menu}>
      <summary>Chapters</summary>
      <div className="menu-panel">
        {series.chapters.map((chapter) => (
          <NavLink key={chapter.slug} to={`/read/${chapter.slug}`} onClick={close}>
            <span>{episodeLabel(chapter.episode)}</span>
            {chapter.title}
          </NavLink>
        ))}
      </div>
    </details>
  );
}

export function Shell({ children }) {
  const [bar, setBar] = useState({ value: 0, color: "#1c1917" });
  return (
    <ProgressContext.Provider value={setBar}>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">
            <span className="brand-mark" aria-hidden="true">
              W
            </span>
            <span>
              <strong>What AI changed</strong>
              <small>Microservice architecture</small>
            </span>
          </Link>
          <nav className="top-nav" aria-label="Series">
            <Link to="/read/the-map">The map</Link>
            <Link to="/read/what-ai-changed">The finding</Link>
            <ChapterMenu />
          </nav>
        </div>
        <div
          className="progress"
          style={{ transform: `scaleX(${bar.value})`, background: bar.color }}
        />
      </header>
      <main id="content">{children}</main>
      <footer className="site-footer">
        <div className="wrap footer-inner">
          <p>
            <strong>What AI changed</strong> is a research series on microservice architecture.
            Each episode has a video and a Word document you can download.
          </p>
          <p>
            {series.credit} Reading edition, {series.date}.
          </p>
        </div>
      </footer>
    </ProgressContext.Provider>
  );
}
