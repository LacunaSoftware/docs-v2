import type {ReactNode} from 'react';
import {useLocation} from '@docusaurus/router';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

export default function LanguageSwitchNavbarItem(): ReactNode {
  const {pathname} = useLocation();

  const isEnDocs = pathname.startsWith('/docs-v2/docs/en/');
  const isEnApi  = pathname.startsWith('/docs-v2/en/api');
  const isEnHome = pathname === '/docs-v2/en/' || pathname === '/docs-v2/en';
  const isEn = isEnDocs || isEnApi || isEnHome;

  // Build the equivalent page in the other language
  let otherPath: string;
  if (isEnApi) {
    // API reference is language-neutral: same content, just flip the URL prefix.
    otherPath = pathname.replace('/docs-v2/en/api', '/docs-v2/api');
  } else if (pathname.startsWith('/docs-v2/api')) {
    otherPath = pathname.replace('/docs-v2/api', '/docs-v2/en/api');
  } else if (isEnDocs) {
    otherPath = pathname.replace('/docs-v2/docs/en/', '/docs-v2/docs/');
  } else if (pathname.startsWith('/docs-v2/docs/')) {
    otherPath = pathname.replace('/docs-v2/docs/', '/docs-v2/docs/en/');
  } else if (isEnHome) {
    otherPath = '/docs-v2/';
  } else {
    otherPath = '/docs-v2/en/';
  }

  return (
    <div className={styles.wrap}>
      {isEn ? (
        <>
          <Link to={otherPath} className={styles.option}>PT</Link>
          <span className={styles.sep}>|</span>
          <span className={styles.active}>EN</span>
        </>
      ) : (
        <>
          <span className={styles.active}>PT</span>
          <span className={styles.sep}>|</span>
          <Link to={otherPath} className={styles.option}>EN</Link>
        </>
      )}
    </div>
  );
}
