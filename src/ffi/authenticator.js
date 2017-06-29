/**
 * Authenticator
 */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-unresolved, import/extensions */
import ffi from 'ffi';
/* eslint-enable import/no-unresolved, import/extensions */
import crypto from 'crypto';
import lodash from 'lodash';
import i18n from 'i18n';

import SafeLib from './safe_lib';
import Listener from './listeners';
import ipc from './ipc';
import config from '../config';
import * as types from './refs/types';
import * as typeParser from './refs/parsers';
import * as typeConstructor from './refs/constructors';
import CONSTANTS from '../constants';

// private variables
const _registeredClientHandle = Symbol('registeredClientHandle');
const _nwState = Symbol('nwState');
const _reAuthoriseState = Symbol('reAuthoriseState');
const _appListUpdateListener = Symbol('appListUpdate');
const _authReqListener = Symbol('authReq');
const _containerReqListener = Symbol('containerReq');
const _nwStateChangeListener = Symbol('nwStateChangeListener');
const _reqErrListener = Symbol('reqErrListener');
const _cbRegistry = Symbol('cbRegistry');
const _nwStateCb = Symbol('nwStateCb');
const _decodeReqPool = Symbol('decodeReqPool');

class Authenticator extends SafeLib {
  constructor() {
    super();
    ipc();
    config.i18n();
    this[_registeredClientHandle] = null;
    this[_nwState] = CONSTANTS.NETWORK_STATUS.DISCONNECTED;
    this[_reAuthoriseState] = null;
    this[_appListUpdateListener] = new Listener();
    this[_authReqListener] = new Listener();
    this[_containerReqListener] = new Listener();
    this[_nwStateChangeListener] = new Listener();
    this[_reqErrListener] = new Listener();
    this[_cbRegistry] = {};
    this[_decodeReqPool] = {};
    this[_nwStateCb] = ffi.Callback(types.Void,
      [types.voidPointer, types.int32, types.int32], (userData, res, state) => {
        this._pushNetworkState(state);
      });
  }

  get registeredClientHandle() {
    return this[_registeredClientHandle];
  }

  set registeredClientHandle(handle) {
    this[_registeredClientHandle] = handle;
  }

  get networkState() {
    return this[_nwState];
  }

  set networkState(state) {
    if (typeof state === 'undefined') {
      return;
    }
    this[_nwState] = state;
  }

  get networkStateCb() {
    return this[_nwStateCb];
  }

  fnsToRegister() {
    return {
      create_acc: [types.Void, [types.CString, types.CString, types.CString, types.voidPointer, types.voidPointer, 'pointer', 'pointer']],
      login: [types.Void, [types.CString, types.CString, types.voidPointer, types.voidPointer, 'pointer', 'pointer']],
      auth_decode_ipc_msg: [types.Void, [types.voidPointer, types.CString, types.voidPointer, 'pointer', 'pointer', 'pointer']],
      encode_auth_resp: [types.Void, [types.voidPointer, types.AuthReqPointer, types.u32, types.bool, types.voidPointer, 'pointer']],
      encode_containers_resp: [types.Void, [types.voidPointer, types.ContainersReqPointer, types.u32, types.bool, types.voidPointer, 'pointer']],
      auth_unregistered_decode_ipc_msg: [types.Void, [types.CString, types.voidPointer, 'pointer', 'pointer']],
      encode_unregistered_resp: [types.Void, [types.u32, types.bool, types.voidPointer, 'pointer']],
      authenticator_registered_apps: [types.Void, [types.voidPointer, types.voidPointer, 'pointer']],
      authenticator_revoke_app: [types.Void, [types.voidPointer, types.CString, types.voidPointer, 'pointer']],
      authenticator_free: [types.Void, [types.voidPointer]],
      auth_init_logging: [types.Void, [types.CString, types.voidPointer, 'pointer']]
    };
  }

  setListener(type, cb) {
    // FIXME check .key required
    switch (type.key) {
      case CONSTANTS.LISTENER_TYPES.APP_LIST_UPDATE.key: {
        return this[_appListUpdateListener].add(cb);
      }
      case CONSTANTS.LISTENER_TYPES.AUTH_REQ.key: {
        return this[_authReqListener].add(cb);
      }
      case CONSTANTS.LISTENER_TYPES.CONTAINER_REQ.key: {
        return this[_containerReqListener].add(cb);
      }
      case CONSTANTS.LISTENER_TYPES.NW_STATE_CHANGE.key: {
        return this[_nwStateChangeListener].add(cb);
      }
      case CONSTANTS.LISTENER_TYPES.REQUEST_ERR.key: {
        return this[_reqErrListener].add(cb);
      }
      default: {
        throw new Error('Invalid listener type');
      }
    }
  }

