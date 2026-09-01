import { ALL_TAGS, notesWithTag } from '../content';

type Props = {
  tag: string;
  onSelect: (id: string) => void;
  onTag: (tag: string) => void;
  onHover: (id: string, el: HTMLElement) => void;
  onHoverEnd: () => void;
};

export default function TagView({ tag, onSelect, onTag, onHover, onHoverEnd }: Props) {
  const notes = notesWithTag(tag);
  return (
    <article>
      <h1 className="note-title">#{tag}</h1>
      <div className="note-meta">
        <span>
          {notes.length} note{notes.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="tagview-list">
        {notes.map((n) => (
          <div
            className="tagview-card"
            key={n.id}
            onClick={() => onSelect(n.id)}
            onMouseEnter={(e) => onHover(n.id, e.currentTarget)}
            onMouseLeave={onHoverEnd}
          >
            <h3>{n.title}</h3>
            <span className="tv-folder">{n.folder}</span>
            <p>{n.summary}</p>
          </div>
        ))}
      </div>

      <section className="backlinks">
        <div className="backlinks-header" style={{ cursor: 'default' }}>
          <span>all tags</span>
        </div>
        <div className="note-props">
          {ALL_TAGS.map((t) => (
            <button
              className="tag-pill"
              key={t.tag}
              onClick={() => onTag(t.tag)}
              style={t.tag === tag ? { background: 'var(--accent)', color: '#fff' } : undefined}
            >
              #{t.tag} <span style={{ opacity: 0.6 }}>{t.count}</span>
            </button>
          ))}
        </div>
      </section>
    </article>
  );
}
