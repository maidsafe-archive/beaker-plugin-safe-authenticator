import path from 'path';
import i18n from 'i18n';
import safeAuthApi from './src/api';
import ffiLoader from './src/ffi/ffi_loader';
import clientManager from './src/ffi/client_manager';
import safeAuthProtocol from './src/protocols/safe_auth';

i18n.configure({
  locales: ['en'],
  directory: path.resolve(__dirname, 'locales'),
  objectNotation: true
});

i18n.setLocale('en');

// load ffi library
ffiLoader.loadLibrary()
// create unregistered client
  .then(() => clientManager.createUnregisteredClient())
  // TODO notify on browser
  .catch((err) => console.error(err));

module.exports = {
  configure() {
  },
  homePages: [{
    label: 'SAFE Network',
    href: 'https://safenetforum.org/t/safe-network-alpha-release/10687/1'
  }],
  protocols: [safeAuthProtocol],
  webAPIs: safeAuthApi
};
