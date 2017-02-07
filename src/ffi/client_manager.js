/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-unresolved, import/extensions */
import ffi from 'ffi';
import ref from 'ref';
/* eslint-enable import/no-unresolved, import/extensions */
import i18n from 'i18n';
import config from '../config';
import {
  u32,
  Void,
  usize,
  int32,
  bool,
  CString,
  voidPointer,
  AppHandlePointer,
  Null,
  AuthReq,
  ContainersReq,
  RegisteredAppPointer,
  AuthReqPointer,
  ContainersReqPointer
} from './model/types';
import * as typeParsers from './model/typesParsers';
import * as typeConstructor from './model/typesConstructor';
import FfiApi from './FfiApi';
import CONST from './../constants.json';
import ERRORS from './error_code_lookup.json';
import systemUriLoader from './sys_uri_loader';

const _networkState = Symbol('networkState');
const _networkStateChangeListener = Symbol('networkStateChangeListener');
const _appListUpdateListener = Symbol('appListUpdateListener');
const _networkStateChangeIpcListener = Symbol('networkStateChangeIpcListener');
const _authReqListener = Symbol('authReqListener');
const _containerReqListener = Symbol('containerReqListener');
const _reqErrorListener = Symbol('reqErrorListener');
const _clientHandle = Symbol('clientHandle');
const _reqDecryptList = Symbol('reqDecryptList');
const _callbackRegistry = Symbol('callbackRegistry');

class ClientManager extends FfiApi {
  constructor() {
    super();
    config.i18n();
    this[_networkState] = CONST.NETWORK_STATUS.DISCONNECTED;
    this[_networkStateChangeListener] = null;
    this[_appListUpdateListener] = null;
    this[_networkStateChangeIpcListener] = null;
    this[_authReqListener] = null;
    this[_containerReqListener] = null;
    this[_reqErrorListener] = null;
    this[_clientHandle] = {};
    this[_reqDecryptList] = {};
    this[_callbackRegistry] = {};
  }

  /* eslint-disable no-unused-vars, class-methods-use-this */
  getFunctionsToRegister() {
    /* eslint-enable no-unused-vars, class-methods-use-this */
    return {
      create_acc: [int32, [CString, CString, AppHandlePointer, 'pointer', 'pointer']],
      login: [int32, [CString, CString, AppHandlePointer, 'pointer', 'pointer']],
      auth_decode_ipc_msg: [Void, [voidPointer, CString, voidPointer, 'pointer', 'pointer', 'pointer']],
      encode_auth_resp: [Void, [voidPointer, AuthReqPointer, u32, bool, voidPointer, 'pointer']],
      encode_containers_resp: [Void, [voidPointer, ContainersReqPointer, u32, bool, voidPointer, 'pointer']],
      authenticator_registered_apps: [int32, [voidPointer, voidPointer, 'pointer']],
      authenticator_revoke_app: [Void, [voidPointer, CString, voidPointer, 'pointer']]
    };
  }

  setClientHandle(key, handle) {
    this[_clientHandle][key] = handle;
  }

  getAuthenticatorHandle() {
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
    // this[_networkStateChangeListener](null, this[_networkState]);
  }

  getNetworkState() {
    return this[_networkState];
  }

  setAppListUpdateListener(cb) {
    if (typeof cb !== 'function') {
      throw new Error(i18n.__('messages.must_be_function', i18n.__('App list listener callback')));
    }
    this[_appListUpdateListener] = cb;
  }

  setAuthReqListener(cb) {
    if (typeof cb !== 'function') {
      return;
    }
    this[_authReqListener] = cb;
  }

  setContainerReqListener(cb) {
    if (typeof cb !== 'function') {
      return;
    }
    this[_containerReqListener] = cb;
  }

  setReqErrorListener(cb) {
    if (typeof cb !== 'function') {
      return;
    }
    this[_reqErrorListener] = cb;
  }

  setNetworkIpcListener(cb) {
    this[_networkStateChangeIpcListener] = cb;
  }

