"""Turn the reading-edition Word documents into page content for the site."""

from __future__ import annotations

import json
import os
import re
import zipfile
from pathlib import Path

from docx import Document
from docx.oxml.ns import qn

ROOT = Path(r"D:\Microservices AI Reseach")
EDITION = ROOT / "research-notes" / "reading-edition"
VIDEOS = ROOT / "research-notes" / "videos"
SITE = ROOT / "site"
CONTENT = SITE / "src" / "content"
PUBLIC = SITE / "public"
FIGURES = PUBLIC / "figures"
DOCS = PUBLIC / "docs"
VIDEO_OUT = PUBLIC / "videos"
CAPTIONS = PUBLIC / "captions"

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

CHAPTERS = [
    {
        "slug": "the-map",
        "episode": 0,
        "part": "map",
        "doc": "00-arrangement-of-the-research.docx",
        "video": "ep00-the-map-of-the-series.mp4",
    },
    {
        "slug": "the-aim",
        "episode": 1,
        "part": "I",
        "doc": "01-research-aim.docx",
        "video": "ep01-what-this-research-is-for.mp4",
    },
    {
        "slug": "types-of-software",
        "episode": 2,
        "part": "I",
        "doc": "11-types-of-software.docx",
        "video": "ep02-types-of-software.mp4",
    },
    {
        "slug": "history",
        "episode": 3,
        "part": "II",
        "doc": "02-history-of-microservices.docx",
        "video": "ep03-the-history-of-microservices.mp4",
    },
    {
        "slug": "architectures",
        "episode": 4,
        "part": "II",
        "doc": "03-architectures-and-design-patterns.docx",
        "video": "ep04-architectures-and-design-patterns-of-microservices.mp4",
    },
    {
        "slug": "the-catalog",
        "episode": 5,
        "part": "II",
        "doc": "04-design-patterns-by-category.docx",
        "video": "ep05-the-catalog-design-patterns-by-the-job-they-do.mp4",
    },
    {
        "slug": "popular-software",
        "episode": 6,
        "part": "II",
        "doc": "16-patterns-in-popular-software.docx",
        "video": "ep06-the-patterns-in-popular-software.mp4",
    },
    {
        "slug": "domain-driven-design",
        "episode": 7,
        "part": "III",
        "doc": "05-implementing-microservices-ddd.docx",
        "video": "ep07-implementing-microservices-with-domain-driven.mp4",
    },
    {
        "slug": "beside-domain-driven-design",
        "episode": 8,
        "part": "III",
        "doc": "06-methods-beside-ddd.docx",
        "video": "ep08-methods-that-sit-beside-domain-driven-design.mp4",
    },
    {
        "slug": "cloud",
        "episode": 9,
        "part": "IV",
        "doc": "07-microservices-and-cloud-architecture.docx",
        "video": "ep09-how-microservices-relate-to-cloud-architecture.mp4",
    },
    {
        "slug": "kubernetes",
        "episode": 10,
        "part": "IV",
        "doc": "08-kubernetes-and-microservices.docx",
        "video": "ep10-kubernetes-from-the-point-of-view-of-microservices.mp4",
    },
    {
        "slug": "paas",
        "episode": 11,
        "part": "IV",
        "doc": "10-paas-and-microservices.docx",
        "video": "ep11-paas-from-the-point-of-view-of-microservices.mp4",
    },
    {
        "slug": "saas",
        "episode": 12,
        "part": "IV",
        "doc": "09-saas-system-requirements.docx",
        "video": "ep12-requirements-of-a-saas-system.mp4",
    },
    {
        "slug": "beside-saas",
        "episode": 13,
        "part": "IV",
        "doc": "12-beside-saas.docx",
        "video": "ep13-what-sits-beside-saas-the-three-service-models.mp4",
    },
    {
        "slug": "requirements",
        "episode": 14,
        "part": "V",
        "doc": "13-functional-and-nonfunctional-requirements.docx",
        "video": "ep14-functional-and-non-functional-requirements.mp4",
    },
    {
        "slug": "software-engineering",
        "episode": 15,
        "part": "V",
        "doc": "15-software-engineering.docx",
        "video": "ep15-software-engineering-the-discipline.mp4",
    },
    {
        "slug": "ai-patterns",
        "episode": 16,
        "part": "VI",
        "doc": "14-design-patterns-of-the-ai-system.docx",
        "video": "ep16-design-patterns-of-the-ai-system.mp4",
    },
    {
        "slug": "what-ai-changed",
        "episode": 17,
        "part": "VII",
        "doc": "17-what-ai-changed.docx",
        "video": "ep17-what-ai-changed.mp4",
    },
]


