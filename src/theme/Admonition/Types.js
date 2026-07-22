import React from 'react';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import DefaultAdmonitionTypes from '@theme-original/Admonition/Types';
import IconWarning from '@theme/Admonition/Icon/Warning';

// Default (author-less) admonition labels per language.
const TITLES = {
  note:    {pt: 'observação',    en: 'note'},
  tip:     {pt: 'dica',    en: 'tip'},
  info:    {pt: 'info',    en: 'info'},
  warning: {pt: 'aviso',   en: 'warning'},
  danger:  {pt: 'perigo',  en: 'danger'},
  caution: {pt: 'cuidado', en: 'caution'},
};

function useLang() {
  const {pathname} = useLocation();
  const {siteConfig: {baseUrl}} = useDocusaurusContext();

  const rel = pathname.startsWith(baseUrl) ? `/${pathname.slice(baseUrl.length)}` : pathname;
  return rel === '/en-us' || rel.startsWith('/en-us/') ? 'en' : 'pt';
}

// Wrap an original admonition type so its default title follows the page language.
function localized(key, Original) {
  return function LocalizedAdmonition(props) {
    const lang = useLang();
    return <Original {...props} title={props.title ?? TITLES[key][lang]} />;
  };
}

// GitHub-style "Caution": reuses the Danger admonition (its red `alert
// alert--danger` color scheme) but swaps in the Warning triangle icon.
function CustomCaution(props) {
  const Danger = DefaultAdmonitionTypes.danger;
  const lang = useLang();
  return (
    <Danger
      {...props}
      icon={<IconWarning />}
      title={props.title ?? TITLES.caution[lang]}
    />
  );
}

const AdmonitionTypes = {
  ...DefaultAdmonitionTypes,

  note:    localized('note',    DefaultAdmonitionTypes.note),
  tip:     localized('tip',     DefaultAdmonitionTypes.tip),
  info:    localized('info',    DefaultAdmonitionTypes.info),
  warning: localized('warning', DefaultAdmonitionTypes.warning),
  danger:  localized('danger',  DefaultAdmonitionTypes.danger),

  caution: CustomCaution,
};

export default AdmonitionTypes;
