import client from '../ffi/client_manager';

export const manifest = {
  setNetworkListener: 'async',
  setAppListUpdateListener: 'async',
  getNetworkState: 'sync',
  getAuthenticatorHandle: 'sync',
  logout: 'sync',
  login: 'promise',
  createAccount: 'promise',
  getAuthorisedApps: 'promise',
  revokeApp: 'promise'
};

export const getAuthenticatorHandle = () => (client.authenticatorHandle);

export const authDecision = (authData, isAllowed) =>
  client.authDecision(authData, isAllowed);

export const containerDecision = (contData, isAllowed) =>
  client.containerDecision(contData, isAllowed);

export const setNetworkIpcListener = (cb) => client.setNetworkIpcListener(cb);

export const setNetworkListener = (cb) => client.setNetworkListener(cb);

export const getNetworkState = () => (client.networkState);

export const setAppListUpdateListener = (cb) => client.setAppListUpdateListener(cb);

export const logout = () => client.logout();

export const login = (secret, password) => client.login(secret, password);

export const createAccount = (secret, password, invitation) =>
  client.createAccount(secret, password, invitation);

export const getAuthorisedApps = () => client.getAuthorisedApps();

export const revokeApp = (appId) => client.revokeApp(appId);

export const decryptRequest = (msg) => client.decryptRequest(msg);

export const setAuthReqListener = (cb) => client.setAuthReqListener(cb);

export const setContainerReqListener = (cb) => client.setContainerReqListener(cb);

export const setReqErrorListener = (cb) => client.setReqErrorListener(cb);

export const openUri = (uri) => client.openUri(uri);
