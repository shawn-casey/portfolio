import ReactMarkdown from 'react-markdown';
import { getNote } from '../content';
import { preprocess } from './Markdown';

export type HoverTarget = { id: string; rect: DOMRect } | null;

/** First couple of paragraphs, images and callout markers stripped. */
function excerpt(body: string) {
  const cleaned = body
    .replace(/^!\[[^\]]*\]\([^)]*\)\s*$/gm, '')
    .replace(/^>\s*\[![\w]+\][^\n]*/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^\|.*$/gm, '');
  const paras = cleaned
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p && !/^#{1,4}\s/.test(p));
  const text = paras.slice(0, 2).join('\n\n');
  return text.length > 420 ? text.slice(0, 420).replace(/\s\S*$/, '') + '…' : text;
}

const POP_W = 360;
const POP_H = 300;

/** Below the link when there is room, above it otherwise, always on screen. */
function place(r: DOMRect) {
  const gap = 10;
  const left = Math.min(Math.max(r.left + r.width / 2 - POP_W / 2, 12), window.innerWidth - POP_W - 12);
  const below = r.bottom + gap;
  const raw = below + POP_H > window.innerHeight - 12 ? r.top - gap - POP_H : below;
  const top = Math.min(Math.max(raw, 12), Math.max(12, window.innerHeight - POP_H - 12));
  return { top, left };
}

export default function HoverPreview({ target }: { target: HoverTarget }) {
  const note = getNote(target?.id);
  if (!target || !note) return null;
  const pos = place(target.rect);

  return (
    <div className="hoverpop" style={{ top: pos.top, left: pos.left }}>
      <div className="hp-title">{note.title}</div>
      {note.tags.length > 0 && (
        <div className="hp-tags">
          {note.tags.slice(0, 4).map((t) => (
            <span className="tag-pill" key={t}>
              #{t}
            </span>
          ))}
        </div>
      )}
      <div className="hp-body">
        <ReactMarkdown
          components={{
            a: ({ children }) => <span style={{ color: 'var(--accent)' }}>{children}</span>,
            img: () => null,
            h1: ({ children }) => <p>{children}</p>,
            h2: ({ children }) => <p>{children}</p>,
            h3: ({ children }) => <p>{children}</p>,
          }}
        >
          {preprocess(excerpt(note.body))}
        </ReactMarkdown>
      </div>
    </div>
  );
}
