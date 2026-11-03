import { useState } from 'react';
import { backlinkContext, getNote, type Note } from '../content';
import { Icon } from './Icon';

type Props = {
  note: Note;
  onSelect: (id: string) => void;
  onHover?: (id: string, el: HTMLElement) => void;
  onHoverEnd?: () => void;
};

export default function Backlinks({ note, onSelect, onHover, onHoverEnd }: Props) {
  const [open, setOpen] = useState(true);
  const items = note.backlinks.map((id) => ({ src: getNote(id)!, ctx: backlinkContext(id, note.id) }));

  return (
    <section className="backlinks">
      <div className="backlinks-header" onClick={() => setOpen((o) => !o)}>
        <span className={`chev${open ? ' open' : ''}`}>
          <Icon name="chevronRight" />
        </span>
        <Icon name="backlink" />
        <span>
          {items.length} linked mention{items.length === 1 ? '' : 's'}
        </span>
      </div>
      {open &&
        (items.length === 0 ? (
          <p className="backlinks-empty">Nothing links here yet.</p>
        ) : (
          items.map(({ src, ctx }) => (
            <div
              key={src.id}
              className="backlink-item"
              onClick={() => onSelect(src.id)}
              onMouseEnter={(e) => onHover?.(src.id, e.currentTarget)}
              onMouseLeave={() => onHoverEnd?.()}
            >
              <div className="backlink-title">
                <Icon name="file" size={12} />
                {src.title}
                <span className="bl-folder">{src.folder}</span>
              </div>
              {ctx && (
                <div className="backlink-ctx">
                  {ctx.before}
                  <mark>{ctx.link}</mark>
                  {ctx.after}
                </div>
              )}
            </div>
          ))
        ))}
    </section>
  );
}
