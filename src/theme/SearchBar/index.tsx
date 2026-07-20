import {useEffect, useLayoutEffect} from 'react';
import type {ReactNode} from 'react';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import OriginalSearchBar from '@theme-original/SearchBar';
import type SearchBarType from '@theme/SearchBar';
import type {WrapperProps} from '@docusaurus/types';

type Props = WrapperProps<typeof SearchBarType>;

// Localize the search box to match the page's language. The site runs a single
// Docusaurus locale (pt-BR) and serves English under the /en-us URL prefix
// rather than as a real Docusaurus locale, so translate() resolves to one value
// site-wide and can't tell PT pages from EN pages. The Portuguese default
// ("Busca") is set via i18n/pt-BR/code.json (so it's server-rendered with no
// flash for the common case); here we flip it to "Search" on /en-us pages.
//
// The @easyops-cn/docusaurus-search-local plugin re-derives the input's
// placeholder from translate() on every render, and hardcodes aria-label="Search"
// outright — so setting the attributes once doesn't stick. We attach a
// MutationObserver that re-applies the wanted label whenever the plugin resets
// it. Both attributes are guarded so our own writes don't loop.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function SearchBarWrapper(props: Props): ReactNode {
  const {pathname} = useLocation();
  const {siteConfig: {baseUrl}} = useDocusaurusContext();
  // The router pathname includes the site baseUrl; strip it so detection works
  // under any baseUrl ('/' or '/docs-v2/'), matching LanguageSwitchNavbarItem.
  const rel = pathname.startsWith(baseUrl) ? `/${pathname.slice(baseUrl.length)}` : pathname;
  const isEn = rel === '/en-us' || rel.startsWith('/en-us/');
  const label = isEn ? 'Search' : 'Busca';

  useIsomorphicLayoutEffect(() => {
    const input = document.querySelector<HTMLInputElement>('input.navbar__search-input');
    if (!input) return;

    const apply = () => {
      if (input.placeholder !== label) input.placeholder = label;
      if (input.getAttribute('aria-label') !== label) input.setAttribute('aria-label', label);
    };
    apply();

    const observer = new MutationObserver(apply);
    observer.observe(input, {attributes: true, attributeFilter: ['placeholder', 'aria-label']});
    return () => observer.disconnect();
  }, [label]);

  return <OriginalSearchBar {...props} />;
}