  /**
   * Authorise application request
   * @param req
   * @param isAllowed
   * @returns {Promise}
   */
  authDecision(req, isAllowed) {
    return new Promise((resolve, reject) => {
      if (!req || typeof isAllowed !== 'boolean') {
        return reject(new Error(i18n.__('invalid_params')));
      }
      const authenticatorHandle = this.getAuthenticatorHandle();

      if (!authenticatorHandle) {
        return reject(new Error(i18n.__('messages.unauthorised')));
      }

      if (!req.reqId) {
        return reject(new Error(i18n.__('invalid_req')));
      }

      const authReq = ref.alloc(AuthReq, typeConstructor.constructAuthReq(this[_reqDecryptList][req.reqId]));

      delete this[_reqDecryptList][req.reqId];

      try {
        this[_callbackRegistry].authDecisionCb = ffi.Callback(Void, [voidPointer, int32, CString],
          (userData, code, res) => {
            if (code !== 0) {
              return reject(ERRORS[code]);
            }
            if (isAllowed) {
              this._updateAppList();
            }
            resolve(res);
          });
        this.safeCore.encode_auth_resp(
          authenticatorHandle,
          authReq,
          req.reqId,
          isAllowed,
          Null,
          this[_callbackRegistry].authDecisionCb
        );
      } catch (e) {
        console.log("Error :", e);
        reject(e);
      }
    });
  }

  /**
   * Authorise container request
   * @param req
   * @param isAllowed
   * @returns {Promise}
   */
  containerDecision(req, isAllowed) {
    return new Promise((resolve, reject) => {
      if (!req || typeof isAllowed !== 'boolean') {
        return reject(new Error(i18n.__('invalid_params')));
      }
      const authenticatorHandle = this.getAuthenticatorHandle();

      if (!authenticatorHandle) {
        return reject(new Error(i18n.__('messages.unauthorised')));
      }

      if (!req.reqId) {
        return reject(new Error(i18n.__('invalid_req')));
      }
      const contReq = ref.alloc(ContainersReq, typeConstructor.constructContainerReq(this[_reqDecryptList][req.reqId]));

      delete this[_reqDecryptList][req.reqId];

      try {
        this[_callbackRegistry].contDecisionCb = ffi.Callback(Void, [voidPointer, int32, CString],
          (userData, code, res) => {
            if (code !== 0) {
              return reject(ERRORS[code]);
            }
            if (isAllowed) {
              this._updateAppList();
            }
            resolve(res);
          });

        this.safeCore.encode_containers_resp(
          authenticatorHandle,
          contReq,
          req.reqId,
          isAllowed,
          Null,
          this[_callbackRegistry].contDecisionCb
        );
      } catch (e) {
        reject(e);
      }
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

      const authenticatorHandle = this.getAuthenticatorHandle();

      if (!authenticatorHandle) {
        return reject(new Error(i18n.__('messages.unauthorised')));
      }

      try {
        const revokeCb = ffi.Callback(Void, [voidPointer, int32, CString],
          (userData, code, res) => {
            if (code !== 0) {
              return reject(ERRORS[code]);
            }
            this._updateAppList();
            resolve(res);
          });

        this.safeCore.authenticator_revoke_app(
          authenticatorHandle,
          this._getCString(appId),
          Null,
          revokeCb
        );
      } catch (e) {
        reject(e.message);
      }
    });
  }

