import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

// English overrides for footer strings that are authored in Portuguese in
// docusaurus.config.ts. The site runs a single Docusaurus locale (pt-BR) and
// serves English under the /en-us URL prefix (not as a real locale), so footer
// titles/labels can't be switched through i18n — we translate them by URL,
// exactly like the navbar and footer links already do. Only strings that differ
// are listed here; product/brand names ("PKI", "Signer", "Lacuna Software", …)
// are identical in both languages and pass through unchanged.
const FOOTER_EN: Record<string, string> = {
  'Produtos': 'Products',
  'Certificação Digital': 'Digital Certification',
  'Site oficial': 'Official website',
  'Suporte': 'Support',
};

// True on English pages (served under /en-us). Strips the site baseUrl first so
// detection works under any baseUrl ('/' or '/docs-v2/').
export function useIsEnPage(): boolean {
  const {pathname} = useLocation();
  const {siteConfig: {baseUrl}} = useDocusaurusContext();
  const rel = pathname.startsWith(baseUrl) ? `/${pathname.slice(baseUrl.length)}` : pathname;
  return rel === '/en-us' || rel.startsWith('/en-us/');
}

export function localizeFooterText(text: string | undefined, isEn: boolean): string | undefined {
  if (!text || !isEn) return text;
  return FOOTER_EN[text] ?? text;
}
