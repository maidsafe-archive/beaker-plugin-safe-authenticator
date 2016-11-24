/* eslint-disable no-underscore-dangle */
import FfiApi from './FfiApi';
import CONST from './constants.json';

const _networkState = Symbol('networkState');
const _networkStateChangeListener = Symbol('networkStateChangeListener');
const _clientHandle = Symbol('clientHandle');

class ClientManager extends FfiApi {
  static manifest = {
    setNetworkListener: 'sync',
    login: 'promise',
    createAccount: 'promise'
  };

  static _isUserCredentialsValid(locator, secret) {
    if (typeof locator !== 'string' || typeof secret !== 'string') {
      return { isValid: false, msg: 'Locator or Secret must be of string' };
    }

    const userLocator = locator.trim();
    const userSecret = secret.trim();

    if (!(userLocator && userSecret)) {
      return { isValid: false, msg: 'Locator or Secret should not be empty' };
    }

    return { isValid: true };
  }

  constructor() {
    super();
    this[_networkState] = CONST.NETWORK_STATES.DISCONNECTED;
    this[_networkStateChangeListener] = null;
    this[_clientHandle] = null;
  }

  set clientHandle(handle) {
    this[_clientHandle] = handle;
  }

  get clientHandle() {
    return this[_clientHandle];
  }

  /**
   * Set SAFE Network connectivity state listener
   * @param cb - callback to be invoked on network state change
   */
  setNetworkListener(cb) {
    if (typeof cb !== 'function') {
      throw new Error('Network listener callback should be a function');
    }
    this.networkStateChangeListener = cb;
    this.networkStateChangeListener(this.networkState);
  }

  /*
   * Create unregistered client
   * */
  createUnregisteredClient() {
    this.networkState = CONST.NETWORK_STATES.CONNECTING;

    // const onStateChange = ffi.Callback(Void, [int32], (state) => {
    //   this.networkState = state;
    //   if (this.networkStateChangeListener) {
    //     this.networkStateChangeListener(state);
    //   }
    // });

    // TODO create unregistered client

    this.networkState = CONST.NETWORK_STATES.CONNECTED;
    this.networkStateChangeListener(this.networkState);
  }

  /**
   * User login
   * @param {string} locator
   * @param {string} secret
   * @returns {Promise}
   */
  login(locator, secret) {
    const executor = (resolve, reject) => {
      const credentialsValid = this._isUserCredentialsValid(locator, secret);
      if (!credentialsValid.isValid) {
        return reject(credentialsValid.msg);
      }

      this.clientHandle = 1; // TODO set authorised client handle id
      return resolve();
    };

    return new Promise(executor);
  }

  /**
   * Create new account
   * @param {string} locator
   * @param {string} secret
   * @returns {Promise}
   */
  createAccount(locator, secret) {
    const executor = (resolve, reject) => {
      const credentialsValid = this._isUserCredentialsValid(locator, secret);
      if (!credentialsValid.isValid) {
        return reject(credentialsValid.msg);
      }

      this.clientHandle = 1; // TODO set authorised client handle id
      return resolve();
    };

    return new Promise(executor);
  }

  /*
   * Drop client handle
   * */
  dropHandle() {
    // TODO drop client handle
    this.handleId = null;
  }
}

const clientManager = new ClientManager();
export default clientManager;
