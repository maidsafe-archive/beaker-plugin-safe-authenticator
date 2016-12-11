import path from 'path';
import fs from 'fs';
import url from 'url';
/* eslint-disable import/extensions */
import { protocol, ipcMain } from 'electron';
/* eslint-enable import/extensions */
const safeAuthScheme = 'safe-auth';

const DIST_PATH = __dirname;

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
