/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-unresolved, import/extensions */
import ffi from 'ffi';
import ref from 'ref';
import crypto from 'crypto';
/* eslint-enable import/no-unresolved, import/extensions */
import i18n from 'i18n';
import {
  u32,
  Void,
  int32,
  bool,
  usize,
  u8Pointer,
  u32Pointer,
  voidPointer,
  AppHandlePointer,
  ffiStringPointer,
  Null,
  FfiString,
  AuthReq,
  ContainersReq
} from './models/types';
import FfiApi from './FfiApi';
import CONST from './constants.json';

const _networkState = Symbol('networkState');
const _networkStateChangeListener = Symbol('networkStateChangeListener');
const _networkStateChangeIpcListener = Symbol('networkStateChangeIpcListener');
const _authReqListener = Symbol('authReqListener');
const _containerReqListener = Symbol('containerReqListener');
const _reqErrorListener = Symbol('reqErrorListener');
const _clientHandle = Symbol('clientHandle');
const _reqDecryptList = Symbol('reqDecryptList');

class ClientManager extends FfiApi {
  constructor() {
    super();
    this[_networkState] = CONST.NETWORK_STATES.DISCONNECTED;
    this[_networkStateChangeListener] = null;
    this[_networkStateChangeIpcListener] = null;
    this[_authReqListener] = null;
    this[_containerReqListener] = null;
    this[_reqErrorListener] = null;
    this[_clientHandle] = {};
    this[_reqDecryptList] = {};
  }

