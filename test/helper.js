import crypto from 'crypto';
import client from '../src/ffi/authenticator';

/* eslint-disable import/prefer-default-export */
export const getRandomCredentials = () => (
  /* eslint-disable import/prefer-default-export */
  ({
    locator: crypto.randomBytes(32).toString('hex').slice(0, 15),
    secret: crypto.randomBytes(32).toString('hex').slice(0, 15),
    invite: crypto.randomBytes(10).toString('hex')
  })
);

export function to(promise) {
   return promise.then(data => {

     console.log("promise returned good");
      return [null, data];
   })
   .catch(err => {
     console.log("promise returned baaaaaadddd", err.message);
     return [err] });
}

export const createRandomAccount = () => {
  console.log("cereating random account");
  const randomCredentials = getRandomCredentials();
  console.log("got creds random account", randomCredentials);
  return client.createAccount(
    randomCredentials.locator,
    randomCredentials.secret,
    randomCredentials.invite
  )
    .then(() => {
      console.log("NOT HAPPENING EHHHH");
      return randomCredentials } );
};

export const clearAccount = () => {
  console.log("clearing acccnnntt");
  client.logout();
}
