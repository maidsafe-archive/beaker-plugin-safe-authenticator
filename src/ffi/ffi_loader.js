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

      /* eslint-disable arrow-parens */
      this.mods.forEach(mod => {
      //   if (!(mod instanceof FfiApi)) {
      //     return;
      //   }
      //   mod.setSafeCore(safeCore);
      });
      /* eslint-enable arrow-parens */

      resolve();
    });
  }
}

const ffiLoader = new FfiLoader();
export default ffiLoader;
