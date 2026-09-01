import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { EDGES, NOTES, getNote } from '../content';
import { FOLDER_COLOR, SITE } from '../content/config';
import ForceGraph, { type GraphCanvas } from './ForceGraph';
import { preprocess } from './Markdown';
import { Icon } from './Icon';

type Props = {
  currentId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  themeKey: string;
};

type Peek = { id: string; x: number; y: number };

/** First readable paragraph, images and callout markers stripped. */
function excerpt(body: string) {
  const cleaned = body
    .replace(/^!\[[^\]]*\]\([^)]*\)\s*$/gm, '')
    .replace(/^>\s*\[![\w]+\][^\n]*/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^\|.*$/gm, '');
  const para = cleaned
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !/^#{1,4}\s/.test(p) && p.length > 40);
  const text = para ?? '';
  return text.length > 260 ? text.slice(0, 260).replace(/\s\S*$/, '') + '…' : text;
}

export default function GraphView({ currentId, onSelect, onClose, themeKey }: Props) {
  const canvasRef = useRef<GraphCanvas | null>(null);
  const [peek, setPeek] = useState<Peek | null>(null);

  const nodes = useMemo(
    () => NOTES.map((n) => ({ id: n.id, title: n.title, folder: n.folder, hub: n.hub })),
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (peek) setPeek(null);
      else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, peek]);

  const onNode = useCallback((id: string, at?: { x: number; y: number }) => {
    setPeek(at ? { id, x: at.x, y: at.y } : null);
  }, []);

  const note = getNote(peek?.id);

  // Anchor the card beside the node, flipping when it would leave the viewport.
  let pos: { top: number; left: number } | null = null;
  if (peek) {
    const W = 340;
    const H = 260;
    const left = Math.min(Math.max(peek.x - W / 2, 12), window.innerWidth - W - 12);
    const below = peek.y + 22;
    const top = below + H > window.innerHeight - 12 ? Math.max(12, peek.y - 22 - H) : below;
    pos = { top, left };
  }

  return (
    <div className="graphview">
      <div className="graphview-bar">
        <span className="gv-title">
          <Icon name="graph" />
          Graph view
        </span>
        <span className="gv-hint">click a node to preview it, click the preview to open</span>
        <span style={{ flex: 1 }} />
        <button className="icon-btn" onClick={onClose} title="Close graph view (Esc)">
          <Icon name="x" />
        </button>
      </div>

      <div className="graphview-body">
        <ForceGraph
          canvasRef={canvasRef}
          nodes={nodes}
          links={EDGES}
          currentId={currentId}
          onSelect={onNode}
          onBlank={() => setPeek(null)}
          variant="full"
          themeKey={themeKey}
        />

        {note && pos && (
          <div
            className="graph-pop"
            style={{ top: pos.top, left: pos.left }}
            onClick={() => {
              setPeek(null);
              onSelect(note.id);
              onClose();
            }}
          >
            <div className="gp-folder">{note.folder}</div>
            <div className="gp-title">{note.title}</div>
            <div className="gp-body">
              <ReactMarkdown components={{ a: ({ children }) => <span>{children}</span> }}>
                {preprocess(excerpt(note.body))}
              </ReactMarkdown>
            </div>
            <div className="gp-open">
              Open note
              <Icon name="chevronRight" />
            </div>
          </div>
        )}

        <div className="graph-controls">
          <button className="icon-btn" title="Zoom in" onClick={() => canvasRef.current?.__zoom?.(1.35)}>
            <Icon name="zoomIn" />
          </button>
          <button className="icon-btn" title="Zoom out" onClick={() => canvasRef.current?.__zoom?.(1 / 1.35)}>
            <Icon name="zoomOut" />
          </button>
          <button className="icon-btn" title="Fit to view" onClick={() => canvasRef.current?.__fit?.(true)}>
            <Icon name="target" />
          </button>
        </div>

        <div className="graph-legend">
          {SITE.folders.map((f) => (
            <div className="lg-row" key={f}>
              <span className="lg-dot" style={{ background: FOLDER_COLOR[f] }} />
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
