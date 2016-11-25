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
    createAccount: 'promise',
    getAuthorisedApps: 'promise'
  };

  constructor() {
    super();
    this[_networkState] = CONST.NETWORK_STATES.DISCONNECTED;
    this[_networkStateChangeListener] = null;
    this[_clientHandle] = {};
  }

  setClientHandle(key, handle) {
    this[_clientHandle][key] = handle;
  }

  /**
   * Set SAFE Network connectivity state listener
   * @param cb - callback to be invoked on network state change
   */
  setNetworkListener(cb) {
    if (typeof cb !== 'function') {
      throw new Error(i18n.__('messages.must_be_function', i18n.__('Network listener callback')));
    }
    this[_networkStateChangeListener] = cb;
    this[_networkStateChangeListener](this[_networkState]);
  }

  /**
   * Authorise application
   * @param payload
   * @returns {Promise}
   */
  /* eslint-disable no-unused-vars, class-methods-use-this */
  authoriseApp(payload) {
    return new Promise((resolve, reject) => {
      /* eslint-enable no-unused-vars, class-methods-use-this */
      resolve();
    });
  }

  /**
   * Revoke application authorisation
   * @param appId
   * @returns {Promise}
   */
  /* eslint-disable class-methods-use-this */
  revokeApp(appId) {
    /* eslint-enable class-methods-use-this */
    return new Promise((resolve, reject) => {
      if (!appId) {
        return reject(new Error(i18n.__('messages.should_not_be_empty', i18n.__('AppId'))));
      }

      if (typeof appId !== 'string') {
        return reject(new Error(i18n.__('messages.must_be_string', i18n.__('AppId'))));
      }

      if (!appId.trim()) {
        return reject(new Error(i18n.__('messages.should_not_be_empty', i18n.__('AppId'))));
      }

      // TODO revoke application with appId
      resolve();
    });
  }

  /*
   * Create unregistered client
   * */
  createUnregisteredClient() {
    return new Promise((resolve) => {
      this.networkState = CONST.NETWORK_STATES.CONNECTING;

      // const onStateChange = ffi.Callback(Void, [int32], (state) => {
      //   this.networkState = state;
      //   if (this.networkStateChangeListener) {
      //     this.networkStateChangeListener(state);
      //   }
      // });

      // TODO create unregistered client

      this[_networkState] = CONST.NETWORK_STATES.CONNECTED;
      // TODO set unauthorised client handle id
      this.setClientHandle(CONST.DEFAULT_CLIENT_HANDLE_KEYS.UNAUTHORISED, 1);

      if (typeof this[_networkStateChangeListener] === 'function') {
        this[_networkStateChangeListener](this[_networkState]);
      }
      resolve();
    });
  }

  /**
   * User login
   * @param {string} locator
   * @param {string} secret
   * @returns {Promise}
   */
  login(locator, secret) {
    return new Promise((resolve, reject) => {
      const validationErr = this._isUserCredentialsValid(locator, secret);
      if (validationErr) {
        return reject(validationErr);
      }

      // TODO set authorised client handle id
      this.setClientHandle(CONST.DEFAULT_CLIENT_HANDLE_KEYS.AUTHENTICATOR, 1);
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
      const validationErr = this._isUserCredentialsValid(locator, secret);
      if (validationErr) {
        return reject(validationErr);
      }

      // TODO set authorised client handle id
      this.setClientHandle(CONST.DEFAULT_CLIENT_HANDLE_KEYS.AUTHENTICATOR, 1);
      return resolve();
    });
  }

  /**
   * Get list of authorised applications
   * @returns {Promise}
   */
  /* eslint-disable class-methods-use-this */
  getAuthorisedApps() {
    /* eslint-enable class-methods-use-this */
    return new Promise((resolve, reject) => {
      if (!this._isClientHandleExist(CONST.DEFAULT_CLIENT_HANDLE_KEYS.AUTHENTICATOR)) {
        /* eslint-disable no-underscore-dangle */
        return reject(new Error(i18n.__('messages.unauthorised')));
        /* eslint-enable no-underscore-dangle */
      }

      const appList = [];
      // TODO get list of authorised application
      resolve(appList);
    });
  }

  /*
   * Drop client handle
   * */
  dropHandle(key) {
    if (!key || !this._isClientHandleExist(key)) {
      return;
    }
    // TODO drop client handle
    delete this[_clientHandle][key];
  }

  _isClientHandleExist(clientHandleKey) {
    return {}.hasOwnProperty.call(this[_clientHandle], clientHandleKey);
  }

  /* eslint-disable class-methods-use-this */
  _isUserCredentialsValid(locator, secret) {
    /* eslint-enable class-methods-use-this */
    if (!locator) {
      return new Error(i18n.__('messages.should_not_be_empty', i18n.__('Locator')));
    }

    if (!secret) {
      return new Error(i18n.__('messages.should_not_be_empty', i18n.__('Secret')));
    }

    if (typeof locator !== 'string') {
      return new Error(i18n.__('messages.must_be_string', i18n.__('Locator')));
    }

    if (typeof secret !== 'string') {
      return new Error(i18n.__('messages.must_be_string', i18n.__('Secret')));
    }

    if (!locator.trim()) {
      return new Error(i18n.__('messages.should_not_be_empty', i18n.__('Locator')));
    }

    if (!secret.trim()) {
      return new Error(i18n.__('messages.should_not_be_empty', i18n.__('Secret')));
    }
  }
}

const clientManager = new ClientManager();
export default clientManager;
