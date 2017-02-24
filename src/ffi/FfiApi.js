export default class FfiApi {
  constructor() {
    this.safeLib = null;
  }

  setSafeLib(safeLib) {
    this.safeLib = safeLib;
  }
  // Abstract methods
  /* eslint-disable class-methods-use-this */
  /* eslint-disable no-unused-vars */
  drop(safeLib) {}
  /* eslint-enable no-unused-vars */
  getFunctionsToRegister() {}
  /* eslint-enable class-methods-use-this */
}
