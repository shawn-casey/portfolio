import { useEffect } from 'react';
import { Icon } from './Icon';

export type LightboxTarget = { src: string; caption: string } | null;

/** Click an image to see it full size, the way Obsidian does. */
export default function Lightbox({ target, onClose }: { target: LightboxTarget; onClose: () => void }) {
  useEffect(() => {
    if (!target) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [target, onClose]);

  if (!target) return null;

  return (
    <div className="lightbox" onClick={onClose}>
      <button className="icon-btn" onClick={onClose} title="Close (Esc)">
        <Icon name="x" />
      </button>
      <img src={target.src} alt={target.caption} />
      {target.caption && <figcaption>{target.caption}</figcaption>}
      <span className="lb-hint">click anywhere or press esc to close</span>
    </div>
  );
}
