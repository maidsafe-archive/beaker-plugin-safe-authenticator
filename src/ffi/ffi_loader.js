/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
import CONST from './constants.json';

class FfiLoader {
  constructor() {
    this.mods = [];
  }

  loadLibrary(libPath = CONST.DEFAULT_LIB_PATH) {
    return new Promise((resolve) => {
      // const ffiFunctions = {};
      //
      // // Load all modules
      // this.mods.forEach(() => {});
      //
      // const safeCore = ffi.Library(libPath, ffiFunctions);
      //
      // this.mods.forEach(mod => {
      //   if (!(mod instanceof FfiApi)) {
      //     return;
      //   }
      //   mod.setSafeCore(safeCore);
      // });

      resolve();
    });
  }
}

const ffiLoader = new FfiLoader();
export default ffiLoader;
