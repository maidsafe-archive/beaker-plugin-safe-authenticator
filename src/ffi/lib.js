/**
 * LibLoader class to load APIs
 */
/* eslint-disable no-underscore-dangle */
import ffi from 'ffi';
import os from 'os';
import path from 'path';

import SafeLib from './safe_lib';
import authenticator from './authenticator';
import CONSTANTS from '../constants';

const _mods = Symbol('_mods');
const _libPath = Symbol('_libPath');

class LibLoader {
  constructor() {
    this[_mods] = [authenticator];
    this[_libPath] = CONSTANTS.LIB_PATH.SAFE_AUTH[os.platform()];
  }

  load() {
    const safeLib = {};
    const RTLD_NOW = ffi.DynamicLibrary.FLAGS.RTLD_NOW;
    const RTLD_GLOBAL = ffi.DynamicLibrary.FLAGS.RTLD_GLOBAL;
    const mode = RTLD_NOW || RTLD_GLOBAL;

    let ffiFunctions = {};
    let fnsToRegister;
    let fnDefinition;

    // Load all modules
    this[_mods].forEach((mod) => {
      if (!(mod instanceof SafeLib)) {
        return;
      }
      fnsToRegister = mod.fnsToRegister();
      if (!fnsToRegister) {
        return;
      }
      ffiFunctions = Object.assign({}, ffiFunctions, fnsToRegister);
    });

    return new Promise((resolve, reject) => {
      try {
        if (os.platform() === 'win32') {
          ffi.DynamicLibrary(path.resolve(__dirname, CONSTANTS.LIB_PATH.PTHREAD), mode);
        }

        const lib = ffi.DynamicLibrary(path.resolve(__dirname, this[_libPath]), mode);
        Object.keys(ffiFunctions).forEach((fnName) => {
          fnDefinition = ffiFunctions[fnName];
          safeLib[fnName] = ffi.ForeignFunction(lib.get(fnName),
            fnDefinition[0], fnDefinition[1]);
        });
        this[_mods].forEach((mod) => {
          if (!(mod instanceof SafeLib)) {
            return;
          }
          mod.safeLib = safeLib;
        });
        resolve();
      } catch (err) {
        return reject(err);
      }
    });
  }
}

const libLoader = new LibLoader();
export default libLoader;
