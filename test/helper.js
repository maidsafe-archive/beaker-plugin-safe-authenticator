import crypto from 'crypto';
import client from '../src/ffi/client_manager';

/* eslint-disable import/prefer-default-export */
export const getRandomCredentials = () => (
  /* eslint-disable import/prefer-default-export */
  {
    locator: crypto.randomBytes(32).toString('hex').slice(0, 15),
    secret: crypto.randomBytes(32).toString('hex').slice(0, 15)
  }
);

export const createRandomAccount = () => {
  const randomCredentials = getRandomCredentials();
  return client.createAccount(randomCredentials.locator, randomCredentials.secret)
    .then(() => randomCredentials);
};

export const clearAccount = () => {
  client.setNetworkListener(() => {});
  client.logout();
};
