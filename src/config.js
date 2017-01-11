import path from 'path';
import i18n from 'i18n';

export default {
  i18n: () => {
    i18n.configure({
      locales: ['en'],
      directory: path.resolve(__dirname, '../../', 'locales'),
      objectNotation: true,
      logWarnFn: function (msg) {
        console.warn('warn', msg);
      }
    });
    i18n.setLocale('en');
  }
};
