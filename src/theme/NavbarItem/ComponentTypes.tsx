import ComponentTypes from '@theme-original/NavbarItem/ComponentTypes';
import LanguageSwitchNavbarItem from '@site/src/components/LanguageSwitchNavbarItem';
import {
  LocalizedDocNavbarItem,
  LocalizedDocDropdownNavbarItem,
} from '@site/src/components/LocalizedDocNavbarItem';

export default {
  ...ComponentTypes,
  'custom-languageSwitch': LanguageSwitchNavbarItem,
  'custom-docLink': LocalizedDocNavbarItem,
  'custom-docDropdown': LocalizedDocDropdownNavbarItem,
};