  /* eslint-disable no-unused-vars, class-methods-use-this */
  getFunctionsToRegister() {
    /* eslint-enable no-unused-vars, class-methods-use-this */
    return {
      create_acc: [int32, [FfiString, FfiString, AppHandlePointer, 'pointer', 'pointer']],
      login: [int32, [FfiString, FfiString, AppHandlePointer, 'pointer', 'pointer']],
      decode_ipc_msg: [Void, [voidPointer, FfiString, voidPointer, 'pointer', 'pointer', 'pointer']],
      encode_auth_resp: [Void, [voidPointer, AuthReq, u32, bool, voidPointer, 'pointer']],
      encode_containers_resp: [Void, [voidPointer, ContainersReq, u32, bool, voidPointer, 'pointer']],
      ffi_string_create: [int32, [u32Pointer, usize, ffiStringPointer]]
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
   * @param appReq
   * @param isAllowed
   * @returns {Promise}
   */
  authDecision(appReq, isAllowed) {
    return new Promise((resolve, reject) => {
      if (!authReq || typeof isAllowed !== 'boolean') {
        return reject(new Error(i18n.__('invalid_params')));
      }
      const authenticatorHandle = this.getAuthenticatorHandle();

      if (!authenticatorHandle) {
        return reject(new Error(i18n.__('unauthorised')));
      }

      const reqId = appReq['req_id'];

      if (!reqId) {
        return reject(new Error(i18n.__('invalid_req')));
      }

      const authReq = this[_reqDecryptList][reqId];

      delete this[_reqDecryptList][reqId];

      try {
        const authReqCb = ffi.Callback(Void, [voidPointer, int32, FfiString], (userData, code, res) => {
          console.log('authReqCb :: ', res);
          resolve(res);
        });

        this.safeCore.encode_auth_resp(
          authenticatorHandle,
          authReq,
          reqId,
          isAllowed,
          Null,
          authReqCb
        );
      } catch (e) {
        reject(e.message);
      }
      resolve();
    });
  }

  /**
   * Authorise container request
   * @param contReq
   * @param isAllowed
   * @returns {Promise}
   */
  containerDecision(contReq, isAllowed) {
    return new Promise((resolve, reject) => {
      if (!contReq || typeof isAllowed !== 'boolean') {
        return reject(new Error(i18n.__('invalid_params')));
      }
      const authenticatorHandle = this.getAuthenticatorHandle();

      if (!authenticatorHandle) {
        return reject(new Error(i18n.__('unauthorised')));
      }

      const reqId = appReq['req_id'];

      if (!reqId) {
        return reject(new Error(i18n.__('invalid_req')));
      }

      const contReq = this[_reqDecryptList][reqId];

      delete this[_reqDecryptList][reqId];

      try {
        const contReqCb = ffi.Callback(Void, [voidPointer, int32, FfiString], (userData, code, res) => {
          console.log('contReqCb:: ', res);
          resolve(res);
        });

        this.safeCore.encode_containers_resp(
          authenticatorHandle,
          contReq,
          reqId,
          isAllowed,
          Null,
          authReqCb
        );
      } catch (e) {
        reject(e.message);
      }
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
          this._pushNetworkState(CONST.NETWORK_STATES.CONNECTED);
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
            return reject(err || res);
          }
          this.setClientHandle(CONST.DEFAULT_CLIENT_HANDLE_KEYS.AUTHENTICATOR, appHandle.deref());
          this._pushNetworkState(CONST.NETWORK_STATES.CONNECTED);
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
        console.error(`Create account error :: ${e.message}`);
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

  /**
   * Decrypt request
   */

  decryptRequest(msg) {
    msg = msg.replace('safe-auth://', '');
    console.log('safe alis', msg);
    return new Promise((resolve, reject) => {
      if (!msg) {
        return reject();
      }

      const authenticatorHandle = this.getAuthenticatorHandle();

      if (!authenticatorHandle) {
        return reject(new Error(i18n.__('unauthorised')));
      }

      const authReqCb = ffi.Callback(Void, [voidPointer, u32, AuthReq], (userData, res, req) => {
        const parsedReq = {
          app: {},
          app_container: null,
          containers: [ { cont_name: '_public', access: ['Read'] } ] // TODO remove it
        };
        parsedReq.app['id'] = this._reinterpret(req.app.id.ptr, req.app.id.len);
        parsedReq.app['scope'] = this._reinterpret(req.app.scope, req.app.scope_len);
        parsedReq.app['name'] = this._reinterpret(req.app.name.ptr, req.app.name.len);
        parsedReq.app['vendor'] = this._reinterpret(req.app.vendor.ptr, req.app.vendor.len);

        parsedReq.app_container = req.app_container;

        console.log('req.containers.ptr[i] :: ', req.containers.ptr.length);

        // let contPer = {};
        // let  i = 0;
        // for (i = 0; i < req.containers.len; i++) {
        //   console.log('iiii :: ', i);
        //   contPer = {
        //     cont_name: this._reinterpret(req.containers.ptr[i].cont_name.ptr, req.containers.ptr[i].cont_name.len),
        //     access: []
        //   };
        //   let j = 0;
        //   for (j = 0; j < req.containers.ptr[i].access.len; j++) {
        //     contPer.access.push(req.containers.ptr[i].access.ptr[j].key);
        //   }
        //   parsedReq.containers.push(contPer);
        // }
        const reqId = crypto.randomBytes(10).toString('hex');
        this[_reqDecryptList][reqId] = req;
        if (typeof this[_authReqListener] !== 'function') {
          return;
        }
        this[_authReqListener]({
          reqId,
          AuthReq: parsedReq
        });
      });

      const containerReqCb = ffi.Callback(Void, [voidPointer, int32, ContainersReq], (userData, res, req) => {
        console.log('containerReqCb :: ', req);
      });

      const reqErrorCb = ffi.Callback(Void, [voidPointer, int32, FfiString], (userData, res, error) => {
        console.log('reqErrorCb :: ', res, error);
      });

      try {
        this.safeCore.decode_ipc_msg(
          authenticatorHandle,
          this._createFFIString(msg),
          Null,
          authReqCb,
          containerReqCb,
          reqErrorCb);
      } catch (e) {
        console.error(`Auth request decrypt error :: ${e.message}`);
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
    // TODO drop client handle
    delete this[_clientHandle][key];
  }

  _createFFIString(str) {
    const buff = new Buffer(str);
    const stringPointer = ref.alloc(FfiString);
    const res = this.safeCore.ffi_string_create(buff, buff.length, stringPointer);
    if (res !== 0) {
      throw 'Create string failed' + res;
    }
    return stringPointer.deref();
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
      this._pushNetworkState();
    });
  }

  _pushNetworkState(state) {
    let networkState = state;
    if (typeof networkState === 'undefined') {
      networkState = this[_networkState];
    }
    console.log('network state cm ::', networkState);
    if (typeof this[_networkStateChangeListener] === 'function') {
      console.log('test 111')
      this[_networkStateChangeListener](null, networkState);
    }
    if (typeof this[_networkStateChangeIpcListener] === 'function') {
      this[_networkStateChangeIpcListener](null, networkState);
    }
  }

  _isClientHandleExist(clientHandleKey) {
    return {}.hasOwnProperty.call(this[_clientHandle], clientHandleKey);
  }

  _reinterpret(ptr, len) {
    if (len === 0) {
      return null
    }
    return ref.reinterpret(ptr, len).toString()
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
