import { useMemo } from 'react';
import { EDGES, getNote, notesWithTag, type Note } from '../content';
import { slugify } from './Markdown';
import ForceGraph from './ForceGraph';
import { Icon } from './Icon';

/** Headings in document order, code fences excluded. */
export function outlineOf(body: string) {
  const out: { level: number; text: string; slug: string }[] = [];
  let fenced = false;
  for (const line of body.split('\n')) {
    if (/^\s*```/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const m = /^(#{1,4})\s+(.*)$/.exec(line);
    if (!m) continue;
    const text = m[2]
      .replace(/\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (_x, t, d) => d ?? t)
      .replace(/[*_`]/g, '')
      .trim();
    out.push({ level: m[1].length, text, slug: slugify(text) });
  }
  return out;
}

type Props = {
  /** The open note, or the active tag when the tag-search view is showing. */
  target: { kind: 'note'; note: Note } | { kind: 'tag'; tag: string };
  onSelect: (id: string) => void;
  onOutlineClick: (slug: string) => void;
  themeKey: string;
  /** Pins the panel open at widths where it is normally hidden. */
  forceOpen?: boolean;
};

export default function RightPanel({ target, onSelect, onOutlineClick, themeKey, forceOpen }: Props) {
  const note = target.kind === 'note' ? target.note : null;

  const outline = useMemo(() => (note ? outlineOf(note.body) : []), [note]);

  const matches = useMemo(
    () => (target.kind === 'tag' ? notesWithTag(target.tag) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [target.kind, target.kind === 'tag' ? target.tag : ''],
  );

  const graph = useMemo(() => {
    const ids = note
      ? new Set<string>([note.id, ...note.links, ...note.backlinks])
      : new Set<string>(matches.map((n) => n.id));
    const nodes = [...ids]
      .map((id) => getNote(id))
      .filter((n): n is Note => Boolean(n))
      .map((n) => ({ id: n.id, title: n.title, folder: n.folder, hub: n.hub }));
    const links = EDGES.filter((e) => ids.has(e.source) && ids.has(e.target));
    return { nodes, links };
  }, [note, matches]);

  return (
    <aside className={`rightbar${forceOpen ? ' force-open' : ''}`}>
      <div className="rb-section outline">
        <div className="pane-header">
          <span>{note ? 'Outline' : 'Matching notes'}</span>
          <Icon name={note ? 'list' : 'tag'} size={13} />
        </div>
        <div className="outline-body">
          {note ? (
            outline.length === 0 ? (
              <p className="outline-empty">No headings in this note.</p>
            ) : (
              outline.map((h, i) => (
                <button
                  key={`${h.slug}-${i}`}
                  className={`outline-item lvl-${h.level}`}
                  onClick={() => onOutlineClick(h.slug)}
                  title={h.text}
                >
                  {h.text}
                </button>
              ))
            )
          ) : matches.length === 0 ? (
            <p className="outline-empty">Nothing carries this tag.</p>
          ) : (
            matches.map((n) => (
              <button key={n.id} className="outline-item" onClick={() => onSelect(n.id)} title={n.title}>
                {n.title}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="rb-section localgraph">
        <div className="pane-header">
          <span>{note ? 'Local graph' : 'Tag graph'}</span>
          <Icon name="graph" size={13} />
        </div>
        <div className="localgraph-canvas">
          <ForceGraph
            nodes={graph.nodes}
            links={graph.links}
            currentId={note?.id ?? null}
            onSelect={onSelect}
            variant="local"
            themeKey={themeKey}
          />
        </div>
      </div>
    </aside>
  );
}
