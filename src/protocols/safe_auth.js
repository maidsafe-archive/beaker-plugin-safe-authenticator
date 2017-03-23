import path from 'path';
import fs from 'fs';
import url from 'url';
/* eslint-disable import/extensions */
import { protocol, app } from 'electron';
/* eslint-enable import/extensions */
import client from '../ffi/client_manager';

const safeAuthScheme = 'safe-auth';

const isDevMode = process.execPath.match(/[\\/]electron/);

const appInfo = {
  id: 'net.maidsafe.safebrowser',
  exec: isDevMode ? process.execPath + ' ' + app.getAppPath() : app.getPath('exe'),
  vendor: 'maidsafe',
  name: 'safe-browser',
  icon: 'iconPath'
};

const registerSafeAuthProtocol = () => {
  client.registerUriScheme(appInfo, safeAuthScheme);

  protocol.registerBufferProtocol(safeAuthScheme, (req, cb) => {
    const parsedUrl = url.parse(req.url);
    switch (parsedUrl.pathname) {
      case '/bundle.js':
        cb({
          mimeType: 'application/javascript',
          data: fs.readFileSync(path.resolve(__dirname, 'bundle.js'))
        });
        break;
      case '/bundle.js.map':
        cb({
          mimeType: 'application/octet-stream',
          data: fs.readFileSync(path.resolve(__dirname, 'bundle.js.map'))
        });
        break;
      default:
        cb({ mimeType: 'text/html', data: fs.readFileSync(path.resolve(__dirname, 'app.html')) });
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
