import 'babel-polyfill';
import path from 'path';
import i18n from 'i18n';
import clientManager from '../src/ffi/client_manager';
import ffiLoader from '../src/ffi/ffi_loader';

i18n.configure({
  locales: ['en'],
  directory: path.resolve(__dirname, '../', 'locales'),
  objectNotation: true
});

i18n.setLocale('en');

// load ffi library
ffiLoader.loadLibrary()
// create unregistered client
  .then(() => clientManager.createUnregisteredClient())
  .catch((err) => {
    throw err;
  });
