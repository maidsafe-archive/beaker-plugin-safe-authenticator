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

class SystemUriLoader {
  constructor() {
    this[_libPath] = CONSTANTS.LIB_PATH.SYSTEM_URI[os.platform()];
    this[_ffiFunctions] = {
      open: [type.int32, ['string']],
      install: [type.int32, ['string',
        'string',
        'string',
        'string',
        'string',
        'string',
      ]],
    };
    this.lib = ffi.Library(path.resolve(__dirname, this[_libPath]), this[_ffiFunctions]);
  }

  registerUriScheme(appInfo, schemes) {
    const bundle = appInfo.bundle || appInfo.id;
    const exec = appInfo.exec ? appInfo.exec : process.execPath;
    const vendor = appInfo.vendor;
    const name = appInfo.name;
    const icon = appInfo.icon;
    const joinedSchemes = schemes.join ? schemes.join(',') : schemes;

    const ret = this.lib.install(bundle, vendor, name, exec, icon, joinedSchemes);
    if (ret === -1) {
      throw new Error(`Error occured installing: ${ret}`);
    }
  }

  openUri(str) {
    const ret = this.lib.open(str);
    if (ret === -1) {
      throw new Error(`Error occured opening ${str} : ${ret}`);
    }
  }
}

const loader = new SystemUriLoader();
export default loader;
