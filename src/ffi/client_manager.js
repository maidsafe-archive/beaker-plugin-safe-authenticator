/**
 * Client Manager
 * Expose API for Authenticator as a client
 */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-unresolved, import/extensions */
import ffi from 'ffi';
/* eslint-enable import/no-unresolved, import/extensions */
import i18n from 'i18n';
import config from '../config';
import * as types from './refs/types';
import * as typeParser from './refs/typesParser';
import * as typeConstructor from './refs/typesConstructor';
import systemUriLoader from './sys_uri_loader';
import FfiApi from './FfiApi';
import CONST from './../constants.json';
import ERRORS from './error_code_lookup.json';
import { openExternal } from '../common';

// Private variable symbols
const _networkState = Symbol('networkState');
const _networkStateChangeListener = Symbol('networkStateChangeListener');
const _networkStateChangeIpcListener = Symbol('networkStateChangeIpcListener');
const _appListUpdateListener = Symbol('appListUpdateListener');
const _authReqListener = Symbol('authReqListener');
const _containerReqListener = Symbol('containerReqListener');
const _reqErrorListener = Symbol('reqErrorListener');
const _authenticatorHandle = Symbol('clientHandle');
const _reqDecryptList = Symbol('reqDecryptList');
const _callbackRegistry = Symbol('callbackRegistry');

class ClientManager extends FfiApi {
  constructor() {
    super();
    config.i18n();
    this[_networkState] = CONST.NETWORK_STATUS.DISCONNECTED;
    this[_networkStateChangeListener] = null;
    this[_networkStateChangeIpcListener] = null;
    this[_appListUpdateListener] = null;
    this[_authReqListener] = null;
    this[_containerReqListener] = null;
    this[_reqErrorListener] = null;
    this[_authenticatorHandle] = null;
    this[_reqDecryptList] = {};
    this[_callbackRegistry] = {};
  }

  get authenticatorHandle() {
    return this[_authenticatorHandle];
  }

  get networkState() {
    return this[_networkState];
  }

  /**
   * Functions to register with FFI library
   * @returns Object
   */
  /* eslint-disable no-unused-vars, class-methods-use-this */
  getFunctionsToRegister() {
    /* eslint-enable no-unused-vars, class-methods-use-this */
    return {
      create_acc: [types.int32, [types.CString, types.CString, types.CString, types.AppHandlePointer, 'pointer', 'pointer']],
      login: [types.int32, [types.CString, types.CString, types.AppHandlePointer, 'pointer', 'pointer']],
      auth_decode_ipc_msg: [types.Void, [types.voidPointer, types.CString, types.voidPointer, 'pointer', 'pointer', 'pointer']],
      encode_auth_resp: [types.Void, [types.voidPointer, types.AuthReqPointer, types.u32, types.bool, types.voidPointer, 'pointer']],
      encode_containers_resp: [types.Void, [types.voidPointer, types.ContainersReqPointer, types.u32, types.bool, types.voidPointer, 'pointer']],
      authenticator_registered_apps: [types.Void, [types.voidPointer, types.voidPointer, 'pointer']],
      authenticator_revoke_app: [types.Void, [types.voidPointer, types.CString, types.voidPointer, 'pointer']]
    };
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
  }

  /**
   * Set registered app list update listener
   * @param cb
   */
  setAppListUpdateListener(cb) {
    if (typeof cb !== 'function') {
      throw new Error(i18n.__('messages.must_be_function', i18n.__('App list listener callback')));
    }
    this[_appListUpdateListener] = cb;
  }

  /**
   * Set auth request listener
   * @param cb
   */
  setAuthReqListener(cb) {
    if (typeof cb !== 'function') {
      return;
    }
    this[_authReqListener] = cb;
  }

  /**
   * Set container request listener
   * @param cb
   */
  setContainerReqListener(cb) {
    if (typeof cb !== 'function') {
      return;
    }
    this[_containerReqListener] = cb;
  }

  /**
   * Set request error listener
   * @param cb
   */
  setReqErrorListener(cb) {
    if (typeof cb !== 'function') {
      return;
    }
    this[_reqErrorListener] = cb;
  }

  /**
   * Set Network IPC listener
   * @param cb
   */
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
      if (!this.authenticatorHandle) {
        return reject(new Error(i18n.__('messages.unauthorised')));
      }

      if (!req || typeof isAllowed !== 'boolean') {
        return reject(new Error(i18n.__('messages.invalid_params')));
      }

      if (!req.reqId || !this[_reqDecryptList][req.reqId]) {
        return reject(new Error(i18n.__('messages.invalid_req')));
      }