def split_mark(text: str) -> tuple[str, str]:
    text = text.strip()
    for i, ch in enumerate(text):
        if ch.isalpha():
            return text[:i].strip(), text[i:].strip()
    return "", text


def slugify(text: str) -> str:
    _mark, title = split_mark(text)
    title = title.lower()
    title = title.replace("'", "").replace("’", "")
    title = re.sub(r"[^a-z0-9]+", "-", title).strip("-")
    return (title[:64] or "section")


def role_of(r_elm) -> str | None:
    r_pr = r_elm.find(f"{W}rPr")
    color = ""
    underline = ""
    highlight = ""
    bold = False
    italic = False
    if r_pr is not None:
        b = r_pr.find(f"{W}b")
        if b is not None and (b.get(qn("w:val")) or "true") not in {"0", "false"}:
            bold = True
        i = r_pr.find(f"{W}i")
        if i is not None and (i.get(qn("w:val")) or "true") not in {"0", "false"}:
            italic = True
        c = r_pr.find(f"{W}color")
        if c is not None:
            color = (c.get(qn("w:val")) or "").upper()
        u = r_pr.find(f"{W}u")
        if u is not None:
            underline = (u.get(qn("w:val")) or "single").lower()
        h = r_pr.find(f"{W}highlight")
        if h is not None:
            highlight = (h.get(qn("w:val")) or "").lower()
    if color == "6B2D8B" or underline == "dotted":
        return "term"
    if color == "1B5E9E" or underline == "single":
        return "key"
    if highlight in {"yellow", "lightyellow"} or color == "142846":
        return "claim"
    if bold:
        return "strong"
    if italic:
        return "em"
    return None


def runs_from_paragraph(p_elm, doc: Document) -> list[dict]:
    pieces: list[dict] = []

    def push(text: str, role: str | None, href: str | None):
        if text == "":
            return
        item = {"t": text}
        if role:
            item["role"] = role
        if href:
            item["href"] = href
        if pieces and pieces[-1].get("role") == item.get("role") and pieces[-1].get("href") == item.get("href"):
            pieces[-1]["t"] += text
        else:
            pieces.append(item)

    def handle_run(r_elm, href: str | None):
        role = role_of(r_elm)
        buff: list[str] = []
        for child in r_elm:
            tag = child.tag
            if tag == f"{W}t":
                buff.append(child.text or "")
            elif tag == f"{W}tab":
                buff.append(" ")
            elif tag == f"{W}br":
                buff.append("\n")
        push("".join(buff), role, href)

    for child in p_elm:
        if child.tag == f"{W}r":
            handle_run(child, None)
        elif child.tag == f"{W}hyperlink":
            href = None
            rid = child.get(qn("r:id"))
            if rid and rid in doc.part.rels:
                href = doc.part.rels[rid].target_ref
            for r_elm in child.findall(f"{W}r"):
                handle_run(r_elm, href)
    return pieces


def plain(runs: list[dict]) -> str:
    return "".join(piece["t"] for piece in runs).strip()


def para_style(p_elm) -> str:
    ps = p_elm.find(f"{W}pPr/{W}pStyle")
    if ps is None:
        return "Normal"
    return ps.get(qn("w:val")) or "Normal"


def heading_level(style: str) -> int | None:
    match = re.search(r"(\d+)", style)
    if style.lower().startswith("heading") and match:
        return int(match.group(1))
    return None


