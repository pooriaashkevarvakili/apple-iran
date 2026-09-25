import type { Dataset } from '../../type';

export const seedData: Dataset = {
  languages: [
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'fa', name: 'فارسی', dir: 'rtl' },
    { code: 'de', name: 'Deutsch', dir: 'ltr' }
  ],
  keywords: [
    { id: 'kw_app_title',     key: 'app.title',       translations: { en: 'Translation Manager',    fa: 'مدیریت ترجمه',         de: 'Übersetzungsverwaltung' } },
    { id: 'kw_app_welcome',   key: 'app.welcome',     translations: { en: 'Welcome back',           fa: 'خوش آمدید',            de: 'Willkommen zurück' } },
    { id: 'kw_auth_login',    key: 'auth.login',      translations: { en: 'Log in',                 fa: 'ورود',                 de: 'Anmelden' } },
    { id: 'kw_auth_logout',   key: 'auth.logout',     translations: { en: 'Log out',                fa: 'خروج',                 de: 'Abmelden' } },
    { id: 'kw_nav_dash',      key: 'nav.dashboard',   translations: { en: 'Dashboard',              fa: 'داشبورد',              de: 'Übersicht' } },
    { id: 'kw_nav_profile',   key: 'nav.profile',     translations: { en: 'Profile',                fa: 'پروفایل',              de: 'Profil' } },
    { id: 'kw_nav_settings',  key: 'nav.settings',    translations: { en: 'Settings',               fa: 'تنظیمات',              de: 'Einstellungen' } },
    { id: 'kw_common_search', key: 'common.search',   translations: { en: 'Search',                 fa: 'جستجو',                de: 'Suchen' } },
    { id: 'kw_common_save',   key: 'common.save',     translations: { en: 'Save changes',           fa: 'ذخیره تغییرات',        de: 'Änderungen speichern' } },
    { id: 'kw_common_cancel', key: 'common.cancel',   translations: { en: 'Cancel',                 fa: 'انصراف',               de: 'Abbrechen' } },
    { id: 'kw_err_required',  key: 'error.required',  translations: { en: 'This field is required', fa: 'این فیلد الزامی است',  de: 'Dieses Feld ist erforderlich' } },
    { id: 'kw_empty_state',   key: 'common.empty',    translations: { en: 'Nothing here yet',       fa: '',                     de: 'Noch nichts vorhanden' } }
  ]
};