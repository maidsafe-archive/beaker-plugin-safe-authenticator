/* eslint-disable no-underscore-dangle */
import should from 'should';
import i18n from 'i18n';
import clientManager from '../src/ffi/client_manager';

describe('Client', () => {
  describe('Unregistered client', () => {
    after(() => clientManager.dropHandle('unauthorised'));

    it('should be able to create unregistered client', () => (
      clientManager.createUnregisteredClient()
        .should.be.fulfilled()
        .then(() => {
          should(clientManager.clientHandle).have.keys('unauthorised');
        })
    ));
  });

  describe('Create account', () => {
    before(() => clientManager.createUnregisteredClient());

    after(() => clientManager.dropHandle('unauthorised'));

    it('should return error if locator is empty', () => (
      clientManager.createAccount()
        .should.be.rejectedWith(Error)
        .then((err) => {
          should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('Locator')));
        })
    ));

    it('should return error if secret is empty', () => (
      clientManager.createAccount('test')
        .should.be.rejectedWith(Error)
        .then((err) => {
          should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('Secret')));
        })
    ));

    it('should return error if locator is not string', () => (
      clientManager.createAccount(1111, 111)
        .should.be.rejectedWith(Error)
        .then((err) => {
          should(err.message).be.equal(i18n.__('messages.must_be_string', i18n.__('Locator')));
        })
    ));

    it('should return error if secret is not string', () => (
      clientManager.createAccount('test', 111)
        .should.be.rejectedWith(Error)
        .then((err) => {
          should(err.message).be.equal(i18n.__('messages.must_be_string', i18n.__('Secret')));
        })
    ));

    it('should return error if locator is empty string', () => (
      clientManager.createAccount('  ', 'test')
        .should.be.rejectedWith(Error)
        .then((err) => {
          should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('Locator')));
        })
    ));

    it('should return error if secret is empty string', () => (
      clientManager.createAccount('test', '  ')
        .should.be.rejectedWith(Error)
        .then((err) => {
          should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('Secret')));
        })
    ));

    it('should be able to create new account', () => (
      clientManager.createAccount('test', 'test')
        .should.be.fulfilled()
    ));
  });

  describe('User login', () => {
    before(() => clientManager.createUnregisteredClient());

    after(() => clientManager.dropHandle('unauthorised'));

    it('should return error if locator is empty', () => (
      clientManager.login()
        .should.be.rejectedWith(Error)
        .then((err) => {
          should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('Locator')));
        })
    ));

    it('should return error if secret is empty', () => (
      clientManager.login('test')
        .should.be.rejectedWith(Error)
        .then((err) => {
          should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('Secret')));
        })
    ));

    it('should return error if locator is not string', () => (
      clientManager.login(1111, 111)
        .should.be.rejectedWith(Error)
        .then((err) => {
          should(err.message).be.equal(i18n.__('messages.must_be_string', i18n.__('Locator')));
        })
    ));

    it('should return error if secret is not string', () => (
      clientManager.login('test', 111)
        .should.be.rejectedWith(Error)
        .then((err) => {
          should(err.message).be.equal(i18n.__('messages.must_be_string', i18n.__('Secret')));
        })
    ));

    it('should return error if locator is empty string', () => (
      clientManager.login('  ', 'test')
        .should.be.rejectedWith(Error)
        .then((err) => {
          should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('Locator')));
        })
    ));

    it('should return error if secret is empty string', () => (
      clientManager.login('test', '  ')
        .should.be.rejectedWith(Error)
        .then((err) => {
          should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('Secret')));
        })
    ));

    it('should be able to login', () => (
      clientManager.login('test', 'test')
        .should.be.fulfilled()
    ));
  });
});
