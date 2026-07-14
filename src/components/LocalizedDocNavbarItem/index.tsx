import type {ReactNode} from 'react';
import {useLocation} from '@docusaurus/router';
import DefaultNavbarItem from '@theme/NavbarItem/DefaultNavbarItem';
import DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem';

// Language-aware navbar links. The site serves the same articles under three
// route prefixes (Portuguese at /articles and /pt-br/articles, English at
// /en-us/articles). A plain `docSidebar` navbar item is bound to a single docs
// instance, so it always jumps back to the canonical /articles (Portuguese) —
// losing the language the reader had selected. These components compute the
// link target from the CURRENT path's prefix instead, so the top nav keeps you
// in the same language as you move between products (the sidebar already does).

// Derive the "<lang>/articles" base from the current pathname.
function articlesBase(pathname: string): string {
  if (pathname === '/en-us' || pathname.startsWith('/en-us/')) return '/en-us/articles';
  if (pathname === '/pt-br' || pathname.startsWith('/pt-br/')) return '/pt-br/articles';
  return '/articles';
}

// Highlight the item on its product's pages in any language. `rest-pki` needs a
// negative lookahead so it doesn't also light up on `rest-pki/core` pages.
function activeBaseRegex(docId: string): string {
  const notCore = docId === 'rest-pki' ? '(?!/core)' : '';
  return `^(/(en-us|pt-br))?/articles/${docId}${notCore}(/|$)`;
}

interface DocLinkProps {
  docId: string;
  label: string;
  [key: string]: unknown;
}

export function LocalizedDocNavbarItem({docId, ...props}: DocLinkProps): ReactNode {
  const {pathname} = useLocation();
  return (
    <DefaultNavbarItem
      {...props}
      to={`${articlesBase(pathname)}/${docId}`}
      activeBaseRegex={activeBaseRegex(docId)}
    />
  );
}

interface DocDropdownProps {
  items: {docId: string; label: string}[];
  [key: string]: unknown;
}

export function LocalizedDocDropdownNavbarItem({items, ...props}: DocDropdownProps): ReactNode {
  const {pathname} = useLocation();
  const base = articlesBase(pathname);
  const resolved = items.map(({docId, label}) => ({
    label,
    to: `${base}/${docId}`,
    activeBaseRegex: activeBaseRegex(docId),
  }));
  return <DropdownNavbarItem {...props} items={resolved} />;
}
