/**
 * SafeLib class - base class for other lib classes
 */
/* eslint-disable no-underscore-dangle */
// Private variables
const _safeLib = Symbol('safeLib');

export default class SafeLib {
  constructor() {
    this[_safeLib] = null;
  }

  set safeLib(lib) {
    this[_safeLib] = lib;
  }

  get safeLib() {
    return this[_safeLib];
  }

  // Abstract methods
  /* eslint-disable class-methods-use-this */
  /* eslint-disable no-unused-vars */
  drop(safeLib) {}
  /* eslint-enable no-unused-vars */
  fnsToRegister() {}
  /* eslint-enable class-methods-use-this */
}
