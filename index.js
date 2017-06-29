const api = require('./dist/api');
const safeAuthProtocol = require('./dist/protocol');

// load ffi library
api.ffi.ffiLoader.loadLibrary()
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
