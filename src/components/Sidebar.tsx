import { useState } from 'react';
import { FOLDER_TREE, NOTES, EDGES } from '../content';
import { SITE } from '../content/config';
import { Icon } from './Icon';

type Props = {
  /** Drawer state on narrow screens. */
  open?: boolean;
  currentId: string | null;
  onSelect: (id: string) => void;
  onHover?: (id: string, el: HTMLElement) => void;
  onHoverEnd?: () => void;
};

export default function Sidebar({ open: drawerOpen, currentId, onSelect, onHover, onHoverEnd }: Props) {
  const currentFolder = NOTES.find((n) => n.id === currentId)?.folder;
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SITE.folders.map((f) => [f, true])),
  );

  return (
    <aside className={`sidebar${drawerOpen ? ' open' : ''}`}>
      <div className="pane-header">
        <span>{SITE.vaultName}</span>
        <Icon name="files" size={13} />
      </div>
      <div className="pane-body">
        {FOLDER_TREE.map(({ folder, notes }) => {
          const isOpen = open[folder] ?? true;
          return (
            <div className="tree-folder" key={folder}>
              <div
                className={`tree-item${!isOpen && folder === currentFolder ? ' is-active' : ''}`}
                onClick={() => setOpen((o) => ({ ...o, [folder]: !isOpen }))}
              >
                <span className={`twisty${isOpen ? ' open' : ''}`}>
                  <Icon name="chevronRight" />
                </span>
                <span className="ti-icon">
                  <Icon name="folder" />
                </span>
                <span className="ti-label">{folder}</span>
                <span className="ti-count">{notes.length}</span>
              </div>
              {isOpen && (
                <div className="tree-children">
                  {notes.map((n) => (
                    <div
                      key={n.id}
                      className={`tree-item tree-note${n.id === currentId ? ' is-active' : ''}`}
                      onClick={() => onSelect(n.id)}
                      onMouseEnter={(e) => onHover?.(n.id, e.currentTarget)}
                      onMouseLeave={() => onHoverEnd?.()}
                      title={n.title}
                    >
                      <span className="ti-icon">
                        <Icon name="file" />
                      </span>
                      <span className="ti-label">{n.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div className="sidebar-note-count">
          {NOTES.length} notes · {EDGES.length} links
        </div>
      </div>
    </aside>
  );
}
