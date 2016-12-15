import CONST from './constants.json';

class FfiLoader {
  constructor() {
    this.mods = [];
  }
  /* eslint-disable no-unused-vars */
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
    /* eslint-enable no-unused-vars */
  }
}

const ffiLoader = new FfiLoader();
export default ffiLoader;