def is_list(style: str) -> bool:
    low = style.lower()
    return "list" in low or low.startswith("list")


def images_in(p_elm, doc: Document, slug: str, counter: list[int]) -> list[dict]:
    found = []
    for blip in p_elm.findall(".//" + qn("a:blip")):
        rid = blip.get(qn("r:embed"))
        if not rid or rid not in doc.part.rels:
            continue
        part = doc.part.rels[rid].target_part
        blob = part.blob
        ext = Path(part.partname).suffix.lower() or ".png"
        if ext not in {".png", ".jpg", ".jpeg", ".gif", ".webp"}:
            ext = ".png"
        counter[0] += 1
        name = f"{slug}-{counter[0]:02d}{ext}"
        (FIGURES / name).write_bytes(blob)
        found.append({"type": "figure", "src": f"/figures/{name}", "alt": ""})
    return found


def cell_paragraphs(tc, doc: Document) -> list[dict]:
    paras = []
    for p_elm in tc.findall(f"{W}p"):
        runs = runs_from_paragraph(p_elm, doc)
        text = plain(runs)
        if text:
            paras.append({"text": text, "runs": runs})
    return paras


def table_rows(tbl, doc: Document) -> list[list[str]]:
    rows = []
    for tr in tbl.findall(f"{W}tr"):
        cells = []
        for tc in tr.findall(f"{W}tc"):
            tc_pr = tc.find(f"{W}tcPr")
            if tc_pr is not None:
                vm = tc_pr.find(f"{W}vMerge")
                if vm is not None and (vm.get(qn("w:val")) or "continue") != "restart":
                    continue
            texts = [p["text"] for p in cell_paragraphs(tc, doc)]
            cells.append("\n".join(texts).strip())
        collapsed = []
        for cell in cells:
            if collapsed and collapsed[-1] == cell:
                continue
            collapsed.append(cell)
        if any(collapsed):
            rows.append(collapsed)
    return rows


def callout_variant(title: str) -> str:
    low = title.lower()
    if "how to read" in low:
        return "read"
    if "one sentence" in low:
        return "sentence"
    if "plain words" in low:
        return "plain"
    if "read it again" in low or "carry away" in low:
        return "takeaway"
    if "chapter as a map" in low:
        return "map"
    return "note"


def classify_table(rows: list[list[str]], doc: Document, tbl) -> dict | None:
    if not rows:
        return None
    width = max(len(row) for row in rows)
    if width <= 1:
        # Rebuild with runs for the callout body.
        paragraphs = []
        for tc in tbl.findall(f"./{W}tr/{W}tc"):
            paragraphs.extend(cell_paragraphs(tc, doc))
        if not paragraphs:
            return None
        _mark, title = split_mark(paragraphs[0]["text"])
        body = paragraphs[1:]
        return {
            "type": "callout",
            "variant": callout_variant(title or paragraphs[0]["text"]),
            "title": title or paragraphs[0]["text"],
            "paragraphs": [p["runs"] for p in body] or [paragraphs[0]["runs"]],
        }
    return {"type": "table", "rows": rows}


def words_in(blocks: list[dict]) -> int:
    count = 0

    def add(text: str):
        nonlocal count
        count += len(text.split())

    for block in blocks:
        kind = block["type"]
        if kind in {"prose", "source"}:
            add(plain(block["runs"]))
        elif kind == "heading":
            add(block["text"])
        elif kind == "list":
            for item in block["items"]:
                add(plain(item))
        elif kind == "callout":
            add(block.get("title", ""))
            for para in block["paragraphs"]:
                add(plain(para))
        elif kind == "glossary":
            for item in block["items"]:
                add(item["term"])
                add(item["definition"])
        elif kind == "table":
            for row in block["rows"]:
                for cell in row:
                    add(cell)
        elif kind == "figure" and block.get("caption"):
            add(block["caption"])
    return count


