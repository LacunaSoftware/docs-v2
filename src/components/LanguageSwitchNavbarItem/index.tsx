import type {ReactNode} from 'react';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

export default function LanguageSwitchNavbarItem(): ReactNode {
  const {pathname} = useLocation();
  const {siteConfig: {baseUrl}} = useDocusaurusContext();
  // The router pathname includes the site baseUrl; strip it so detection and
  // the prefix-swap below work under any baseUrl ('/' or '/docs-v2/').
  const rel = pathname.startsWith(baseUrl) ? `/${pathname.slice(baseUrl.length)}` : pathname;

  const isEnDocs = rel.startsWith('/en-us/articles');
  const isEnApi  = rel.startsWith('/en-us/api');
  const isEnHome = rel === '/en-us/' || rel === '/en-us';
  const isEn = isEnDocs || isEnApi || isEnHome;

  // Build the equivalent page in the other language (baseUrl-relative). Both
  // languages use the same article paths (mirroring the classic site), so
  // flipping the locale prefix is enough. Portuguese is canonical at the root
  // (/articles, /api) but is also served under /pt-br/... — from there, switch
  // straight to /en-us/...
  let otherRel: string;
  if (isEnApi) {
    // API reference is language-neutral: same content, just flip the URL prefix.
    otherRel = rel.replace('/en-us/api', '/api');
  } else if (rel.startsWith('/pt-br/api')) {
    otherRel = rel.replace('/pt-br/api', '/en-us/api');
  } else if (rel.startsWith('/pt-br/articles')) {
    otherRel = rel.replace('/pt-br/articles', '/en-us/articles');
  } else if (rel.startsWith('/api')) {
    otherRel = rel.replace('/api', '/en-us/api');
  } else if (isEnDocs) {
    otherRel = rel.replace('/en-us/articles', '/articles');
  } else if (rel.startsWith('/articles')) {
    otherRel = rel.replace('/articles', '/en-us/articles');
  } else if (isEnHome) {
    otherRel = '/';
  } else {
    otherRel = '/en-us/';
  }

  // Rendered as a plain <a> (full reload), not a Docusaurus <Link>, on purpose:
  // a few articles exist in only one language, so the naive prefix-swap can
  // point at a page that doesn't exist in the other language. A raw anchor keeps
  // the switch working for the common case without failing the build's
  // broken-link check (and a full reload is fine when crossing docs instances).
  // Since it's not a <Link>, prepend the baseUrl ourselves.
  const href = `${baseUrl}${otherRel.replace(/^\//, '')}`;

  return (
    <div className={styles.wrap}>
      {isEn ? (
        <>
          <a href={href} className={styles.option}>PT</a>
          <span className={styles.sep}>|</span>
          <span className={styles.active}>EN</span>
        </>
      ) : (
        <>
          <span className={styles.active}>PT</span>
          <span className={styles.sep}>|</span>
          <a href={href} className={styles.option}>EN</a>
        </>
      )}
    </div>
  );
}
