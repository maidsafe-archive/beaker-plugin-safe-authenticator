/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-unresolved, import/extensions */
import ffi from 'ffi';
import ref from 'ref';
/* eslint-enable import/no-unresolved, import/extensions */
import i18n from 'i18n';
import {
  Void,
  int32,
  voidPointer,
  AppHandlePointer,
  Null,
  FfiString
} from './models/types';
import FfiApi from './FfiApi';
import CONST from './constants.json';

const _networkState = Symbol('networkState');
const _networkStateChangeListener = Symbol('networkStateChangeListener');
const _networkStateChangeIpcListener = Symbol('networkStateChangeIpcListener');
const _clientHandle = Symbol('clientHandle');

class ClientManager extends FfiApi {
  constructor() {
    super();
    this[_networkState] = CONST.NETWORK_STATES.DISCONNECTED;
    this[_networkStateChangeListener] = null;
    this[_networkStateChangeIpcListener] = null;
    this[_clientHandle] = {};
  }

  /* eslint-disable no-unused-vars, class-methods-use-this */
  getFunctionsToRegister() {
    /* eslint-enable no-unused-vars, class-methods-use-this */
    return {
      create_acc: [int32, [FfiString, FfiString, AppHandlePointer, 'pointer', 'pointer']],
      login: [int32, [FfiString, FfiString, AppHandlePointer, 'pointer', 'pointer']]
    };
  }

  setClientHandle(key, handle) {
    this[_clientHandle][key] = handle;
  }

  isAutheticatorAuthorised() {
    return this[_clientHandle][CONST.DEFAULT_CLIENT_HANDLE_KEYS.AUTHENTICATOR];
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
    this[_networkStateChangeListener](null, this[_networkState]);
  }

  setNetworkIpcListener(cb) {
    this[_networkStateChangeIpcListener] = cb;
  }

  /**
   * Authorise application
   * @param payload
   * @returns {Promise}
   */
  /* eslint-disable no-unused-vars, class-methods-use-this */
  authDecision(appId, payload, isAllowed) {
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
      // this.networkState = CONST.NETWORK_STATES.CONNECTING;

      // const onStateChange = ffi.Callback(Void, [int32], (state) => {
      //   this.networkState = state;
      //   if (this.networkStateChangeListener) {
      //     this.networkStateChangeListener(state);
      //   }
      // });

      // TODO create unregistered client

      // this[_networkState] = CONST.NETWORK_STATES.CONNECTED;
      // TODO set unauthorised client handle id
      this.setClientHandle(CONST.DEFAULT_CLIENT_HANDLE_KEYS.UNAUTHORISED, 1);

      // if (typeof this[_networkStateChangeListener] === 'function') {
      //   this[_networkStateChangeListener](null, this[_networkState]);
      // }
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

      const appHandle = ref.alloc(AppHandlePointer);

      const onStateChange = this._getFfiNetworkStateCb();

      try {
        const onResult = (err, res) => {
          if (err || res !== 0) {
            return reject(err || res);
          }
          this.setClientHandle(CONST.DEFAULT_CLIENT_HANDLE_KEYS.AUTHENTICATOR, appHandle.deref());
          resolve();
        };
        this.safeCore.login.async(
          this._getFfiStringStruct(locator),
          this._getFfiStringStruct(secret),
          appHandle,
          Null,
          onStateChange,
          onResult);
      } catch (e) {
        console.error('Login error :: ', e);
      }
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
      const appHandle = ref.alloc(AppHandlePointer);

      const onStateChange = this._getFfiNetworkStateCb();

      try {
        const onResult = (err, res) => {
          if (err || res !== 0) {
            return reject(err || res);
          }
          this.setClientHandle(CONST.DEFAULT_CLIENT_HANDLE_KEYS.AUTHENTICATOR, appHandle.deref());
          resolve();
        };
        this.safeCore.create_acc.async(
          this._getFfiStringStruct(locator),
          this._getFfiStringStruct(secret),
          appHandle,
          Null,
          onStateChange,
          onResult);
      } catch (e) {
        console.error('Create account error :: ', e);
      }
    });
  }

  /**
   * User logout
   */
  logout() {
    if (typeof this[_networkStateChangeIpcListener] === 'function') {
      this[_networkStateChangeIpcListener](null, -1);
    }
    this.dropHandle(CONST.DEFAULT_CLIENT_HANDLE_KEYS.AUTHENTICATOR);
  }

  /**
   * Get list of authorised applications
   * @returns {Promise}
   */
  getAuthorisedApps() {
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

  /* eslint-disable class-methods-use-this */
  _getFfiStringStruct(str) {
    /* eslint-enable class-methods-use-this */
    const strBuf = new Buffer(str);
    return new FfiString({
      ptr: strBuf,
      len: strBuf.length,
      cap: strBuf.length
    });
  }

  _getFfiNetworkStateCb() {
    return ffi.Callback(Void, [voidPointer, int32, int32], (userData, res, state) => {
      this[_networkState] = state;
      if (this[_networkStateChangeListener] === 'function') {
        this[_networkStateChangeListener](null, this[_networkState]);
      }
      if (typeof this[_networkStateChangeIpcListener] === 'function') {
        this[_networkStateChangeIpcListener](null, this[_networkState]);
      }
    });
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