      const authReq = types.allocAuthReq(typeConstructor.constructAuthReq(
        this[_reqDecryptList][req.reqId]));

      delete this[_reqDecryptList][req.reqId];

      try {
        this[_callbackRegistry].authDecisionCb = ffi.Callback(types.Void,
          [types.voidPointer, types.FfiResult, types.CString], (userData, result, res) => {
            const code = result.error_code;
            if (code !== 0 && !res) {
              return reject(ERRORS[code]);
            }
            if (isAllowed) {
              this._updateAppList();
            }
            resolve(res);
          });
        this.safeLib.encode_auth_resp(
          this.authenticatorHandle,
          authReq,
          req.reqId,
          isAllowed,
          types.Null,
          this[_callbackRegistry].authDecisionCb
        );
      } catch (e) {
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
      if (!this.authenticatorHandle) {
        return reject(new Error(i18n.__('messages.unauthorised')));
      }

      if (!req || typeof isAllowed !== 'boolean') {
        return reject(new Error(i18n.__('messages.invalid_params')));
      }

      if (!req.reqId || !this[_reqDecryptList][req.reqId]) {
        return reject(new Error(i18n.__('messages.invalid_req')));
      }
      const contReq = types.allocContainerReq(typeConstructor.constructContainerReq(
        this[_reqDecryptList][req.reqId]));

      delete this[_reqDecryptList][req.reqId];

      try {
        this[_callbackRegistry].contDecisionCb = ffi.Callback(types.Void,
          [types.voidPointer, types.FfiResult, types.CString], (userData, result, res) => {
            const code = result.error_code;
            if (code !== 0 && !res) {
              return reject(ERRORS[code]);
            }
            if (isAllowed) {
              this._updateAppList();
            }
            resolve(res);
          });

        this.safeLib.encode_containers_resp(
          this.authenticatorHandle,
          contReq,
          req.reqId,
          isAllowed,
          types.Null,
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

      if (!this.authenticatorHandle) {
        return reject(new Error(i18n.__('messages.unauthorised')));
      }

      try {
        this[_callbackRegistry].revokeCb = ffi.Callback(types.Void,
          [types.voidPointer, types.FfiResult, types.CString],
          (userData, result, res) => {
            const code = result.error_code;
            if (code !== 0) {
              return reject(ERRORS[code]);
            }
            this._updateAppList();
            openExternal(res);
            resolve();
          });

        this.safeLib.authenticator_revoke_app(
          this.authenticatorHandle,
          types.allocCString(appId),
          types.Null,
          this[_callbackRegistry].revokeCb
        );
      } catch (e) {
        reject(e.message);
      }
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

      const appHandle = types.allocAppHandlePointer();

      const onStateChange = this._getFfiNetworkStateCb();

      try {
        const onResult = (err, res) => {
          if (err || res !== 0) {
            return reject(ERRORS[res]);
          }
          this[_authenticatorHandle] = appHandle.deref();
          this._pushNetworkState(CONST.NETWORK_STATUS.CONNECTED);
          resolve();
        };
        this.safeLib.login.async(
          types.allocCString(locator),
          types.allocCString(secret),
          appHandle,
          types.Null,
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
  createAccount(locator, secret, invitation) {
    return new Promise((resolve, reject) => {
      const validationErr = this._isUserCredentialsValid(locator, secret);
      if (validationErr) {
        return reject(validationErr);
      }
      const appHandle = types.allocAppHandlePointer();

      const onStateChange = this._getFfiNetworkStateCb();

      if (!(invitation && (typeof invitation === 'string') && invitation.trim())) {
        return Promise.reject(new Error(i18n.__('messages.invalid_invite_code')));
      }

      try {
        const onResult = (err, res) => {
          if (err || res !== 0) {
            return reject(ERRORS[res]);
          }
          this[_authenticatorHandle] = appHandle.deref();
          this._pushNetworkState(CONST.NETWORK_STATUS.CONNECTED);
          resolve();
        };
        this.safeLib.create_acc.async(
          types.allocCString(locator),
          types.allocCString(secret),
          types.allocCString(invitation),
          appHandle,
          types.Null,
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
    this[_authenticatorHandle] = null;
  }

  /**
   * Get list of authorised applications
   * @returns {Promise}
   */
  getAuthorisedApps() {
    return new Promise((resolve, reject) => {
      if (!this.authenticatorHandle) {
        return reject(new Error(i18n.__('messages.unauthorised')));
      }
      try {
        this[_callbackRegistry].appListCb = ffi.Callback(types.Void,
          [types.voidPointer, types.FfiResult, types.RegisteredAppPointer, types.usize],
          (userData, result, appList, len) => {
            if (result.error_code !== 0) {
              return reject(ERRORS[result.error_code]);
            }
            const apps = typeParser.parseRegisteredAppArray(appList, len);
            resolve(apps);
          });
        this.safeLib.authenticator_registered_apps(
          this.authenticatorHandle,
          types.Null,
          this[_callbackRegistry].appListCb
        );
      } catch (e) {
        reject(e.message);
      }
    });
  }

  /**
   * Decrypt auth or container request
   * @param url
   * @returns {Promise}
   */
  decryptRequest(url) {
    return new Promise((resolve, reject) => {
      if (!url) {
        return reject();
      }

      const msg = url.replace('safe-auth://', '');

      if (!this.authenticatorHandle) {
        return reject(new Error(i18n.__('messages.unauthorised')));
      }

      this[_callbackRegistry].decryptReqAuthCb = ffi.Callback(types.Void,
        [types.voidPointer, types.u32, types.AuthReqPointer], (userData, reqId, req) => {
          if (typeof this[_authReqListener] !== 'function') {
            return;
          }
          const authReq = typeParser.parseAuthReq(req.deref());
          this[_reqDecryptList][reqId] = authReq;
          const result = {
            reqId,
            authReq
          };
          return this._isAlreadyAuthorised(authReq)
            .then((isAuthorised) => {
              if (isAuthorised) {
                return this.authDecision(result, true)
                  .then((res) => {
                    openExternal(res);
                    resolve(true);
                  });
              }
              this[_authReqListener](result);
              resolve();
            });
        });

      this[_callbackRegistry].decryptReqContainerCb = ffi.Callback(types.Void,
        [types.voidPointer, types.u32, types.ContainersReqPointer], (userData, reqId, req) => {
          if (typeof this[_containerReqListener] !== 'function') {
            return;
          }
          const contReq = typeParser.parseContainerReq(req.deref());
          this[_reqDecryptList][reqId] = contReq;
          this[_containerReqListener]({
            reqId,
            contReq
          });
        });

      this[_callbackRegistry].decryptReqErrorCb = ffi.Callback(types.Void,
        [types.voidPointer, types.FfiResult, types.CString], (userData, result, error) => {
          if (typeof this[_reqErrorListener] !== 'function') {
            return;
          }
          this[_reqErrorListener]({
            code: result.error_code,
            msg: error
          });
        });

      try {
        this.safeLib.auth_decode_ipc_msg(
          this.authenticatorHandle,
          types.allocCString(msg),
          types.Null,
          this[_callbackRegistry].decryptReqAuthCb,
          this[_callbackRegistry].decryptReqContainerCb,
          this[_callbackRegistry].decryptReqErrorCb);
      } catch (e) {
        console.error(`Auth request decrypt error :: ${e.message}`);
      }
    });
  }

  /**
   * Register URI scheme for cross platforms
   * @param appInfo
   * @param schemes
   * @returns {*}
   */
  /* eslint-disable class-methods-use-this */
  registerUriScheme(appInfo, schemes) {
    /* eslint-enable class-methods-use-this */
    return systemUriLoader.registerUriScheme(appInfo, schemes);
  }

  /**
   * Open Custom URI
   * @param uri
   * @returns {*}
   */
  /* eslint-disable class-methods-use-this */
  openUri(uri) {
    /* eslint-enable class-methods-use-this */
    try {
      return systemUriLoader.openUri(uri);
    } catch (e) {
      console.warn('Open URI error ', e);
    }
  }

  _isAlreadyAuthorised(req) {
    return this.getAuthorisedApps()
      .then((authorisedApps) => (
        (authorisedApps.filter((apps) => (apps.toString() === req.toString()))).length !== 0));
  }

  /**
   * Update app list - Calls app list update listener
   * @private
   */
  _updateAppList() {
    this.getAuthorisedApps()
      .then((apps) => {
        if (typeof this[_appListUpdateListener] === 'function') {
          this[_appListUpdateListener](null, apps);
        }
      });
  }

  /**
   * Prepare FFI network state callback function
   * @returns {*}
   * @private
   */
  _getFfiNetworkStateCb() {
    return ffi.Callback(types.Void,
      [types.voidPointer, types.int32, types.int32], (userData, res, state) => {
        this[_networkState] = state;
        this._pushNetworkState();
      });
  }

  /**
   * Push network state to registered listeners
   * @param state
   * @private
   */
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

  /**
   * Validate user credential - locator and secret
   * @param locator
   * @param secret
   * @returns {Error}
   * @private
   */
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
