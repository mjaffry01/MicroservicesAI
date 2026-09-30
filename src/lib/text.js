export function plain(runs = []) {
  return runs.map((run) => run.t).join("");
}

export function publicUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  const base = import.meta.env.BASE_URL || "/";
  const clean = path.startsWith("/") ? path.slice(1) : path;
  return `${base}${clean}`;
}

export function episodeLabel(episode) {
  return String(episode).padStart(2, "0");
}

const loaders = import.meta.glob("../content/*.json");

export function loadChapter(slug) {
  const load = loaders[`../content/${slug}.json`];
  if (!load) return Promise.resolve(null);
  return load().then((mod) => mod.default);
}

export function groupSections(blocks) {
  const lead = [];
  const sections = [];
  let current = null;
  for (const block of blocks) {
    if (block.type === "heading" && block.level === 2) {
      current = { heading: block, blocks: [] };
      sections.push(current);
    } else if (current) {
      current.blocks.push(block);
    } else {
      lead.push(block);
    }
  }
  return { lead, sections };
}

export function splitSubsections(blocks) {
  const intro = [];
  const cards = [];
  let current = null;
  for (const block of blocks) {
    if (block.type === "heading" && block.level >= 3) {
      current = { heading: block, blocks: [] };
      cards.push(current);
    } else if (current) {
      current.blocks.push(block);
    } else {
      intro.push(block);
    }
  }
  return { intro, cards };
}

export function pullCallouts(blocks, variants) {
  const picked = {};
  const rest = [];
  for (const variant of variants) picked[variant] = null;
  for (const block of blocks) {
    if (
      block.type === "callout" &&
      variants.includes(block.variant) &&
      !picked[block.variant]
    ) {
      picked[block.variant] = block;
    } else {
      rest.push(block);
    }
  }
  return { picked, rest };
}

function normTerm(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’]s$/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function glossaryMap(blocks) {
  const map = new Map();
  for (const block of blocks) {
    if (block.type !== "glossary") continue;
    for (const item of block.items) {
      const term = item.term.trim();
      map.set(normTerm(term), { term, definition: item.definition });
    }
  }
  return map;
}

export function findTerm(glossary, raw) {
  if (!glossary || !raw) return null;
  const key = normTerm(raw);
  if (!key) return null;
  if (glossary.has(key)) return glossary.get(key);
  let best = null;
  for (const [termKey, value] of glossary) {
    if (termKey.length < 4) continue;
    const word = new RegExp(`(?:^| )${termKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?: |$)`);
    const hit = word.test(key) || (key.length >= 5 && termKey.startsWith(key));
    if (hit && (!best || termKey.length > best.term.length)) best = value;
  }
  return best;
}
