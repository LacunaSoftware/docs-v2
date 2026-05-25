import type {ReactNode} from 'react';
import {useLocation} from '@docusaurus/router';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

export default function LanguageSwitchNavbarItem(): ReactNode {
  const {pathname} = useLocation();

  const isEn = pathname.startsWith('/docs-v2/docs/en/');

  // Build the equivalent page in the other language
  const otherPath = isEn
    ? pathname.replace('/docs-v2/docs/en/', '/docs-v2/docs/')
    : pathname.replace('/docs-v2/docs/', '/docs-v2/docs/en/');

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
