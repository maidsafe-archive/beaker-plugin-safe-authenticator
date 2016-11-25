import 'babel-polyfill';
import path from 'path';
import i18n from 'i18n';

i18n.configure({
  locales: ['en'],
  directory: path.resolve(__dirname, '../', 'locales'),
  objectNotation: true
});

i18n.setLocale('en');
