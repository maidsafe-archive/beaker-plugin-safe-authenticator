export default class FfiApi {
  constructor() {
    this.safeCore = null;
  }

  setSafeCore(safeCore) {
    this.safeCore = safeCore;
  }
  // Abstract methods
  /* eslint-disable class-methods-use-this */
  /* eslint-disable no-unused-vars */
  drop(safeCore) {}
  /* eslint-enable no-unused-vars */
  getFunctionsToRegister() {}
  /* eslint-enable class-methods-use-this */
}
