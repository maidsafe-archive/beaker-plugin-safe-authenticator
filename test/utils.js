import crypto from 'crypto';

const getRandomCredentials = () => (
  {
    locator: crypto.randomBytes(32).toString('hex').slice(0, 15),
    secret: crypto.randomBytes(32).toString('hex').slice(0, 15)
  }
);

const utils = {
  getRandomCredentials
};
export default utils;
