import { SITE } from './config';

export type Note = {
  id: string;
  title: string;
  folder: string;
  order: number;
  tags: string[];
  aliases: string[];
  summary: string;
  /** 'center' for the home note, true for a top-level hub, false for a leaf. */
  hub: 'center' | boolean;
  /** Optional special renderer keyed by name (currently only 'visitor'). */
  component?: string;
  body: string;
  /** Outgoing links, resolved note ids, de-duplicated, in document order. */
  links: string[];
  /** Note ids that link here. */
  backlinks: string[];
  wordCount: number;
};

// -- frontmatter -----------------------------------------------------------
type Raw = Record<string, unknown>;

function parseScalar(v: string): unknown {
  const s = v.trim();
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (s.startsWith('[') && s.endsWith(']')) {
    return s
      .slice(1, -1)
      .split(',')
      .map((x) => x.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return s.replace(/^["']|["']$/g, '');
}

function parseFrontmatter(src: string): { data: Raw; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(src);
  if (!m) return { data: {}, body: src };
  const data: Raw = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i === -1 || /^\s*#/.test(line)) continue;
    data[line.slice(0, i).trim()] = parseScalar(line.slice(i + 1));
  }
  return { data, body: src.slice(m[0].length) };
}

// -- load ------------------------------------------------------------------
const files = import.meta.glob('./notes/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const asArray = (v: unknown) => (Array.isArray(v) ? (v as string[]) : v ? [String(v)] : []);

const parsed = Object.entries(files).map(([path, src]) => {
  const { data, body } = parseFrontmatter(src);
  const fallbackId = path.split('/').pop()!.replace(/\.md$/, '');
  return {
    id: String(data.id ?? fallbackId),
    title: String(data.title ?? fallbackId),
    folder: String(data.folder ?? 'Home'),
    order: typeof data.order === 'number' ? data.order : 99,
    tags: asArray(data.tags),
    aliases: asArray(data.aliases),
    summary: String(data.summary ?? ''),
    hub: (data.hub === 'center' ? 'center' : data.hub === true) as 'center' | boolean,
    component: data.component ? String(data.component) : undefined,
    body,
  };
});

// -- link resolution -------------------------------------------------------
const byKey = new Map<string, string>();
for (const n of parsed) {
  byKey.set(n.title.toLowerCase(), n.id);
  byKey.set(n.id.toLowerCase(), n.id);
  for (const a of n.aliases) byKey.set(a.toLowerCase(), n.id);
}

/** `[[Target]]` / `[[Target|display]]` to a note id, or null when unresolved. */
export function resolveLink(target: string): string | null {
  return byKey.get(target.trim().toLowerCase()) ?? null;
}

const WIKILINK = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]*))?\]\]/g;

/** Every wikilink occurrence in a body, with its display text and offset. */
function scanLinks(body: string) {
  const out: { target: string; display: string; index: number }[] = [];
  for (const m of body.matchAll(WIKILINK)) {
    out.push({ target: m[1], display: m[2] ?? m[1], index: m.index ?? 0 });
  }
  return out;
}

const notes: Note[] = parsed.map((n) => {
  const links: string[] = [];
  for (const l of scanLinks(n.body)) {
    const id = resolveLink(l.target);
    if (id && id !== n.id && !links.includes(id)) links.push(id);
  }
  const plain = n.body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(WIKILINK, (_m, t, d) => d ?? t)
    .replace(/[#>*_`|-]/g, ' ');
  return {
    ...n,
    links,
    backlinks: [] as string[],
    wordCount: (plain.match(/[A-Za-z0-9][A-Za-z0-9'.-]*/g) ?? []).length,
  };
});

const index = new Map(notes.map((n) => [n.id, n]));
for (const n of notes) for (const t of n.links) index.get(t)!.backlinks.push(n.id);

notes.sort((a, b) => {
  const rank = (f: string) => {
    const i = (SITE.folders as readonly string[]).indexOf(f);
    return i < 0 ? 99 : i;
  };
  if (rank(a.folder) !== rank(b.folder)) return rank(a.folder) - rank(b.folder);
  if (a.order !== b.order) return a.order - b.order;
  return a.title.localeCompare(b.title);
});

export const NOTES = notes;
export const NOTE_BY_ID = index;
export const HOME_ID = notes.find((n) => n.hub === 'center')?.id ?? notes[0].id;

export function getNote(id: string | null | undefined): Note | undefined {
  return id ? index.get(id) : undefined;
}

/** Undirected edge list, de-duplicated. */
export const EDGES: { source: string; target: string }[] = (() => {
  const seen = new Set<string>();
  const out: { source: string; target: string }[] = [];
  for (const n of NOTES)
    for (const t of n.links) {
      const key = [n.id, t].sort().join(' ');
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ source: n.id, target: t });
    }
  return out;
})();

export const ALL_TAGS: { tag: string; count: number }[] = (() => {
  const counts = new Map<string, number>();
  for (const n of NOTES) for (const t of n.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
})();

export function notesWithTag(tag: string): Note[] {
  return NOTES.filter((n) => n.tags.includes(tag));
}

export const FOLDER_TREE = SITE.folders.map((folder) => ({
  folder,
  notes: NOTES.filter((n) => n.folder === folder),
}));

export type BacklinkContext = { before: string; link: string; after: string };

/**
 * Text around the first mention of `targetId` inside `sourceId`, for the
 * linked-mentions panel. Mirrors how Obsidian shows backlink context.
 */
export function backlinkContext(sourceId: string, targetId: string): BacklinkContext | null {
  const src = index.get(sourceId);
  if (!src) return null;
  for (const l of scanLinks(src.body)) {
    if (resolveLink(l.target) !== targetId) continue;
    const flatBefore = src.body.slice(0, l.index).replace(WIKILINK, (_m, t, d) => d ?? t);
    const cut = Math.max(flatBefore.lastIndexOf('\n\n'), flatBefore.lastIndexOf('. ') + 1, 0);
    const before = flatBefore
      .slice(cut)
      .replace(/[#>*_`|]/g, '')
      .replace(/^[\s-]+/, '')
      .replace(/\s+/g, ' ');
    const after = src.body
      .slice(l.index)
      .replace(WIKILINK, (_m, t, d) => d ?? t)
      .slice(l.display.length)
      .split(/\n\n/)[0]
      .replace(/[#>*_`|]/g, '')
      .replace(/\s+/g, ' ');
    // Trim to a word boundary so a context line never starts mid-word.
    const head = (s: string, n: number) =>
      s.length > n ? '…' + s.slice(-n).replace(/^\S+\s*/, '') : s;
    const tail = (s: string, n: number) => (s.length > n ? s.slice(0, n).trimEnd() + '…' : s);
    return { before: head(before, 100), link: l.display, after: tail(after, 130) };
  }
  return null;
}
