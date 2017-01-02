import client from '../ffi/client_manager';

export const manifest = {
  setNetworkListener: 'async',
  getAuthenticatorHandle: 'sync',
  logout: 'sync',
  login: 'promise',
  createAccount: 'promise',
  getAuthorisedApps: 'promise',
  revokeApp: 'promise'
};

export const getAuthenticatorHandle = () => client.getAuthenticatorHandle();

export const authDecision = (authData, isAllowed) =>
  client.authDecision(authData, isAllowed);

export const setNetworkIpcListener = (cb) => client.setNetworkIpcListener(cb);

export const setNetworkListener = (cb) => client.setNetworkListener(cb);

export const logout = () => client.logout();

export const login = (secret, password) => client.login(secret, password);

export const createAccount = (secret, password) => client.createAccount(secret, password);

export const getAuthorisedApps = () => client.getAuthorisedApps();

export const revokeApp = (appId) => client.revokeApp(appId);

export const createUnregisteredClient = () => client.createUnregisteredClient();

export const decryptRequest = (msg) => client.decryptRequest(msg);

export const setAuthReqListener = (cb) => client.setAuthReqListener(cb);

export const setContainerReqListener = (cb) => client.setContainerReqListener(cb);

export const setReqErrorListener = (cb) => client.setReqErrorListener(cb);