  removeListener(type, id) {
    switch (type.key) {
      case CONSTANTS.LISTENER_TYPES.APP_LIST_UPDATE.key: {
        return this[_appListUpdateListener].remove(id);
      }
      case CONSTANTS.LISTENER_TYPES.AUTH_REQ.key: {
        return this[_authReqListener].remove(id);
      }
      case CONSTANTS.LISTENER_TYPES.CONTAINER_REQ.key: {
        return this[_containerReqListener].remove(id);
      }
      case CONSTANTS.LISTENER_TYPES.NW_STATE_CHANGE.key: {
        return this[_nwStateChangeListener].remove(id);
      }
      case CONSTANTS.LISTENER_TYPES.REQUEST_ERR.key: {
        return this[_reqErrListener].remove(id);
      }
      default: {
        throw new Error('Invalid listener type');
      }
    }
  }

  setReAuthoriseState(state) {
    this[_reAuthoriseState] = state;
  }

  createAccount(locator, secret, invitation) {
    return new Promise((resolve, reject) => {
      const validationErr = this._isUserCredentialsValid(locator, secret);
      if (validationErr) {
        return reject(validationErr);
      }

      if (!(invitation && (typeof invitation === 'string') && invitation.trim())) {
        return Promise.reject(new Error(i18n.__('messages.invalid_invite_code')));
      }

      try {
        const createAccCb = this._pushCb(ffi.Callback(types.Void,
          [types.voidPointer, types.FfiResult, types.ClientHandlePointer],
          (userData, result, clientHandle) => {
            const code = result.error_code;
            if (code !== 0 && clientHandle.length === 0) {
              return reject(JSON.stringify(result));
            }
            this.registeredClientHandle = clientHandle;
            this._pushNetworkState(CONSTANTS.NETWORK_STATUS.CONNECTED);
            resolve();
          }));

        const onResult = (err, res) => {
          if (err || res !== 0) {
            return reject(err);
          }
        };

        this.safeLib.create_acc.async(
          types.allocCString(locator),
          types.allocCString(secret),
          types.allocCString(invitation),
          types.Null,
          types.Null,
          this.networkStateCb,
          this._getCb(createAccCb),
          onResult);
      } catch (e) {
        reject(e);
      }
    });
  }

  login(locator, secret) {
    return new Promise((resolve, reject) => {
      const validationErr = this._isUserCredentialsValid(locator, secret);
      if (validationErr) {
        return reject(validationErr);
      }

      try {
        const loginCb = this._pushCb(ffi.Callback(types.Void,
          [types.voidPointer, types.FfiResult, types.ClientHandlePointer],
          (userData, result, clientHandle) => {
            const code = result.error_code;
            if (code !== 0 && clientHandle.length === 0) {
              return reject(JSON.stringify(result));
            }
            this.registeredClientHandle = clientHandle;
            this._pushNetworkState(CONSTANTS.NETWORK_STATUS.CONNECTED);
            resolve();
          }));

        const onResult = (err, res) => {
          if (err || res !== 0) {
            return reject(err);
          }
        };

        this.safeLib.login.async(
          types.allocCString(locator),
          types.allocCString(secret),
          types.Null,
          types.Null,
          this.networkStateCb,
          this._getCb(loginCb),
          onResult);
      } catch (e) {
        reject(e);
      }
    });
  }

  logout() {
    this._pushNetworkState(CONSTANTS.NETWORK_STATUS.DISCONNECTED);
    this.safeLib.authenticator_free(this.registeredClientHandle);
    this.registeredClientHandle = null;
  }

