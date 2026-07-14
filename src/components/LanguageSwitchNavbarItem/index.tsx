import type {ReactNode} from 'react';
import {useLocation} from '@docusaurus/router';
import styles from './styles.module.css';

export default function LanguageSwitchNavbarItem(): ReactNode {
  const {pathname} = useLocation();

  const isEnDocs = pathname.startsWith('/en-us/articles');
  const isEnApi  = pathname.startsWith('/en-us/api');
  const isEnHome = pathname === '/en-us/' || pathname === '/en-us';
  const isEn = isEnDocs || isEnApi || isEnHome;

  // Build the equivalent page in the other language. Both languages use the
  // same article paths (mirroring the classic site), so flipping the locale
  // prefix is enough. Portuguese is canonical at the root (/articles, /api) but
  // is also served under /pt-br/... — from there, switch straight to /en-us/...
  //
  // Rendered as a plain <a> (full reload), not a Docusaurus <Link>, on purpose:
  // a few articles exist in only one language, so the naive prefix-swap can
  // point at a page that doesn't exist in the other language. A raw anchor keeps
  // the switch working for the common case without failing the build's
  // broken-link check (and a full reload is fine when crossing docs instances).
  let otherPath: string;
  if (isEnApi) {
    // API reference is language-neutral: same content, just flip the URL prefix.
    otherPath = pathname.replace('/en-us/api', '/api');
  } else if (pathname.startsWith('/pt-br/api')) {
    otherPath = pathname.replace('/pt-br/api', '/en-us/api');
  } else if (pathname.startsWith('/pt-br/articles')) {
    otherPath = pathname.replace('/pt-br/articles', '/en-us/articles');
  } else if (pathname.startsWith('/api')) {
    otherPath = pathname.replace('/api', '/en-us/api');
  } else if (isEnDocs) {
    otherPath = pathname.replace('/en-us/articles', '/articles');
  } else if (pathname.startsWith('/articles')) {
    otherPath = pathname.replace('/articles', '/en-us/articles');
  } else if (isEnHome) {
    otherPath = '/';
  } else {
    otherPath = '/en-us/';
  }

  return (
    <div className={styles.wrap}>
      {isEn ? (
        <>
          <a href={otherPath} className={styles.option}>PT</a>
          <span className={styles.sep}>|</span>
          <span className={styles.active}>EN</span>
        </>
      ) : (
        <>
          <span className={styles.active}>PT</span>
          <span className={styles.sep}>|</span>
          <a href={otherPath} className={styles.option}>EN</a>
        </>
      )}
    </div>
  );
}
