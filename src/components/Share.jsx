import { useEffect } from "react";

const NETWORKS = [
  {
    id: "linkedin",
    label: "Share on LinkedIn",
    href: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: "x",
    label: "Share on X",
    href: (url, title) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    id: "facebook",
    label: "Share on Facebook",
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "whatsapp",
    label: "Share on WhatsApp",
    href: (url, title, text) =>
      `https://wa.me/?text=${encodeURIComponent(`${title}\n${text}\n${url}`)}`,
  },
];

function pageUrl() {
  return window.location.href.split("#")[0];
}

function setMeta(selector, attr, key, content) {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

export function useShareMeta({ title, description }) {
  useEffect(() => {
    const url = pageUrl();
    const image = `${window.location.origin}${import.meta.env.BASE_URL}share-card.png`;
    document.title = title;
    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:url"]', "property", "og:url", url);
    setMeta('meta[property="og:image"]', "property", "og:image", image);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", image);
  }, [title, description]);
}

export function ShareBar({ title, text }) {
  const url = pageUrl();
  return (
    <div className="share">
      <span>Share</span>
      {NETWORKS.map((network) => (
        <a
          key={network.id}
          className={`share-link share-${network.id}`}
          href={network.href(url, title, text)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={network.label}
        >
          <ShareIcon id={network.id} />
          <span>{network.id === "x" ? "X" : network.label.replace("Share on ", "")}</span>
        </a>
      ))}
    </div>
  );
}

function ShareIcon({ id }) {
  if (id === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4.7 3.3A2.2 2.2 0 1 0 4.7 7.7 2.2 2.2 0 0 0 4.7 3.3zM3 9h3.4v12H3zM10 9h3.3v1.6h.1c.5-.9 1.6-1.8 3.3-1.8 3.5 0 4.2 2.3 4.2 5.3V21H17.5v-5.3c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21H10z" />
      </svg>
    );
  }
  if (id === "x") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.7 10.4 21.4 3h-1.6l-5.8 6.4L9.2 3H3.2l7 9.9L3.2 21h1.6l6.1-6.8L14.8 21h6zM11.6 13.2l-.7-1L5.4 4.2h2.4l4.5 6.3.7 1 5.9 8.3h-2.4z" />
      </svg>
    );
  }
  if (id === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.5 21v-7h2.4l.4-2.8h-2.8V9.4c0-.8.2-1.4 1.4-1.4H17.4V5.5c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v2.2H9.2V14h2.6v7z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.1 3.2A8.7 8.7 0 0 0 4.6 16.3L3.4 20.8l4.6-1.2a8.7 8.7 0 0 0 4.1 1 8.7 8.7 0 0 0 0-17.4zm0 15.9a7.2 7.2 0 0 1-3.7-1l-.3-.2-2.7.7.7-2.6-.2-.3a7.2 7.2 0 1 1 6.2 3.4zm4-5.4c-.2-.1-1.3-.6-1.5-.7s-.3-.1-.5.1-.6.7-.7.8-.3.2-.5.1a5.9 5.9 0 0 1-1.7-1.1 6.5 6.5 0 0 1-1.2-1.5c-.1-.2 0-.3.1-.5l.3-.4.2-.3a.4.4 0 0 0 0-.4c0-.1-.5-1.2-.7-1.6s-.3-.4-.5-.4h-.4a.8.8 0 0 0-.6.3 2.4 2.4 0 0 0-.8 1.8 4.2 4.2 0 0 0 .9 2.2 9.6 9.6 0 0 0 3.6 3.2 12 12 0 0 0 1.2.4 2.9 2.9 0 0 0 1.3.1 2.2 2.2 0 0 0 1.4-1 1.8 1.8 0 0 0 .1-1c-.1-.1-.2-.2-.4-.3z" />
    </svg>
  );
}