  decodeRequest(uri) {
    return new Promise((resolve, reject) => {
      if (!uri) {
        return reject(new Error('Invalid URI'));
      }
      const parsedURI = uri.replace('safe-auth://', '').replace('safe-auth:', '').replace('/', '');

      if (!this.registeredClientHandle) {
        // return reject(new Error(i18n.__('messages.unauthorised')));
        /* decode as unregistered client */
        return this._decodeUnRegisteredRequest(parsedURI, resolve, reject);
      }
      const decodeReqAuthCb = this._pushCb(ffi.Callback(types.Void,
        [types.voidPointer, types.u32, types.AuthReqPointer], (userData, reqId, req) => {
          if (!(this[_authReqListener] && this[_authReqListener].len() !== 0)) {
            return;
          }
          const authReq = typeParser.parseAuthReq(req.deref());
          this[_decodeReqPool][reqId] = authReq;
          const result = {
            reqId,
            authReq
          };
          if (this[_reAuthoriseState] !== CONSTANTS.RE_AUTHORISE.STATE.UNLOCK) {
            this[_authReqListener].broadcast(null, result);
            return resolve();
          }
          return this._isAlreadyAuthorised(authReq)
            .then((isAuthorised) => {
              if (isAuthorised) {
                return this.encodeAuthResp(result, true)
                  .then(resolve);
              }
              this[_authReqListener].broadcast(null, result);
              resolve();
            });
        }));

      const decodeReqContainerCb = this._pushCb(ffi.Callback(types.Void,
        [types.voidPointer, types.u32, types.ContainersReqPointer], (userData, reqId, req) => {
          if (!(this[_containerReqListener] && this[_containerReqListener].len() !== 0)) {
            return;
          }
          const contReq = typeParser.parseContainerReq(req.deref());
          this[_decodeReqPool][reqId] = contReq;
          this[_containerReqListener].broadcast(null, {
            reqId,
            contReq
          });
        }));

      const decodeReqErrorCb = this._pushCb(ffi.Callback(types.Void,
        [types.voidPointer, types.FfiResult, types.CString], (userData, result) => {
          if (!(this[_reqErrListener] && this[_reqErrListener].len() !== 0)) {
            return;
          }
          this[_reqErrListener].broadcast(JSON.stringify(result));
        }));

      try {
        this.safeLib.auth_decode_ipc_msg(
          this.registeredClientHandle,
          types.allocCString(parsedURI),
          types.Null,
          this._getCb(decodeReqAuthCb),
          this._getCb(decodeReqContainerCb),
          this._getCb(decodeReqErrorCb));
      } catch (e) {
        reject(e);
      }
    });
  }

