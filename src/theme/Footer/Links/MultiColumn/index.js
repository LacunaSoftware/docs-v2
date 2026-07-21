import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import LinkItem from '@theme/Footer/LinkItem';
import {useIsEnPage, localizeFooterText} from '@site/src/theme/footerLocale';

// Ejected from @docusaurus/theme-classic to localize the column titles by URL
// ("Produtos" → "Products" on /en-us). Item labels are localized by the swizzled
// Footer/LinkItem. See src/theme/footerLocale.ts for why this is URL-based.

function ColumnLinkItem({item}) {
  return item.html ? (
    <li
      className={clsx('footer__item', item.className)}
      // Developer provided the HTML, so assume it's safe.
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{__html: item.html}}
    />
  ) : (
    <li key={item.href ?? item.to} className="footer__item">
      <LinkItem item={item} />
    </li>
  );
}

function Column({column, isEn}) {
  return (
    <div
      className={clsx(
        ThemeClassNames.layout.footer.column,
        'col footer__col',
        column.className,
      )}>
      <div className="footer__title">{localizeFooterText(column.title, isEn)}</div>
      <ul className="footer__items clean-list">
        {column.items.map((item, i) => (
          <ColumnLinkItem key={i} item={item} />
        ))}
      </ul>
    </div>
  );
}

export default function FooterLinksMultiColumn({columns}) {
  const isEn = useIsEnPage();
  return (
    <div className="row footer__links">
      {columns.map((column, i) => (
        <Column key={i} column={column} isEn={isEn} />
      ))}
    </div>
  );
}
