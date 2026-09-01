import { Children, isValidElement, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { resolveLink } from '../content';
import { SITE } from '../content/config';
import { Icon } from './Icon';

const WIKILINK = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]*))?\]\]/g;

/** Heading text to the anchor id the outline links to. */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/** Rewrite Obsidian syntax into plain markdown react-markdown understands. */
export function preprocess(body: string) {
  return body
    .replace(/\{\{email\}\}/g, `[${SITE.gtEmail}](mailto:${SITE.gtEmail})`)
    .replace(WIKILINK, (_m, target: string, display?: string) => {
      const id = resolveLink(target);
      const label = (display ?? target).replace(/[[\]]/g, '');
      return id ? `[${label}](#/n/${id})` : `[${label}](#/unresolved)`;
    });
}

const CALLOUT_ICON: Record<string, string> = {
  info: 'info',
  note: 'info',
  tip: 'info',
  warning: 'alert',
  caution: 'alert',
  danger: 'alert',
  success: 'check',
  todo: 'todo',
  quote: 'quote',
};
const CALLOUT_CLASS: Record<string, string> = {
  info: 'info',
  note: 'info',
  tip: 'info',
  warning: 'warning',
  caution: 'warning',
  danger: 'warning',
  success: 'success',
  todo: 'todo',
  quote: 'quote',
};

/** Flatten a react-markdown children tree back to text, for slugs and callouts. */
function textOf(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return '';
}

type LinkHandlers = {
  onNavigate: (id: string) => void;
  onLinkHover?: (id: string, el: HTMLElement) => void;
  onLinkLeave?: () => void;
};

export default function Markdown({ source, onNavigate, onLinkHover, onLinkLeave }: LinkHandlers & { source: string }) {
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          h1: (p) => <h1 id={slugify(textOf(p.children))}>{p.children}</h1>,
          h2: (p) => <h2 id={slugify(textOf(p.children))}>{p.children}</h2>,
          h3: (p) => <h3 id={slugify(textOf(p.children))}>{p.children}</h3>,
          h4: (p) => <h4 id={slugify(textOf(p.children))}>{p.children}</h4>,

          // A lone image becomes a <figure>, which cannot live inside a <p>.
          p: ({ children, node }) => {
            const kids = (node?.children ?? []).filter(
              (c) => !(c.type === 'text' && !c.value.trim()),
            );
            const loneImage =
              kids.length === 1 && kids[0].type === 'element' && kids[0].tagName === 'img';
            return loneImage ? <>{children}</> : <p>{children}</p>;
          },

          a: ({ href, children }) => {
            const url = href ?? '';
            if (url.startsWith('#/n/')) {
              const id = url.slice(4);
              return (
                <a
                  className="ilink"
                  href={url}
                  onClick={(e) => {
                    e.preventDefault();
                    onLinkLeave?.();
                    onNavigate(id);
                  }}
                  onMouseEnter={(e) => onLinkHover?.(id, e.currentTarget)}
                  onMouseLeave={() => onLinkLeave?.()}
                >
                  {children}
                </a>
              );
            }
            if (url === '#/unresolved') return <span className="ilink unresolved">{children}</span>;
            return (
              <a href={url} target={url.startsWith('http') ? '_blank' : undefined} rel="noreferrer noopener">
                {children}
              </a>
            );
          },

          // `![caption|class](/img/x.webp)`, where the class suffix picks a figure style
          img: ({ src, alt }) => {
            const raw = alt ?? '';
            const i = raw.lastIndexOf('|');
            const mod = i >= 0 ? raw.slice(i + 1).trim() : '';
            const known = ['logo', 'portrait', 'wide', 'inset'].includes(mod);
            const caption = (known ? raw.slice(0, i) : raw).trim();
            return (
              <figure className={known ? mod : undefined}>
                <img src={String(src ?? '')} alt={caption || ''} loading="lazy" decoding="async" />
                {caption && <figcaption>{caption}</figcaption>}
              </figure>
            );
          },

          // Obsidian callouts: `> [!warning] Title` on the first line, body after.
          blockquote: ({ children }) => {
            const kids = Children.toArray(children).filter(
              (c) => !(typeof c === 'string' && !c.trim()),
            );
            const first = kids[0];
            if (!isValidElement<{ children?: ReactNode }>(first)) return <blockquote>{children}</blockquote>;

            const inner = Children.toArray(first.props.children);
            const lead = typeof inner[0] === 'string' ? inner[0] : '';
            const m = /^\[!(\w+)\]\s*(.*)$/.exec(lead);
            if (!m) return <blockquote>{children}</blockquote>;

            const kind = m[1].toLowerCase();
            const cls = CALLOUT_CLASS[kind] ?? 'info';
            // remark-breaks turns the newline after the title into a <br>, so
            // that element is the boundary between the title and the body.
            const br = inner.findIndex((c) => isValidElement(c) && c.type === 'br');
            const titleRest = br > 0 ? inner.slice(1, br) : br === -1 ? inner.slice(1) : [];
            const bodyRest = br === -1 ? [] : inner.slice(br + 1);
            const titleText = m[2].trim();

            return (
              <div className={`callout callout-${cls}`}>
                <div className="callout-title">
                  <Icon name={CALLOUT_ICON[kind] ?? 'info'} />
                  <span>{titleText || titleRest.length ? [titleText, ...titleRest] : kind[0].toUpperCase() + kind.slice(1)}</span>
                </div>
                {bodyRest.length > 0 && <p>{bodyRest}</p>}
                {kids.slice(1)}
              </div>
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
