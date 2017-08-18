/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-unresolved, import/extensions */
import ffi from 'ffi';
/* eslint-enable import/no-unresolved, import/extensions */
import os from 'os';
import path from 'path';
import CONSTANTS from '../constants';
import * as type from './refs/types';

const _ffiFunctions = Symbol('ffiFunctions');
const _libPath = Symbol('libPath');
const _isLibLoaded = Symbol('isLibLoaded');

class SystemUriLoader {
  constructor() {
    this[_libPath] = CONSTANTS.LIB_PATH.SYSTEM_URI[os.platform()];
    this[_ffiFunctions] = {
      open: [type.Void, ['string', 'pointer', 'pointer']],
      install: [type.Void, ['string',
        'string',
        'string',
        'string',
        'string',
        'string',
        'pointer',
        'pointer'
      ]],
    };
    this[_isLibLoaded] = false;
    this.lib = null;
  }

  get isLibLoaded() {
    return this[_isLibLoaded];
  }

  load() {
    try {
      this.lib = ffi.Library(path.resolve(__dirname, this[_libPath]), this[_ffiFunctions]);
      this[_isLibLoaded] = true;
    } catch (err) {
      this[_isLibLoaded] = false;
    }
  }

  registerUriScheme(appInfo, schemes) {
    const bundle = appInfo.bundle || appInfo.id;
    const exec = appInfo.exec ? appInfo.exec : process.execPath;
    const vendor = appInfo.vendor;
    const name = appInfo.name;
    const icon = appInfo.icon;
    const joinedSchemes = schemes.join ? schemes.join(',') : schemes;

    if (!this.lib) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const cb = this._handleError(resolve, reject);
        this.lib.install(bundle, vendor, name, exec, icon, joinedSchemes, type.Null, cb);
      } catch (err) {
        return reject(err);
      }
    });
  }

  openUri(str) {
    if (!this.lib) {
      return;
    }
    return new Promise((resolve, reject) => {
      try {
        const cb = this._handleError(resolve, reject);
        this.lib.open(str, type.Null, cb);
      } catch (err) {
        return reject(err);
      }
    });
  }

  _handleError(resolve, reject) {
    return ffi.Callback(type.Void, [type.voidPointer, type.FfiResult],
      (userData, result) => {
        if (result.error_code !== 0) {
          return reject(new Error(result.description));
        }
        return resolve();
      }
    );
  }
}

const loader = new SystemUriLoader();
loader.load();
export default loader;
