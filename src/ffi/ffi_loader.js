/* eslint-disable import/no-unresolved, import/extensions */
import ffi from 'ffi';
/* eslint-enable import/no-unresolved, import/extensions */
import os from 'os';
import path from 'path';
import clientManager from './client_manager';
import CONST from './../constants.json';
import FfiApi from './FfiApi';

class FfiLoader {
  constructor() {
    this.mods = [clientManager];
  }

  loadLibrary(libPath = CONST.DEFAULT_LIB_PATH[os.platform()]) {
    return new Promise((resolve) => {
      let ffiFunctions = {};

      // Load all modules
      let functionsToRegister;
      this.mods.forEach((mod) => {
        if (!(mod instanceof FfiApi)) {
          return;
        }
        functionsToRegister = mod.getFunctionsToRegister();
        if (!functionsToRegister) {
          return;
        }
        ffiFunctions = Object.assign({}, ffiFunctions, functionsToRegister);
      });
      try {
          let safeCore;
          // safeCore = ffi.Library(path.resolve(__dirname, libPath), ffiFunctions);

          const RTLD_NOW = ffi.DynamicLibrary.FLAGS.RTLD_NOW;
          const RTLD_GLOBAL = ffi.DynamicLibrary.FLAGS.RTLD_GLOBAL;
          const mode = RTLD_NOW | RTLD_GLOBAL;

          safeCore = {};
          if (os.platform() === 'win32') {
            ffi.DynamicLibrary(path.resolve(__dirname, 'libwinpthread-1'), mode);
          }
          const lib = ffi.DynamicLibrary(path.resolve(__dirname, 'safe_authenticator'), mode);
          let funcDefinition;
          Object.keys(ffiFunctions).forEach(funcName => {
              funcDefinition = ffiFunctions[funcName];
              safeCore[funcName] = ffi.ForeignFunction(lib.get(funcName), funcDefinition[0], funcDefinition[1]);
          });

          this.mods.forEach((mod) => {
            if (!(mod instanceof FfiApi)) {
              return;
            }
            mod.setSafeCore(safeCore);
          });

          resolve();
      } catch(e) {
        reject(e);
      }
    });
  }
}

const ffiLoader = new FfiLoader();
export default ffiLoader;
