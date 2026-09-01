import { Fragment, type ComponentType } from 'react';
import type { Note } from '../content';
import Markdown, { preprocess } from './Markdown';
import Backlinks from './Backlinks';
import { Fingerprint, VisitCounter } from './Visitor';

type Props = {
  note: Note;
  onSelect: (id: string) => void;
  onTag: (tag: string) => void;
  onLinkHover: (id: string, el: HTMLElement) => void;
  onLinkLeave: () => void;
};

const WIDGETS: Record<string, ComponentType> = {
  fingerprint: Fingerprint,
  visits: VisitCounter,
};

export default function NoteView({ note, onSelect, onTag, onLinkHover, onLinkLeave }: Props) {
  // Split the body around {{widget}} markers so live components can sit inline.
  const segments = preprocess(note.body).split(/\{\{(\w+)\}\}/g);

  return (
    <article>
      <h1 className="note-title">{note.title}</h1>

      {note.tags.length > 0 && (
        <div className="note-props">
          {note.tags.map((t) => (
            <button className="tag-pill" key={t} onClick={() => onTag(t)} title={`Show all notes tagged #${t}`}>
              #{t}
            </button>
          ))}
        </div>
      )}

      {segments.map((seg, i) => {
        if (i % 2 === 1) {
          const W = WIDGETS[seg];
          return W ? <W key={`w-${i}`} /> : null;
        }
        return seg.trim() ? (
          <Markdown
            key={`m-${i}`}
            source={seg}
            onNavigate={onSelect}
            onLinkHover={onLinkHover}
            onLinkLeave={onLinkLeave}
          />
        ) : (
          <Fragment key={`m-${i}`} />
        );
      })}

      <Backlinks note={note} onSelect={onSelect} onHover={onLinkHover} onHoverEnd={onLinkLeave} />
    </article>
  );
}
