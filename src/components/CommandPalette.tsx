import { useEffect, useMemo, useRef, useState } from 'react';
import { ALL_TAGS, NOTES } from '../content';
import { fuzzy, highlight } from '../lib/fuzzy';
import { Icon } from './Icon';

type Entry = { kind: 'note' | 'tag'; key: string; title: string; sub: string };

const ENTRIES: Entry[] = [
  ...NOTES.map((n) => ({
    kind: 'note' as const,
    key: n.id,
    title: n.title,
    sub: `${n.folder}${n.tags.length ? '  ·  ' + n.tags.map((t) => '#' + t).join(' ') : ''}`,
  })),
  ...ALL_TAGS.map((t) => ({
    kind: 'tag' as const,
    key: t.tag,
    title: '#' + t.tag,
    sub: `${t.count} note${t.count === 1 ? '' : 's'}`,
  })),
];

type Props = { onClose: () => void; onNote: (id: string) => void; onTag: (tag: string) => void };

export default function CommandPalette({ onClose, onNote, onTag }: Props) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!q.trim()) return ENTRIES.filter((e) => e.kind === 'note').slice(0, 40).map((e) => ({ e, idx: [] as number[] }));
    return ENTRIES.map((e) => {
      const inTitle = fuzzy(q, e.title);
      if (inTitle) return { e, idx: inTitle.indices, score: inTitle.score };
      // Fall back to a plain substring on folder/tags. Fuzzy-matching the
      // metadata line matches almost everything and drowns out real hits.
      const needle = q.trim().toLowerCase();
      if (needle.length > 1 && e.sub.toLowerCase().includes(needle))
        return { e, idx: [] as number[], score: 30 - e.title.length / 4 };
      return null;
    })
      .filter((r): r is { e: Entry; idx: number[]; score: number } => r !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 40);
  }, [q]);

  useEffect(() => {
    const el = listRef.current?.children[sel] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [sel]);

  const commit = (i: number) => {
    const r = results[i];
    if (!r) return;
    onClose();
    if (r.e.kind === 'note') onNote(r.e.key);
    else onTag(r.e.key);
  };

  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className="palette" onMouseDown={(e) => e.stopPropagation()}>
        <input
          className="palette-input"
          autoFocus
          value={q}
          placeholder="Find a note or #tag…"
          onChange={(e) => {
            setQ(e.target.value);
            setSel(0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' || (e.key === 'n' && e.ctrlKey)) {
              e.preventDefault();
              setSel((s) => Math.min(s + 1, results.length - 1));
            } else if (e.key === 'ArrowUp' || (e.key === 'p' && e.ctrlKey)) {
              e.preventDefault();
              setSel((s) => Math.max(s - 1, 0));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              commit(sel);
            } else if (e.key === 'Escape') {
              e.preventDefault();
              onClose();
            }
          }}
        />
        <div className="palette-list" ref={listRef}>
          {results.length === 0 && <div className="palette-empty">No matches.</div>}
          {results.map((r, i) => (
            <div
              key={r.e.kind + r.e.key}
              className={`palette-item${i === sel ? ' sel' : ''}`}
              onMouseMove={() => setSel(i)}
              onClick={() => commit(i)}
            >
              <Icon name={r.e.kind === 'tag' ? 'tag' : 'file'} />
              <span className="pi-main">
                <span className="pi-title">
                  {highlight(r.e.title, r.idx).map((s, j) => (s.hit ? <b key={j}>{s.text}</b> : <span key={j}>{s.text}</span>))}
                </span>
                <span className="pi-sub">{r.e.sub}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="palette-foot">
          <span>
            <kbd>↑↓</kbd>navigate
          </span>
          <span>
            <kbd>↵</kbd>open
          </span>
          <span>
            <kbd>esc</kbd>dismiss
          </span>
        </div>
      </div>
    </div>
  );
}
