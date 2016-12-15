import 'babel-polyfill';
import path from 'path';
import i18n from 'i18n';
import ffiLoader from '../src/beaker/ffi/ffi_loader';

i18n.configure({
  locales: ['en'],
  directory: path.resolve(__dirname, '../', 'locales'),
  objectNotation: true
});

i18n.setLocale('en');

const init = async () => {
  try {
    // load ffi library
    await ffiLoader.loadLibrary();
  } catch (e) {
    throw (e);
  }
};

init();
