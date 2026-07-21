import React from 'react';
import {ThemeClassNames} from '@docusaurus/theme-common';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import IconEdit from '@theme/Icon/Edit';

// Ejected from @docusaurus/theme-classic to make the label follow the page
// language. The site is single-locale (pt-BR) but serves English under /en-us,
// so the theme's <Translate> would print one language site-wide. We pick the
// label from the current path instead, like the navbar/footer.
export default function EditThisPage({editUrl}) {
  const {pathname} = useLocation();
  const {siteConfig: {baseUrl}} = useDocusaurusContext();
  const rel = pathname.startsWith(baseUrl) ? `/${pathname.slice(baseUrl.length)}` : pathname;
  const isEn = rel === '/en-us' || rel.startsWith('/en-us/');
  return (
    <Link to={editUrl} className={ThemeClassNames.common.editThisPage}>
      <IconEdit />
      {isEn ? 'Edit this page' : 'Editar esta página'}
    </Link>
  );
}
