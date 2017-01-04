const path = require('path');
const i18n = require('i18n');
const api = require('./dist/api');
const safeAuthProtocol = require('./dist/protocol');
const safeAuthRpc = require('./dist/safeauth_rpc');

safeAuthRpc(api.ffi.client);

i18n.configure({
  locales: ['en'],
  directory: path.resolve(__dirname, 'locales'),
  objectNotation: true,
  logWarnFn: function (msg) {
    console.log('warn', msg);
  }
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
