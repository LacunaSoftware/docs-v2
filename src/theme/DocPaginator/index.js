import React from 'react';
import clsx from 'clsx';
import {translate} from '@docusaurus/Translate';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import PaginatorNavLink from '@theme/PaginatorNavLink';

// Ejected from @docusaurus/theme-classic to make the Previous/Next sublabels
// follow the page language. The site is single-locale (pt-BR) but serves English
// under /en-us, so the theme's <Translate> would print one language site-wide.
// We pick the labels from the current path instead, like the navbar/footer.
export default function DocPaginator(props) {
  const {className, previous, next} = props;
  const {pathname} = useLocation();
  const {siteConfig: {baseUrl}} = useDocusaurusContext();
  const rel = pathname.startsWith(baseUrl) ? `/${pathname.slice(baseUrl.length)}` : pathname;
  const isEn = rel === '/en-us' || rel.startsWith('/en-us/');
  return (
    <nav
      className={clsx(className, 'pagination-nav')}
      aria-label={translate({
        id: 'theme.docs.paginator.navAriaLabel',
        message: 'Docs pages',
        description: 'The ARIA label for the docs pagination',
      })}>
      {previous && (
        <PaginatorNavLink
          {...previous}
          subLabel={isEn ? 'Previous' : 'Anterior'}
        />
      )}
      {next && (
        <PaginatorNavLink
          {...next}
          subLabel={isEn ? 'Next' : 'Próximo'}
          isNext
        />
      )}
    </nav>
  );
}
