/* eslint-disable import/prefer-default-export */

export const checkAuthorised = (nextState, replace, callback) => {
  if (nextState.auth && nextState.auth.isAuthorised) {
    replace('/home');
  }
  callback();
};
