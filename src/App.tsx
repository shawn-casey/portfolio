import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EDGES, HOME_ID, NOTES, getNote } from './content';
import { SITE } from './content/config';
import { Icon } from './components/Icon';
import Sidebar from './components/Sidebar';
import NoteView from './components/NoteView';
import TagView from './components/TagView';
import RightPanel from './components/RightPanel';
import GraphView from './components/GraphView';
import CommandPalette from './components/CommandPalette';
import HoverPreview, { type HoverTarget } from './components/HoverPreview';
import Lightbox, { type LightboxTarget } from './components/Lightbox';

type Route = { kind: 'note'; id: string } | { kind: 'tag'; tag: string };

const sameRoute = (a: Route | undefined, b: Route) =>
  !!a && a.kind === b.kind && (a.kind === 'note' ? a.id === (b as { id: string }).id : a.tag === (b as { tag: string }).tag);

const hashOf = (r: Route) => (r.kind === 'note' ? `#/n/${r.id}` : `#/tag/${encodeURIComponent(r.tag)}`);

function parseHash(): Route {
  const h = window.location.hash.replace(/^#\/?/, '');
  if (h.startsWith('tag/')) return { kind: 'tag', tag: decodeURIComponent(h.slice(4)) };
  if (h.startsWith('n/')) {
    const id = decodeURIComponent(h.slice(2));
    if (getNote(id)) return { kind: 'note', id };
  }
  return { kind: 'note', id: HOME_ID };
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash);
  const [graphOpen, setGraphOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return (localStorage.getItem('theme') as 'dark' | 'light') ?? 'dark';
    } catch {
      return 'dark';
    }
  });
  const [hover, setHover] = useState<HoverTarget>(null);
  const [zoomed, setZoomed] = useState<LightboxTarget>(null);
  const hoverTimer = useRef<number>(0);
  const readingRef = useRef<HTMLDivElement>(null);
  // Obsidian-style back/forward within the vault, independent of browser history.
  const [hist, setHist] = useState<{ stack: Route[]; i: number }>(() => ({ stack: [parseHash()], i: 0 }));

  // ── theme ────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  // ── routing ──────────────────────────────────────────────────────────────
  const applyHash = useCallback(() => {
    const r = parseHash();
    setRoute(r);
    setHist((h) => (sameRoute(h.stack[h.i], r) ? h : { stack: [...h.stack.slice(0, h.i + 1), r], i: h.i + 1 }));
  }, []);

  useEffect(() => {
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, [applyHash]);

  const go = useCallback((r: Route) => {
    const hash = hashOf(r);
    if (window.location.hash === hash) return;
    window.location.hash = hash;
  }, []);

  const openNote = useCallback((id: string) => go({ kind: 'note', id }), [go]);
  const openTag = useCallback((tag: string) => go({ kind: 'tag', tag }), [go]);

  const step = (delta: -1 | 1) => {
    const i = hist.i + delta;
    if (i < 0 || i > hist.stack.length - 1) return;
    const r = hist.stack[i];
    setHist({ ...hist, i });
    setRoute(r);
    window.location.hash = hashOf(r);
  };

  // Reset scroll and dismiss transient UI when the route changes.
  useEffect(() => {
    readingRef.current?.scrollTo({ top: 0 });
    setDrawerOpen(false);
    setHover(null);
    setZoomed(null);
  }, [route]);

  // Delegated so every figure image is zoomable without threading a prop down.
  const onReadingClick = useCallback((e: React.MouseEvent) => {
    const img = (e.target as HTMLElement).closest('.md figure:not(.logo) img') as HTMLImageElement | null;
    if (!img) return;
    setZoomed({ src: img.currentSrc || img.src, caption: img.alt });
  }, []);

  // ── shortcuts ────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && (e.key === 'p' || e.key === 'o')) {
        e.preventDefault();
        setPaletteOpen(true);
      } else if (mod && e.key === 'g') {
        e.preventDefault();
        setGraphOpen((g) => !g);
      } else if (e.key === 'Escape') {
        setPaletteOpen(false);
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── hover previews ───────────────────────────────────────────────────────
  const onLinkHover = useCallback((id: string, el: HTMLElement) => {
    window.clearTimeout(hoverTimer.current);
    const rect = el.getBoundingClientRect();
    hoverTimer.current = window.setTimeout(() => setHover({ id, rect }), 320);
  }, []);
  const onLinkLeave = useCallback(() => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setHover(null), 90);
  }, []);

  const scrollToHeading = useCallback((slug: string) => {
    const el = readingRef.current?.querySelector(`#${CSS.escape(slug)}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const note = route.kind === 'note' ? getNote(route.id) : undefined;
  const displayNote = note ?? getNote(HOME_ID)!;
  const title = route.kind === 'tag' ? `#${route.tag}` : displayNote.title;

  useEffect(() => {
    document.title = title === SITE.name ? `${SITE.name} · Cybersecurity` : `${title} · ${SITE.name}`;
  }, [title]);

  const canBack = hist.i > 0;
  const canForward = hist.i < hist.stack.length - 1;

  const stats = useMemo(() => ({ notes: NOTES.length, links: EDGES.length }), []);

  return (
    <div className="app">
      <div className="titlebar">
        <span className="traffic">
          <i />
          <i />
          <i />
        </span>
        <button className="icon-btn mobile-only" onClick={() => setDrawerOpen((d) => !d)} title="Files">
          <Icon name="menu" />
        </button>
        <span className="titlebar-title">
          {title} · {SITE.vaultName}
        </span>
        <span className="tb-actions">
          <button
            className="icon-btn"
            onClick={() => setPaletteOpen(true)}
            title={`Quick switcher (${isMac ? '⌘' : 'Ctrl'}+P)`}
          >
            <Icon name="search" />
          </button>
          <button
            className="icon-btn mobile-only"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
          <button
            className={`icon-btn${rightOpen ? ' active' : ''}`}
            onClick={() => setRightOpen((v) => !v)}
            title="Toggle right sidebar"
          >
            <Icon name="panelRight" />
          </button>
        </span>
      </div>

      <div className="shell">
        <nav className="ribbon">
          <button className="icon-btn active" title="Files">
            <Icon name="files" />
          </button>
          <button className="icon-btn" onClick={() => setPaletteOpen(true)} title="Search">
            <Icon name="search" />
          </button>
          <button
            className={`icon-btn${graphOpen ? ' active' : ''}`}
            onClick={() => setGraphOpen((g) => !g)}
            title={`Graph view (${isMac ? '⌘' : 'Ctrl'}+G)`}
          >
            <Icon name="graph" />
          </button>
          <span className="spacer" />
          <button
            className="icon-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
        </nav>

        <Sidebar
          open={drawerOpen}
          currentId={route.kind === 'note' ? route.id : null}
          onSelect={openNote}
          onHover={onLinkHover}
          onHoverEnd={onLinkLeave}
        />
        {drawerOpen && <div className="scrim" onClick={() => setDrawerOpen(false)} />}

        <main className="workspace">
          <div className="tabbar">
            <span className="nav-arrows">
              <button className="icon-btn" onClick={() => step(-1)} disabled={!canBack} title="Back">
                <Icon name="chevronLeft" />
              </button>
              <button className="icon-btn" onClick={() => step(1)} disabled={!canForward} title="Forward">
                <Icon name="chevronRight" />
              </button>
            </span>
            <span className="tab">
              <Icon name={route.kind === 'tag' ? 'tag' : 'file'} />
              <span className="tab-title">{title}</span>
            </span>
            <span className="tab-spacer" />
            <button
              className={`icon-btn${graphOpen ? ' active' : ''}`}
              onClick={() => setGraphOpen(true)}
              title={`Open graph view (${isMac ? '⌘' : 'Ctrl'}+G)`}
            >
              <Icon name="graph" />
            </button>
          </div>

          <div className="reading" ref={readingRef} onClick={onReadingClick}>
            <div className="reading-inner">
              {route.kind === 'tag' ? (
                <TagView
                  tag={route.tag}
                  onSelect={openNote}
                  onTag={openTag}
                  onHover={onLinkHover}
                  onHoverEnd={onLinkLeave}
                />
              ) : (
                <NoteView
                  key={displayNote.id}
                  note={displayNote}
                  onSelect={openNote}
                  onTag={openTag}
                  onLinkHover={onLinkHover}
                  onLinkLeave={onLinkLeave}
                />
              )}
            </div>
          </div>
        </main>

        <RightPanel
          key={route.kind === 'tag' ? `tag:${route.tag}` : route.id}
          forceOpen={rightOpen}
          target={route.kind === 'tag' ? { kind: 'tag', tag: route.tag } : { kind: 'note', note: displayNote }}
          onSelect={openNote}
          onOutlineClick={scrollToHeading}
          themeKey={theme}
        />
      </div>

      <div className="statusbar">
        <span className="sb-item">
          <span className="sb-dot" />
          {stats.notes} notes · {stats.links} links
        </span>
        <span className="sb-spacer" />
        <span className="sb-item sb-btn" onClick={() => setPaletteOpen(true)}>
          {isMac ? '\u2318' : 'Ctrl'}+P
        </span>
        <span className="sb-item sb-btn" onClick={() => setGraphOpen(true)}>
          {isMac ? '\u2318' : 'Ctrl'}+G graph
        </span>
      </div>

      {graphOpen && (
        <GraphView
          currentId={route.kind === 'note' ? route.id : null}
          onSelect={openNote}
          onClose={() => setGraphOpen(false)}
          themeKey={theme}
        />
      )}
      {paletteOpen && (
        <CommandPalette onClose={() => setPaletteOpen(false)} onNote={openNote} onTag={openTag} />
      )}
      <HoverPreview target={hover} />
      <Lightbox target={zoomed} onClose={() => setZoomed(null)} />
    </div>
  );
}
