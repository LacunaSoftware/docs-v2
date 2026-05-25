import type {ReactNode} from 'react';
import {useLocation} from '@docusaurus/router';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

export default function LanguageSwitchNavbarItem(): ReactNode {
  const {pathname} = useLocation();

  const isEn = pathname.startsWith('/docusaurus/docs/en/');

  // Build the equivalent page in the other language
  const otherPath = isEn
    ? pathname.replace('/docusaurus/docs/en/', '/docusaurus/docs/')
    : pathname.replace('/docusaurus/docs/', '/docusaurus/docs/en/');

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
