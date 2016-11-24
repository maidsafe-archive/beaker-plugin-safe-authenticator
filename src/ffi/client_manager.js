/* eslint-disable no-underscore-dangle */
import i18n from 'i18n';
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
      throw new Error(i18n.__('messages.must_be_function', i18n.__('Network listener callback')));
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
    return new Promise((resolve, reject) => {
      const credentialsValid = this._isUserCredentialsValid(locator, secret);
      if (credentialsValid instanceof Error) {
        return reject(credentialsValid);
      }

      this.clientHandle = 1; // TODO set authorised client handle id
      return resolve();
    });
  }

  /**
   * Create new account
   * @param {string} locator
   * @param {string} secret
   * @returns {Promise}
   */
  createAccount(locator, secret) {
    return new Promise((resolve, reject) => {
      const credentialsValid = this._isUserCredentialsValid(locator, secret);
      if (credentialsValid instanceof Error) {
        return reject(credentialsValid);
      }

      this.clientHandle = 1; // TODO set authorised client handle id
      return resolve();
    });
  }

  /*
   * Drop client handle
   * */
  dropHandle() {
    // TODO drop client handle
    this.handleId = null;
  }

  /* eslint-disable class-methods-use-this */
  _isUserCredentialsValid(locator, secret) {
    if (typeof locator !== 'string' || typeof secret !== 'string') {
      return new Error(i18n.__('messages.must_be_string', i18n.__('Locator or Secret')));
    }

    const userLocator = locator.trim();
    const userSecret = secret.trim();

    if (!(userLocator && userSecret)) {
      return new Error(i18n.__('messages.should_not_be_empty', i18n.__('Locator or Secret')));
    }
  }
  /* eslint-enable class-methods-use-this */
}

const clientManager = new ClientManager();
export default clientManager;
