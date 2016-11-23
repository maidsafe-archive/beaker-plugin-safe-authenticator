import safeAuthApi from './src/api';
import ffiLoader from './src/ffi/ffi_loader';
import clientManager from './src/ffi/client_manager';

// load ffi library
ffiLoader.loadLibrary()
// create unregistered client
  .then(() => clientManager.createUnregisteredClient())
  // TODO notify on browser
  .catch(err => console.error(err));

module.exports = {
  configure() {},
  homePages: [{
    label: 'SAFE Network',
    href: 'https://safenetforum.org/t/safe-network-alpha-release/10687/1'
  }],
  protocols: [],
  webAPIs: safeAuthApi
};
