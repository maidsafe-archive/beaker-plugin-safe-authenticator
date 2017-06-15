import CONSTANTS from '../constants.json';

export const isUserAuthorised = () => window.safeAuthenticator.getAuthenticatorHandle();

export const checkAuthorised = (nextState, replace, callback) => {
  if (!isUserAuthorised()) {
    replace('/login');
  }
  callback();
};

export const getStrengthMsg = (strength) => {
  switch (true) {
    case (strength === 0): {
      return '';
    }
    case (strength < CONSTANTS.PASSPHRASE_STRENGTH.VERY_WEAK):
      return CONSTANTS.PASSPHRASE_STRENGTH_MSG.VERY_WEAK;
    case (strength < CONSTANTS.PASSPHRASE_STRENGTH.WEAK):
      return CONSTANTS.PASSPHRASE_STRENGTH_MSG.WEAK;
    case (strength < CONSTANTS.PASSPHRASE_STRENGTH.SOMEWHAT_SECURE):
      return CONSTANTS.PASSPHRASE_STRENGTH_MSG.SOMEWHAT_SECURE;
    case (strength >= CONSTANTS.PASSPHRASE_STRENGTH.SECURE):
      return CONSTANTS.PASSPHRASE_STRENGTH_MSG.SECURE;
    default:
  }
};

export const trimErrorMsg = (msg) => {
  let errMsg = msg;
  const cIndex = errMsg.indexOf(':');
  errMsg = errMsg.slice(cIndex === -1 ? 0 : cIndex + 1);
  const aIndex = errMsg.indexOf('->');
  errMsg = errMsg.slice(aIndex === -1 ? 0 : aIndex + 2);
  return errMsg.trim();
};
