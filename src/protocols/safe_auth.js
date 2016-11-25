import path from 'path';
import fs from 'fs';
/* eslint-disable import/extensions */
import { protocol, ipcMain, shell } from 'electron';
/* eslint-enable import/extensions */
import clientManager from '../ffi/client_manager';

const safeAuthScheme = 'safeauth';
const DIST_PATH = path.resolve(__dirname, '..', '..', 'dist');

// Allow application
ipcMain.on('allow-app', (event, url) => {
  const authData = url.split(':'); // url = scheme:action:appId:payload
  clientManager.authoriseApp(authData[3])
    .then((res) => {
      shell.openExternal(res);
      event.sender.send('allow-app-res', true);
    }, (err) => {
      event.sender.send('allow-app-err', err);
    });
});

const registerSafeAuthProtocol = () => {
  protocol.registerBufferProtocol(safeAuthScheme, (req, cb) => {
    const url = new URL(req.url);

    switch (url.pathname) {
      case '//home/bundle.js':
        cb({
          mimeType: 'application/javascript',
          data: fs.readFileSync(path.resolve(DIST_PATH, 'bundle.js'))
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
