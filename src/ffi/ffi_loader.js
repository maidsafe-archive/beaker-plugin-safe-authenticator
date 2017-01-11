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
      this.mods.forEach((mod) => {
        if (!(mod instanceof FfiApi)) {
          return;
        }
        const functionsToRegister = mod.getFunctionsToRegister();
        if (!functionsToRegister) {
          return;
        }
        ffiFunctions = Object.assign({}, ffiFunctions, functionsToRegister);
      });

      const safeCore = ffi.Library(path.resolve(__dirname, libPath), ffiFunctions);

      this.mods.forEach((mod) => {
        if (!(mod instanceof FfiApi)) {
          return;
        }
        mod.setSafeCore(safeCore);
      });

      resolve();
    });
  }
}

const ffiLoader = new FfiLoader();
export default ffiLoader;
