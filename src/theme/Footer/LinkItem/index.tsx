import type {ReactNode} from 'react';
import {useLocation} from '@docusaurus/router';
import OriginalLinkItem from '@theme-original/Footer/LinkItem';
import type {Props} from '@theme/Footer/LinkItem';

// Keep footer product links in the current language, like the navbar. Footer
// items are configured once (pointing at the canonical Portuguese /articles/…);
// here we re-prefix any internal /articles/ link with the locale segment of the
// page being viewed (/en-us or /pt-br), so the footer doesn't bounce readers
// back to Portuguese. External links (href) and non-article links are untouched.
function localizeTo(to: string | undefined, pathname: string): string | undefined {
  if (!to || !to.startsWith('/articles/')) return to;
  if (pathname === '/en-us' || pathname.startsWith('/en-us/')) return `/en-us${to}`;
  if (pathname === '/pt-br' || pathname.startsWith('/pt-br/')) return `/pt-br${to}`;
  return to;
}

export default function LinkItem(props: Props): ReactNode {
  const {pathname} = useLocation();
  const {item} = props;
  const localized = item.to ? {...item, to: localizeTo(item.to, pathname)} : item;
  return <OriginalLinkItem {...props} item={localized} />;
}