  /*
   * Create unregistered client
   * */
  createUnregisteredClient() {
    return new Promise((resolve) => {
      // TODO integrate ffi function - create unregistered client
      // this.networkState = CONST.NETWORK_STATUS.CONNECTING;

      // const onStateChange = ffi.Callback(Void, [int32], (state) => {
      //   this.networkState = state;
      //   if (this.networkStateChangeListener) {
      //     this.networkStateChangeListener(state);
      //   }
      // });

      // this[_networkState] = CONST.NETWORK_STATUS.CONNECTED;
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
            return reject(ERRORS[res]);
          }
          this.setClientHandle(CONST.DEFAULT_CLIENT_HANDLE_KEYS.AUTHENTICATOR, appHandle.deref());
          this._pushNetworkState(CONST.NETWORK_STATUS.CONNECTED);
          resolve();
        };
        this.safeCore.login.async(
          this._getCString(locator),
          this._getCString(secret),
          appHandle,
          Null,
          onStateChange,
          onResult);
      } catch (e) {
        console.error(`Login error :: ${e.message}`);
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
            return reject(ERRORS[res]);
          }
          this.setClientHandle(CONST.DEFAULT_CLIENT_HANDLE_KEYS.AUTHENTICATOR, appHandle.deref());
          this._pushNetworkState(CONST.NETWORK_STATUS.CONNECTED);
          resolve();
        };
        this.safeCore.create_acc.async(
          this._getCString(locator),
          this._getCString(secret),
          appHandle,
          Null,
          onStateChange,
          onResult);
      } catch (e) {
        console.error(`Create account error :: ${e.message}`);
      }
    });
  }

  /**
   * User logout
   */
  logout() {
    this._pushNetworkState(-1);
    this.dropHandle(CONST.DEFAULT_CLIENT_HANDLE_KEYS.AUTHENTICATOR);
  }

  /**
   * Get list of authorised applications
   * @returns {Promise}
   */
  getAuthorisedApps() {
    return new Promise((resolve, reject) => {
      const authenticatorHandle = this.getAuthenticatorHandle();

      if (!authenticatorHandle) {
        return reject(new Error(i18n.__('messages.unauthorised')));
      }

      try {
        this[_callbackRegistry].appListCb = ffi.Callback(Void,
          [voidPointer, int32, RegisteredAppPointer, usize, usize],
          (userData, code, appList, len, cap) => {
            const apps = typeParsers.parseRegisteredAppArray(appList, len);
            resolve(apps);
          });

        this.safeCore.authenticator_registered_apps(
          authenticatorHandle,
          Null,
          this[_callbackRegistry].appListCb
        );
      } catch (e) {
        reject(e.message);
      }
    });
  }

  /**
   * Decrypt request
   */

  decryptRequest(url) {
    const msg = url.replace('safe-auth://', '');
    return new Promise((resolve, reject) => {
      if (!msg) {
        return reject();
      }

      const authenticatorHandle = this.getAuthenticatorHandle();

      if (!authenticatorHandle) {
        return reject(new Error(i18n.__('unauthorised')));
      }

      this[_callbackRegistry].decryptReqAuthCb = ffi.Callback(Void,
        [voidPointer, u32, AuthReqPointer], (userData, reqId, req) => {
          if (typeof this[_authReqListener] !== 'function') {
            return;
          }
          const authReq = typeParsers.parseAuthReq(req.deref());
          this[_reqDecryptList][reqId] = authReq;
          this[_authReqListener]({
            reqId,
            authReq
          });
        });

      this[_callbackRegistry].decryptReqContainerCb = ffi.Callback(Void,
        [voidPointer, int32, ContainersReqPointer], (userData, reqId, req) => {
          if (typeof this[_containerReqListener] !== 'function') {
            return;
          }
          const contReq = typeParsers.parseContainerReq(req.deref());
          this[_reqDecryptList][reqId] = contReq;
          this[_containerReqListener]({
            reqId,
            contReq
          });
        });

      this[_callbackRegistry].decryptReqErrorCb = ffi.Callback(Void,
        [voidPointer, int32, CString], (userData, code, error) => {
          if (typeof this[_reqErrorListener] !== 'function') {
            return;
          }
          console.log('Errorrr :: ', ERRORS[code]);
          this[_reqErrorListener](ERRORS[code]);
        });

      try {
        this.safeCore.auth_decode_ipc_msg(
          authenticatorHandle,
          this._getCString(msg),
          Null,
          this[_callbackRegistry].decryptReqAuthCb,
          this[_callbackRegistry].decryptReqContainerCb,
          this[_callbackRegistry].decryptReqErrorCb);
      } catch (e) {
        console.error(`Auth request decrypt error :: ${e.message}`);
      }
    });
  }

  registerUriScheme(appInfo, schemes) {
    return systemUriLoader.registerUriScheme(appInfo, schemes);
  }

  _updateAppList() {
    this.getAuthorisedApps()
      .then((apps) => {
        if (typeof this[_appListUpdateListener] === 'function') {
          this[_appListUpdateListener](null, apps);
        }
      });
  }

  /*
   * Drop client handle
   * */
  dropHandle(key) {
    if (!key || !this._isClientHandleExist(key)) {
      return;
    }
    // TODO drop client handle at ffi
    delete this[_clientHandle][key];
  }

  /* eslint-disable class-methods-use-this */
  _getCString(str) {
    /* eslint-enable class-methods-use-this */
    return ref.allocCString(str);
  }

  _getFfiNetworkStateCb() {
    return ffi.Callback(Void, [voidPointer, int32, int32], (userData, res, state) => {
      this[_networkState] = state;
      this._pushNetworkState();
    });
  }

  _pushNetworkState(state) {
    let networkState = state;
    if (typeof networkState === 'undefined') {
      networkState = this[_networkState];
    }

    this[_networkState] = networkState;

    if (typeof this[_networkStateChangeListener] === 'function') {
      this[_networkStateChangeListener](null, networkState);
    }
    if (typeof this[_networkStateChangeIpcListener] === 'function') {
      this[_networkStateChangeIpcListener](null, networkState);
    }
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
