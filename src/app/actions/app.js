export const GET_AUTHORISED_APPS = 'GET_AUTHORISED_APPS';
export const REVOKE_APP = 'REVOKE_APP';

export const getAuthorisedApps = () => ({
  type: GET_AUTHORISED_APPS,
  payload: window.safeAuthenticator.getAuthorisedApps()
});

export const revokeApp = (appId) => ({
  type: REVOKE_APP,
  payload: window.safeAuthenticator.revokeApp(appId)
});
