const path = require('path');
const i18n = require('i18n');
const api = require('./dist/api').default;
const safeAuthProtocol = require('./dist/protocol').default;

i18n.configure({
  locales: ['en'],
  directory: path.resolve(__dirname, 'locales'),
  objectNotation: true
});

i18n.setLocale('en');

// load ffi library
api.ffi.ffiLoader.loadLibrary()
// create unregistered client
  .then(() => api.ffi.client.createUnregisteredClient())
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
  webAPIs: api.safeAuthApi
};
