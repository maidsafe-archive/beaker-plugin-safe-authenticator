import Enum from 'enum';

export default {
  NETWORK_STATUS: {
    CONNECTED: 0,
    DISCONNECTED: -1
  },
  LIB_PATH: {
    PTHREAD: './libwinpthread-1.dll',
    SAFE_AUTH: {
      win32: './safe_authenticator.dll',
      darwin: './libsafe_authenticator.dylib',
      linux: './libsafe_authenticator.so'
    },
    SYSTEM_URI: {
      win32: './system_uri.dll',
      darwin: './libsystem_uri.dylib',
      linux: './libsystem_uri.so'
    }
  },
  LISTENER_TYPES: new Enum([
    'APP_LIST_UPDATE',
    'AUTH_REQ',
    'CONTAINER_REQ',
    'NW_STATE_CHANGE',
    'REQUEST_ERR'
  ]),
  CLIENT_TYPES: {
    DESKTOP: 'DESKTOP',
    WEB: 'WEB'
  },
  CREATE_ACC_NAV: {
    WELCOME: 1,
    INVITE_CODE: 2,
    SECRET_FORM: 3,
    PASSWORD_FORM: 4
  },
  PASSPHRASE_STRENGTH: {
    VERY_WEAK: 4,
    WEAK: 8,
    SOMEWHAT_SECURE: 10,
    SECURE: 10
  },
  PASSPHRASE_STRENGTH_MSG: {
    VERY_WEAK: 'Very weak',
    WEAK: 'Weak',
    SOMEWHAT_SECURE: 'Somewhat secure',
    SECURE: 'Secure'
  },
  RE_AUTHORISE: {
    KEY: 'SAFE_LOCAL_RE_AUTHORISE_STATE',
    LOCK_MSG: 'Apps cannot re-authenticate automatically',
    UNLOCK_MSG: 'Apps can re-authenticate automatically',
    STATE: {
      LOCK: 0,
      UNLOCK: 1
    }
  }
};