def first_text(blocks: list[dict], variant: str) -> str:
    for block in blocks:
        if block["type"] == "callout" and block["variant"] == variant:
            parts = [plain(p) for p in block["paragraphs"]]
            return " ".join(p for p in parts if p).strip()
    return ""


def srt_to_vtt(src: Path, dest: Path) -> str:
    raw = src.read_text(encoding="utf-8", errors="replace").replace("\r\n", "\n").replace("\r", "\n")
    lines = []
    for line in raw.split("\n"):
        if "-->" in line:
            line = line.replace(",", ".")
        lines.append(line)
    dest.write_text("WEBVTT\n\n" + "\n".join(lines).strip() + "\n", encoding="utf-8")
    last = ""
    for line in lines:
        if "-->" in line:
            last = line.split("-->")[-1].strip().split()[0]
    return last


def clock_label(stamp: str) -> str:
    if not stamp:
        return ""
    parts = stamp.split(":")
    try:
        hours = int(parts[0])
        minutes = int(parts[1])
        seconds = float(parts[2])
    except (IndexError, ValueError):
        return ""
    total = hours * 60 + minutes + (1 if seconds >= 30 else 0)
    if total < 1:
        total = 1
    return f"{total} min"


def link_file(src: Path, dest: Path):
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        try:
            if os.path.samefile(src, dest):
                return
        except OSError:
            pass
        dest.unlink()
    os.link(src, dest)


