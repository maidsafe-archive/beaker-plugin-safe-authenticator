import path from 'path';
import fs from 'fs';
import url from 'url';
/* eslint-disable import/extensions */
import { protocol, app } from 'electron';
/* eslint-enable import/extensions */
import sysUri from '../ffi/sys_uri';

const safeAuthScheme = 'safe-auth';

const isDevMode = process.execPath.match(/[\\/]electron/);

const appInfo = {
  id: 'net.maidsafe.app.browser.authenticator',
  exec: isDevMode ? [process.execPath, app.getAppPath()] : [app.getPath('exe')],
  vendor: 'MaidSafe.net Ltd',
  name: 'SAFE Browser Authenticator plugin',
  icon: 'iconPath'
};

// OSX: Add bundle for electron in dev mode
if (isDevMode && process.platform === 'darwin') {
  appInfo.bundle = 'com.github.electron';
}

const registerSafeAuthProtocol = () => {
  sysUri.registerUriScheme(appInfo, safeAuthScheme);

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
      case '/favicon.png':
        cb({
          mimeType: 'image/png',
          data: fs.readFileSync(path.resolve(__dirname, 'favicon.png'))
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
