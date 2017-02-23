/* eslint-disable no-underscore-dangle */
import should from 'should';
import i18n from 'i18n';
import clientManager from '../src/ffi/client_manager';
import { getRandomCredentials } from './utils';

describe('Client', () => {
  // describe('Create account', () => {
  //   after(() => {
  //     clientManager.logout();
  //   });
  //
  //   it('should return error if locator is empty', () => (
  //     clientManager.createAccount()
  //       .should.be.rejectedWith(Error)
  //       .then((err) => {
  //         should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('Locator')));
  //       })
  //   ));
  //
  //   it('should return error if secret is empty', () => (
  //     clientManager.createAccount('test')
  //       .should.be.rejectedWith(Error)
  //       .then((err) => {
  //         should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('Secret')));
  //       })
  //   ));
  //
  //   it('should return error if locator is not string', () => (
  //     clientManager.createAccount(1111, 111)
  //       .should.be.rejectedWith(Error)
  //       .then((err) => {
  //         should(err.message).be.equal(i18n.__('messages.must_be_string', i18n.__('Locator')));
  //       })
  //   ));
  //
  //   it('should return error if secret is not string', () => (
  //     clientManager.createAccount('test', 111)
  //       .should.be.rejectedWith(Error)
  //       .then((err) => {
  //         should(err.message).be.equal(i18n.__('messages.must_be_string', i18n.__('Secret')));
  //       })
  //   ));
  //
  //   it('should return error if locator is empty string', () => (
  //     clientManager.createAccount('  ', 'test')
  //       .should.be.rejectedWith(Error)
  //       .then((err) => {
  //         should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('Locator')));
  //       })
  //   ));
  //
  //   it('should return error if secret is empty string', () => (
  //     clientManager.createAccount('test', '  ')
  //       .should.be.rejectedWith(Error)
  //       .then((err) => {
  //         should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('Secret')));
  //       })
  //   ));
  //
  //   it('should be able to create new account', () => {
  //     const randomCredentials = getRandomCredentials();
  //     return clientManager.createAccount(randomCredentials.locator, randomCredentials.secret)
  //       .should.be.fulfilled();
  //   });
  // });
  //
  // describe('User login', () => {
  //   after(() => {
  //     clientManager.logout();
  //   });
  //
  //   it('should return error if locator is empty', () => (
  //     clientManager.login()
  //       .should.be.rejectedWith(Error)
  //       .then((err) => {
  //         should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('Locator')));
  //       })
  //   ));
  //
  //   it('should return error if secret is empty', () => (
  //     clientManager.login('test')
  //       .should.be.rejectedWith(Error)
  //       .then((err) => {
  //         should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('Secret')));
  //       })
  //   ));
  //
  //   it('should return error if locator is not string', () => (
  //     clientManager.login(1111, 111)
  //       .should.be.rejectedWith(Error)
  //       .then((err) => {
  //         should(err.message).be.equal(i18n.__('messages.must_be_string', i18n.__('Locator')));
  //       })
  //   ));
  //
  //   it('should return error if secret is not string', () => (
  //     clientManager.login('test', 111)
  //       .should.be.rejectedWith(Error)
  //       .then((err) => {
  //         should(err.message).be.equal(i18n.__('messages.must_be_string', i18n.__('Secret')));
  //       })
  //   ));
  //
  //   it('should return error if locator is empty string', () => (
  //     clientManager.login('  ', 'test')
  //       .should.be.rejectedWith(Error)
  //       .then((err) => {
  //         should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('Locator')));
  //       })
  //   ));
  //
  //   it('should return error if secret is empty string', () => (
  //     clientManager.login('test', '  ')
  //       .should.be.rejectedWith(Error)
  //       .then((err) => {
  //         should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('Secret')));
  //       })
  //   ));
  //
  //   it('should be able to login', () => {
  //     const randomCredentials = getRandomCredentials();
  //     return clientManager.createAccount(randomCredentials.locator, randomCredentials.secret)
  //       .should.be.fulfilled()
  //       .then(() => clientManager.login(randomCredentials.locator, randomCredentials.secret))
  //       .should.be.fulfilled();
  //   });
  // });
  //
  // describe('Revoke application', () => {
  //   const randomCredentials = getRandomCredentials();
  //   const appPayload = {};
  //   before(() => (
  //     clientManager.createAccount(randomCredentials.locator, randomCredentials.secret)
  //   ));
  //
  //   after(() => clientManager.logout());
  //
  //   it('should return error if appToken is null', () => (
  //     clientManager.revokeApp()
  //       .should.be.rejectedWith(Error)
  //       .then((err) => {
  //         should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('AppId')));
  //       })
  //   ));
  //
  //   it('should return error if appToken is not string', () => (
  //     clientManager.revokeApp(111)
  //       .should.be.rejectedWith(Error)
  //       .then((err) => {
  //         should(err.message).be.equal(i18n.__('messages.must_be_string', i18n.__('AppId')));
  //       })
  //   ));
  //
  //   it('should return error if appToken is not empty', () => (
  //     clientManager.revokeApp(' ')
  //       .should.be.rejectedWith(Error)
  //       .then((err) => {
  //         should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('AppId')));
  //       })
  //   ));
  //
  //   it('should be able to revoke application', () => {
  //     let appId = 'test';
  //     clientManager.authDecision(appId, appPayload, true)
  //       .should.be.fulfilled()
  //       .then((res) => {
  //         appId = res || appId; // TODO remove `appId`
  //       })
  //       // TODO should validate application exist after authorisation
  //       .then(() => clientManager.revokeApp(appId))
  //       .should.be.fulfilled()
  //       .then(() => clientManager.getAuthorisedApps())
  //       .should.be.fulfilled()
  //       .then((res) => {
  //         should(res.indexOf(appId)).equal(-1);
  //       });
  //   });
  // });
  //
  // describe('Get authorised applications', () => {
  //   it('should return error if unauthorised', () => (
  //     clientManager.getAuthorisedApps()
  //       .should.be.rejectedWith(Error)
  //       .then((err) => {
  //         should(err.message).be.equal(i18n.__('messages.unauthorised'));
  //       })
  //   ));
  //
  //   it('should be able to get authorised application list', () => {
  //     const randomCredentials = getRandomCredentials();
  //     const appPayload = {};
  //     let appId = 'test';
  //     clientManager.createAccount(randomCredentials.locator, randomCredentials.secret)
  //       .should.be.fulfilled()
  //       .then(() => clientManager.authDecision(appId, appPayload, true))
  //       .should.be.fulfilled()
  //       .then((res) => {
  //         appId = res || appId; // TODO remove `appId`
  //       })
  //       .then(() => clientManager.getAuthorisedApps())
  //       .should.be.fulfilled()
  //       .then((res) => {
  //         should(res).be.Array();
  //         // should(res.length).not.be.equal(0);
  //         // TODO check keys
  //       })
  //       .then(() => clientManager.revokeApp(appId))
  //       .should.be.fulfilled()
  //       .then(() => clientManager.logout());
  //   });
  // });
});
