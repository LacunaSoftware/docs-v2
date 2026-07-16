import type {ReactNode} from 'react';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import DefaultNavbarItem from '@theme/NavbarItem/DefaultNavbarItem';
import DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem';

// Language-aware navbar links. The site serves the same articles under three
// route prefixes (Portuguese at /articles and /pt-br/articles, English at
// /en-us/articles). A plain `docSidebar` navbar item is bound to a single docs
// instance, so it always jumps back to the canonical /articles (Portuguese) —
// losing the language the reader had selected. These components compute the
// link target from the CURRENT path's prefix instead, so the top nav keeps you
// in the same language as you move between products (the sidebar already does).

// The router's pathname includes the site baseUrl (Docusaurus bakes it into
// routes rather than using a router basename). Strip it so language detection
// works under any baseUrl (e.g. '/' on the domain, '/docs-v2/' on GitHub Pages).
function useRelPath(): string {
  const {pathname} = useLocation();
  const {siteConfig: {baseUrl}} = useDocusaurusContext();
  return pathname.startsWith(baseUrl) ? `/${pathname.slice(baseUrl.length)}` : pathname;
}

// Derive the "<lang>/articles" base (baseUrl-relative — DefaultNavbarItem's Link
// prepends the baseUrl) from the current path.
function articlesBase(rel: string): string {
  if (rel === '/en-us' || rel.startsWith('/en-us/')) return '/en-us/articles';
  if (rel === '/pt-br' || rel.startsWith('/pt-br/')) return '/pt-br/articles';
  return '/articles';
}

// Highlight the item on its product's pages in any language. Not anchored to the
// start, so it matches regardless of the baseUrl prefix. `rest-pki` needs a
// negative lookahead so it doesn't also light up on `rest-pki/core` pages.
function activeBaseRegex(docId: string): string {
  const notCore = docId === 'rest-pki' ? '(?!/core)' : '';
  return `(?:^|/)(?:en-us/|pt-br/)?articles/${docId}${notCore}(/|$)`;
}

interface DocLinkProps {
  docId: string;
  label: string;
  [key: string]: unknown;
}

export function LocalizedDocNavbarItem({docId, ...props}: DocLinkProps): ReactNode {
  const rel = useRelPath();
  return (
    <DefaultNavbarItem
      {...props}
      to={`${articlesBase(rel)}/${docId}`}
      activeBaseRegex={activeBaseRegex(docId)}
    />
  );
}

interface DocDropdownProps {
  items: {docId: string; label: string}[];
  [key: string]: unknown;
}

export function LocalizedDocDropdownNavbarItem({items, ...props}: DocDropdownProps): ReactNode {
  const base = articlesBase(useRelPath());
  const resolved = items.map(({docId, label}) => ({
    label,
    to: `${base}/${docId}`,
    activeBaseRegex: activeBaseRegex(docId),
  }));
  return <DropdownNavbarItem {...props} items={resolved} />;
}
