import type {ReactNode} from 'react';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import OriginalLinkItem from '@theme-original/Footer/LinkItem';
import type {Props} from '@theme/Footer/LinkItem';

// Keep footer product links in the current language, like the navbar. Footer
// items are configured once (pointing at the canonical Portuguese /articles/…);
// here we re-prefix any internal /articles/ link with the locale segment of the
// page being viewed (/en-us or /pt-br), so the footer doesn't bounce readers
// back to Portuguese. External links (href) and non-article links are untouched.
// The returned `to` stays baseUrl-relative — the original LinkItem prepends the
// baseUrl. `rel` is the current path with the site baseUrl stripped, so this
// works under '/' or '/docs-v2/'.
function localizeTo(to: string | undefined, rel: string): string | undefined {
  if (!to || !to.startsWith('/articles/')) return to;
  if (rel === '/en-us' || rel.startsWith('/en-us/')) return `/en-us${to}`;
  if (rel === '/pt-br' || rel.startsWith('/pt-br/')) return `/pt-br${to}`;
  return to;
}

export default function LinkItem(props: Props): ReactNode {
  const {pathname} = useLocation();
  const {siteConfig: {baseUrl}} = useDocusaurusContext();
  const rel = pathname.startsWith(baseUrl) ? `/${pathname.slice(baseUrl.length)}` : pathname;
  const {item} = props;
  const localized = item.to ? {...item, to: localizeTo(item.to, rel)} : item;
  return <OriginalLinkItem {...props} item={localized} />;
}
