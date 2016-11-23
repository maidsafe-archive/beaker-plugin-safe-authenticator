/* eslint-disable func-names */
/* eslint-disable no-underscore-dangle */
import FfiApi from './FfiApi';
import CONST from './constants.json';

const _networkState = Symbol('networkState');
const _networkStateChangeListener = Symbol('networkStateChangeListener');
const _clientHandle = Symbol('clientHandle');

class ClientManager extends FfiApi {
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

  setNetworkListener(cb) {
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
