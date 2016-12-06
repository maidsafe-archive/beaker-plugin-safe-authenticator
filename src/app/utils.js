import CONSTANTS from './constants.json';

const LOCAL_DATA_KEYS = {
  AUTHENTICATOR_USER: 'AUTHENTICATOR_USER'
};

export const setUserAuthorised = (state = false) => {
  let isAuthorised = state;
  if (typeof isAuthorised !== 'boolean') {
    isAuthorised = false;
  }

  return window.localStorage.setItem(LOCAL_DATA_KEYS.AUTHENTICATOR_USER, JSON.stringify({
    isAuthorised
  }));
};

export const isUserAuthorised = () => {
  const userAuthData = JSON.parse(window.localStorage.getItem(LOCAL_DATA_KEYS.AUTHENTICATOR_USER));
  return (userAuthData && userAuthData.isAuthorised);
};

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