  encodeAuthResp(req, isAllowed) {
    return new Promise((resolve, reject) => {
      if (!this.registeredClientHandle) {
        return reject(new Error(i18n.__('messages.unauthorised')));
      }

      if (!req || typeof isAllowed !== 'boolean') {
        return reject(new Error(i18n.__('messages.invalid_params')));
      }

      if (!req.reqId || !this[_decodeReqPool][req.reqId]) {
        return reject(new Error(i18n.__('messages.invalid_req')));
      }

      const authReq = types.allocAuthReq(typeConstructor.constructAuthReq(
        this[_decodeReqPool][req.reqId]));

      delete this[_decodeReqPool][req.reqId];

      try {
        const authDecisionCb = this._pushCb(ffi.Callback(types.Void,
          [types.voidPointer, types.FfiResult, types.CString], (userData, result, res) => {
            const code = result.error_code;
            if (code !== 0 && !res) {
              return reject(JSON.stringify(result));
            }
            if (isAllowed) {
              this._updateAppList();
            }
            resolve(res);
          }));
        this.safeLib.encode_auth_resp(
          this.registeredClientHandle,
          authReq,
          req.reqId,
          isAllowed,
          types.Null,
          this._getCb(authDecisionCb)
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  encodeContainersResp(req, isAllowed) {
    return new Promise((resolve, reject) => {
      if (!this.registeredClientHandle) {
        return reject(new Error(i18n.__('messages.unauthorised')));
      }

      if (!req || typeof isAllowed !== 'boolean') {
        return reject(new Error(i18n.__('messages.invalid_params')));
      }

      if (!req.reqId || !this[_decodeReqPool][req.reqId]) {
        return reject(new Error(i18n.__('messages.invalid_req')));
      }
      const contReq = types.allocContainerReq(typeConstructor.constructContainerReq(
        this[_decodeReqPool][req.reqId]));

      delete this[_decodeReqPool][req.reqId];

      try {
        const contDecisionCb = this._pushCb(ffi.Callback(types.Void,
          [types.voidPointer, types.FfiResult, types.CString], (userData, result, res) => {
            const code = result.error_code;
            if (code !== 0 && !res) {
              return reject(JSON.stringify(result));
            }
            if (isAllowed) {
              this._updateAppList();
            }
            resolve(res);
          }));

        this.safeLib.encode_containers_resp(
          this.registeredClientHandle,
          contReq,
          req.reqId,
          isAllowed,
          types.Null,
          this._getCb(contDecisionCb)
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  revokeApp(appId) {
    return new Promise((resolve, reject) => {
      if (!this.registeredClientHandle) {
        return reject(new Error(i18n.__('messages.unauthorised')));
      }

      if (!appId) {
        return reject(new Error(i18n.__('messages.should_not_be_empty', i18n.__('AppId'))));
      }

      if (typeof appId !== 'string') {
        return reject(new Error(i18n.__('messages.must_be_string', i18n.__('AppId'))));
      }

      if (!appId.trim()) {
        return reject(new Error(i18n.__('messages.should_not_be_empty', i18n.__('AppId'))));
      }

      try {
        const revokeCb = this._pushCb(ffi.Callback(types.Void,
          [types.voidPointer, types.FfiResult, types.CString],
          (userData, result, res) => {
            const code = result.error_code;
            if (code !== 0) {
              return reject(JSON.stringify(result));
            }
            this._updateAppList();
            resolve(res);
          }));

        this.safeLib.authenticator_revoke_app(
          this.registeredClientHandle,
          types.allocCString(appId),
          types.Null,
          this._getCb(revokeCb)
        );
      } catch (e) {
        reject(e.message);
      }
    });
  }

  getRegisteredApps() {
    return new Promise((resolve, reject) => {
      if (!this.registeredClientHandle) {
        return reject(new Error(i18n.__('messages.unauthorised')));
      }
      let cb = null;
      cb = this._pushCb(ffi.Callback(types.Void,
        [types.voidPointer, types.FfiResult, types.RegisteredAppPointer, types.usize],
        (userData, result, appList, len) => {
          this._deleteFromCb(cb);
          if (result.error_code !== 0) {
            return reject(JSON.stringify(result));
          }
          const apps = typeParser.parseRegisteredAppArray(appList, len);
          resolve(apps);
        }));

      try {
        this.safeLib.authenticator_registered_apps(
          this.registeredClientHandle,
          types.Null,
          this._getCb(cb)
        );
      } catch (e) {
        reject(e.message);
      }
    });
  }

  _pushCb(cb) {
    const rand = crypto.randomBytes(32).toString('hex');
    this[_cbRegistry][rand] = cb;
    return rand;
  }

  _getCb(rand) {
    return this[_cbRegistry][rand];
  }

  _deleteFromCb(rand) {
    if (!this[_cbRegistry][rand]) {
      return;
    }
    delete this[_cbRegistry][rand];
  }

  _updateAppList() {
    this.getRegisteredApps()
      .then((apps) => {
        if ((this[_appListUpdateListener] && this[_appListUpdateListener].len() !== 0)) {
          this[_appListUpdateListener].broadcast(null, apps);
        }
      });
  }

  _decodeUnRegisteredRequest(parsedUri, resolve, reject) {
    if (!parsedUri) {
      return reject(new Error('Invalid URI'));
    }

    const unregisteredCb = this._pushCb(ffi.Callback(types.Void,
      [types.voidPointer, types.u32], (userData, reqId) => {
        if (!reqId) {
          return reject(new Error('Invalid Response while decoding Unregisterd client request'));
        }
        return this._encodeUnRegisteredResp(reqId)
          .then((res) => resolve(res));
      }));

    const decodeReqErrorCb = this._pushCb(ffi.Callback(types.Void,
      [types.voidPointer, types.FfiResult, types.CString], () => {
        reject(new Error('Unauthorised'));
      }));

    try {
      this.safeLib.auth_unregistered_decode_ipc_msg(
        types.allocCString(parsedUri),
        types.Null,
        this._getCb(unregisteredCb),
        this._getCb(decodeReqErrorCb)
      );
    } catch (err) {
      return reject(err);
    }
  }

  _encodeUnRegisteredResp(reqId) {
    return new Promise((resolve, reject) => {
      try {
        const encodeCb = this._pushCb(ffi.Callback(types.Void,
          [types.voidPointer, types.FfiResult, types.CString],
          (userData, result, res) => {
            const code = result.error_code;
            if (code !== 0 && !res) {
              return reject(JSON.stringify(result));
            }
            resolve(res);
          }));
        this.safeLib.encode_unregistered_resp(
          reqId,
          true,
          types.Null,
          this._getCb(encodeCb)
        );
      } catch (e) {
        reject(e.message);
      }
    });
  }

  _isAlreadyAuthorised(req) {
    return this.getRegisteredApps()
      .then((authorisedApps) =>
        ((authorisedApps.filter((apps) =>
          (lodash.isEqual(apps.app_info, req.app)))).length !== 0));
  }

  /**
   * Push network state to registered listeners
   * @param state
   * @private
   */
  _pushNetworkState(state) {
    let networkState = state;
    if (typeof networkState === 'undefined') {
      networkState = this.networkState;
    }

    this.networkState = networkState;

    if (this[_nwStateChangeListener] && this[_nwStateChangeListener].len() !== 0) {
      this[_nwStateChangeListener].broadcast(null, this.networkState);
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

const authenticator = new Authenticator();
export default authenticator;