def extract_doc(meta: dict) -> dict:
    path = EDITION / meta["doc"]
    doc = Document(str(path))
    counter = [0]
    raw_blocks: list[dict] = []
    ids: dict[str, int] = {}

    def next_id(text: str) -> str:
        base = slugify(text)
        ids[base] = ids.get(base, 0) + 1
        if ids[base] == 1:
            return base
        return f"{base}-{ids[base]}"

    for child in doc.element.body.iterchildren():
        if child.tag == f"{W}p":
            style = para_style(child)
            runs = runs_from_paragraph(child, doc)
            text = plain(runs)
            figures = images_in(child, doc, meta["slug"], counter)
            for figure in figures:
                raw_blocks.append(figure)
            if not text:
                continue
            level = heading_level(style)
            if level == 1:
                mark, title = split_mark(text)
                raw_blocks.append(
                    {"type": "heading", "level": 1, "mark": mark, "text": title, "id": "top"}
                )
                continue
            if level:
                mark, title = split_mark(text)
                raw_blocks.append(
                    {
                        "type": "heading",
                        "level": level,
                        "mark": mark,
                        "text": title,
                        "id": next_id(title),
                    }
                )
                continue
            if is_list(style):
                raw_blocks.append({"type": "list", "items": [runs]})
                continue
            if text.lower().startswith("source:") or text.lower().startswith("sources:"):
                raw_blocks.append({"type": "source", "runs": runs})
                continue
            raw_blocks.append({"type": "prose", "runs": runs})
        elif child.tag == f"{W}tbl":
            rows = table_rows(child, doc)
            block = classify_table(rows, doc, child)
            if block:
                raw_blocks.append(block)

    blocks: list[dict] = []
    i = 0
    while i < len(raw_blocks):
        block = raw_blocks[i]
        if block["type"] == "list":
            items = list(block["items"])
            while i + 1 < len(raw_blocks) and raw_blocks[i + 1]["type"] == "list":
                i += 1
                items.extend(raw_blocks[i]["items"])
            blocks.append({"type": "list", "items": items})
            i += 1
            continue
        if block["type"] == "prose" and block["runs"] and "words to know" in plain(block["runs"]).lower():
            if i + 1 < len(raw_blocks) and raw_blocks[i + 1]["type"] == "table":
                table = raw_blocks[i + 1]
                if table["rows"] and max(len(r) for r in table["rows"]) == 2:
                    items = []
                    for row in table["rows"]:
                        if len(row) >= 2 and row[0] and row[1]:
                            items.append({"term": row[0], "definition": row[1]})
                    blocks.append({"type": "glossary", "title": "Words to know", "items": items})
                    i += 2
                    continue
        if block["type"] == "figure" and i + 1 < len(raw_blocks) and raw_blocks[i + 1]["type"] == "prose":
            caption = plain(raw_blocks[i + 1]["runs"])
            if caption and len(caption) <= 360:
                block = dict(block)
                block["caption"] = caption
                block["alt"] = caption
                blocks.append(block)
                i += 2
                continue
        blocks.append(block)
        i += 1

    title = ""
    mark = ""
    for block in blocks:
        if block["type"] == "heading" and block["level"] == 1:
            title = block["text"]
            mark = block["mark"]
            break

    front = []
    body_start = 0
    for index, block in enumerate(blocks):
        if block["type"] == "heading" and block["level"] == 1:
            body_start = index + 1
            break
    answer = ""
    date = ""
    status = ""
    consumed = 0
    for block in blocks[body_start:]:
        if block["type"] != "prose":
            break
        text = plain(block["runs"])
        if not text:
            consumed += 1
            continue
        if text.lower().startswith("answer ") and not answer:
            answer = text
            consumed += 1
            continue
        if re.match(r"\d{1,2}\s+\w+\s+\d{4}", text) and not date:
            date = text
            consumed += 1
            continue
        if not status and len(text) < 180:
            status = text
            consumed += 1
            continue
        break
    # Drop the front-matter prose we already lifted, plus a bare H1.
    trimmed = []
    skipped = 0
    seen_h1 = False
    for block in blocks:
        if block["type"] == "heading" and block["level"] == 1 and not seen_h1:
            seen_h1 = True
            continue
        if seen_h1 and skipped < consumed and block["type"] == "prose":
            skipped += 1
            continue
        trimmed.append(block)

    link_file(path, DOCS / meta["doc"])
    video = VIDEOS / meta["video"]
    link_file(video, VIDEO_OUT / meta["video"])
    srt = video.with_suffix(".srt")
    duration = ""
    caption_name = ""
    if srt.exists():
        caption_name = Path(meta["video"]).with_suffix(".vtt").name
        duration = clock_label(srt_to_vtt(srt, CAPTIONS / caption_name))

    sentence = first_text(trimmed, "sentence")
    plain_words = first_text(trimmed, "plain")
    return {
        "meta": {
            "slug": meta["slug"],
            "episode": meta["episode"],
            "part": meta["part"],
            "title": title,
            "mark": mark,
            "answer": answer,
            "date": date,
            "status": status,
            "sentence": sentence,
            "plain": plain_words,
            "words": words_in(trimmed),
            "minutes": max(1, round(words_in(trimmed) / 230)),
            "duration": duration,
            "video": f"/videos/{meta['video']}",
            "captions": f"/captions/{caption_name}" if caption_name else "",
            "docx": f"/docs/{meta['doc']}",
            "docxName": meta["doc"],
            "figures": counter[0],
        },
        "blocks": trimmed,
    }


def main():
    for folder in (CONTENT, FIGURES, DOCS, VIDEO_OUT, CAPTIONS):
        folder.mkdir(parents=True, exist_ok=True)
    series = []
    summary = []
    for meta in CHAPTERS:
        page = extract_doc(meta)
        (CONTENT / f"{meta['slug']}.json").write_text(
            json.dumps({"blocks": page["blocks"]}, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8",
        )
        series.append(page["meta"])
        summary.append(
            f"{meta['episode']:02d} {meta['slug']:28} words={page['meta']['words']:5} "
            f"figs={page['meta']['figures']:2} {page['meta']['duration']:8} {page['meta']['title']}"
        )
    payload = {
        "title": "What AI changed",
        "date": "29 September 2026",
        "presenter": "Mohammad Ali Jaffry",
        "chapters": series,
    }
    (SITE / "src" / "data").mkdir(parents=True, exist_ok=True)
    (SITE / "src" / "data" / "series.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (SITE / "scripts" / "extract-summary.txt").write_text("\n".join(summary), encoding="utf-8")
    print("\n".join(summary))


if __name__ == "__main__":
    main()
