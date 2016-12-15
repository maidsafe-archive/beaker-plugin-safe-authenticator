import path from 'path';
import fs from 'fs';
import url from 'url';
/* eslint-disable import/extensions */
import { protocol } from 'electron';
/* eslint-enable import/extensions */
import rpc from 'pauls-electron-rpc';
import safeAuthRpc from './safe_auth_rpc';

const safeAuthScheme = 'safeauth';

const DIST_PATH = __dirname;

// Register safeAuth RPC
const rpcApi = rpc.exportAPI(safeAuthRpc.channelName, safeAuthRpc.manifest, {
  authDecision: safeAuthRpc.authDecision
});

// Handle safeAuth RPC error
rpcApi.on('error', console.error);

const registerSafeAuthProtocol = () => {
  protocol.registerBufferProtocol(safeAuthScheme, (req, cb) => {
    const parsedUrl = url.parse(req.url);
    switch (parsedUrl.pathname) {
      case '/bundle.js':
        cb({
          mimeType: 'application/javascript',
          data: fs.readFileSync(path.resolve(DIST_PATH, 'bundle.js'))
        });
        break;
      case '/bundle.js.map':
        cb({
          mimeType: 'application/octet-stream',
          data: fs.readFileSync(path.resolve(DIST_PATH, 'bundle.js.map'))
        });
        break;
      default:
        cb({ mimeType: 'text/html', data: fs.readFileSync(path.resolve(DIST_PATH, 'app.html')) });
        break;
    }
  }, (err) => {
    if (err) console.error('Failed to register protocol');
  });
};

const scheme = {
  scheme: safeAuthScheme,
  label: 'SAFE Authenticator',
  isStandardURL: true,
  isInternal: true,
  register: registerSafeAuthProtocol
};
export default scheme;
