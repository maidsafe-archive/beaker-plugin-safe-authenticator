/* eslint-disable no-underscore-dangle */
import should from 'should';
import crypto from 'crypto';
import i18n from 'i18n';
import client from '../src/ffi/client_manager';
import * as helper from './helper';
import CONST from '../src/constants.json';

describe('Client', () => {
  let randomCredentials = null;
  const encodedAuthUri = 'safe-auth:AAAAABq3ESUAAAAAHgAAAAAAAABuZXQubWFpZHN' +
    'hZmUuZXhhbXBsZXMudGVzdC1hcHAAEgAAAAAAAABOb2RlSlMgZXhhbXBsZSBBcHARAAAAA' +
    'AAAAE1haWRTYWZlLm5ldCBMdGQuAAEAAAAAAAAABwAAAAAAAABfcHVibGljBAAAAAAAAAAA' +
    'AAAAAQAAAAMAAAAEAAAA';
  const encodedContUri = 'safe-auth:AAAAACeJbVQBAAAAHgAAAAAAAABuZXQubWFpZHN' +
    'hZmUuZXhhbXBsZXMudGVzdC1hcHAAEgAAAAAAAABOb2RlSlMgZXhhbXBsZSBBcHARAAAAA' +
    'AAAAE1haWRTYWZlLm5ldCBMdGQuAQAAAAAAAAAHAAAAAAAAAF9wdWJsaWMEAAAAAAAAAAA' +
    'AAAABAAAAAwAAAAQAAAA=';

  const decodedReqForRandomClient = (uri) => helper.createRandomAccount()
    .then(() => client.decryptRequest(uri));

  describe('create Account', () => {
    after(() => helper.clearAccount());

    it('throws an error when account locator is empty', () => client.createAccount()
      .should.be.rejectedWith(Error)
      .then((err) => {
        should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('Locator')));
      })
    );

    it('throws error when account secret is empty', () => client.createAccount('test')
      .should.be.rejectedWith(Error)
      .then((err) => {
        should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('Secret')));
      })
    );

    it('throws an error when account locator is not string', () => client.createAccount(1111, 111)
      .should.be.rejectedWith(Error)
      .then((err) => {
        should(err.message).be.equal(i18n.__('messages.must_be_string', i18n.__('Locator')));
      })
    );

    it('throws an error when account secret is not string', () => client.createAccount('test', 111)
      .should.be.rejectedWith(Error)
      .then((err) => {
        should(err.message).be.equal(i18n.__('messages.must_be_string', i18n.__('Secret')));
      })
    );

    it('throws an error when account locator is empty string', () => client.createAccount(' ', 'test')
      .should.be.rejectedWith(Error)
      .then((err) => {
        should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('Locator')));
      })
    );

    it('throws an error when account secret is empty string', () => client.createAccount('test', ' ')
      .should.be.rejectedWith(Error)
      .then((err) => {
        should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('Secret')));
      })
    );

    it('sets authenticator handle when account creation is successful', () => {
      randomCredentials = helper.getRandomCredentials();
      return client.createAccount(randomCredentials.locator,
        randomCredentials.secret, randomCredentials.invite)
        .should.be.fulfilled()
        .then(() => {
          should(client.authenticatorHandle).not.be.empty();
          should(client.authenticatorHandle).not.be.null();
          should(client.authenticatorHandle).not.be.undefined();
          should(client.authenticatorHandle).be.instanceof(Buffer);
        });
    });

    it('emit network state as connected when account creation is successful', () => (
      new Promise((resolve) => {
        client.setNetworkListener((err, state) => {
          should(err).be.null();
          should(state).not.be.undefined();
          should(state).be.equal(CONST.NETWORK_STATUS.CONNECTED);
          return resolve();
        });
        helper.createRandomAccount();
      }))
    );
  });

  describe('login', () => {
    before(() => helper.createRandomAccount()
      .then((credential) => (randomCredentials = credential))
    );

    after(() => helper.clearAccount());

    it('throws an error when account locator is empty', () => client.login()
      .should.be.rejectedWith(Error)
      .then((err) => {
        should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('Locator')));
      })
    );

    it('throws an error when account secret is empty', () => client.login('test')
      .should.be.rejectedWith(Error)
      .then((err) => {
        should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('Secret')));
      })
    );

    it('throws an error when account locator is not string', () => client.login(1111, 111)
      .should.be.rejectedWith(Error)
      .then((err) => {
        should(err.message).be.equal(i18n.__('messages.must_be_string', i18n.__('Locator')));
      })
    );

    it('throws an error when account secret is not string', () => client.login('test', 111)
      .should.be.rejectedWith(Error)
      .then((err) => {
        should(err.message).be.equal(i18n.__('messages.must_be_string', i18n.__('Secret')));
      })
    );

    it('throws an error when account locator is empty string', () => client.login('  ', 'test')
      .should.be.rejectedWith(Error)
      .then((err) => {
        should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('Locator')));
      })
    );

    it('throws an error when account secret is empty string', () => client.login('test', '  ')
      .should.be.rejectedWith(Error)
      .then((err) => {
        should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('Secret')));
      })
    );

    it('sets authenticator handle when account login is successful', () => client.login(randomCredentials.locator,
      randomCredentials.secret)
      .should.be.fulfilled()
      .then(() => {
        should(client.authenticatorHandle).not.be.empty();
        should(client.authenticatorHandle).not.be.null();
        should(client.authenticatorHandle).not.be.undefined();
        should(client.authenticatorHandle).be.instanceof(Buffer);
      })
    );

    it('emit network state as connected when account login is successful', () => (
      new Promise((resolve) => {
        client.setNetworkListener((err, state) => {
          should(err).be.null();
          should(state).not.be.undefined();
          should(state).be.equal(CONST.NETWORK_STATUS.CONNECTED);
          return resolve();
        });
        helper.createRandomAccount();
      }))
    );
  });

  describe('decrypt request', () => {
    before(() => helper.createRandomAccount());

    after(() => helper.clearAccount());

    it('throws an error when encoded URI is empty', () =>
      client.decryptRequest().should.be.rejected()
    );

    it('throws an error for container request of unknown app', () => (
      new Promise((resolve, reject) => {
        client.setContainerReqListener((res) => reject(res));

        client.setReqErrorListener((err) => {
          should(err).not.be.empty().and.be.Object();
          resolve(err);
        });
        client.decryptRequest(encodedContUri);
      })
    ));

    it('throws an error for invalid URI', () => (
      new Promise((resolve, reject) => {
        client.setAuthReqListener((res) => reject(res));

        client.setReqErrorListener((err) => resolve(err));

        client.decryptRequest(`safe-auth:${crypto.randomBytes(32).toString('base64')}`);
      })
    ));

    it('returns a decoded request for encoded Auth request', () => (
      new Promise((resolve, reject) => {
        client.setAuthReqListener((res) => {
          should(res).not.be.undefined().and.be.Object().and.not.empty().and.have.properties(['reqId', 'authReq']);
          should(res.reqId).not.be.undefined().and.be.Number();
          should(res.authReq).be.Object().and.not.empty().and.have.properties([
            'app',
            'app_container',
            'containers',
            'containers_len',
            'containers_cap']);
          should(res.authReq.app).be.Object().and.not.empty().and.have.properties([
            'id',
            'scope',
            'name',
            'vendor']);
          should(res.authReq.app.id).not.be.undefined().and.not.be.empty().and.be.String();
          // should(res.authReq.app.scope).not.be.undefined().and.be.String();
          should(res.authReq.app.name).not.be.undefined().and.not.be.empty().and.be.String();
          should(res.authReq.app.vendor).not.be.undefined().and.not.be.empty().and.be.String();
          should(res.authReq.app_container).not.be.undefined().and.be.Boolean();
          should(res.authReq.containers).not.be.undefined().and.be.Array();
          should(res.authReq.containers_len).not.be.undefined().and.be.Number();
          should(res.authReq.containers_cap).not.be.undefined().and.be.Number();

          if (res.authReq.containers_len > 0) {
            const container0 = res.authReq.containers[0];
            should(container0).be.Object().and.not.empty().and.have.properties([
              'cont_name',
              'access',
              'access_len',
              'access_cap'
            ]);
            should(container0.cont_name).not.be.undefined().and.not.be.empty().and.be.String();
            should(container0.access).not.be.undefined().and.not.be.empty().and.be.Array();
            should(container0.access_len).not.be.undefined().and.be.Number();
            should(container0.access_cap).not.be.undefined().and.be.Number();
          }
          return resolve();
        });

        client.setReqErrorListener((err) => reject(err));

        client.decryptRequest(encodedAuthUri);
      })
    ));

    it('returns a decoded request for encoded Auth request without safe-auth: scheme', () => (
      new Promise((resolve, reject) => {
        client.setAuthReqListener((res) => {
          should(res).not.be.undefined().and.be.Object().and.not.empty().and.have.properties(['reqId', 'authReq']);
          return resolve();
        });

        client.setReqErrorListener((err) => reject(err));

        client.decryptRequest(encodedAuthUri.replace('safe-auth:', ''));
      })
    ));

    it('retuns a decoded request for encoded Container request', () => (
      new Promise((resolve, reject) => {
        client.setContainerReqListener((res) => {
          should(res).not.be.undefined().and.be.Object().and.not.empty().and.have.properties(['reqId', 'contReq']);
          should(res.reqId).not.be.undefined().and.be.Number();
          should(res.contReq).be.Object().and.not.empty().and.have.properties([
            'app',
            'containers',
            'containers_len',
            'containers_cap']);
          should(res.contReq.app).be.Object().and.not.empty().and.have.properties([
            'id',
            'scope',
            'name',
            'vendor']);
          should(res.contReq.app.id).not.be.undefined().and.not.be.empty().and.be.String();
          // should(res.contReq.app.scope).not.be.undefined().and.be.String();
          should(res.contReq.app.name).not.be.undefined().and.not.be.empty().and.be.String();
          should(res.contReq.app.vendor).not.be.undefined().and.not.be.empty().and.be.String();
          should(res.contReq.containers).not.be.undefined().and.be.Array();
          should(res.contReq.containers_len).not.be.undefined().and.be.Number();
          should(res.contReq.containers_cap).not.be.undefined().and.be.Number();

          if (res.contReq.containers_len > 0) {
            const container0 = res.contReq.containers[0];
            should(container0).be.Object().and.not.empty().and.have.properties([
              'cont_name',
              'access',
              'access_len',
              'access_cap'
            ]);
            should(container0.cont_name).not.be.undefined().and.not.be.empty().and.be.String();
            should(container0.access).not.be.undefined().and.not.be.empty().and.be.Array();
            should(container0.access_len).not.be.undefined().and.be.Number();
            should(container0.access_cap).not.be.undefined().and.be.Number();
          }
          return resolve();
        });

        client.setAuthReqListener((req) => {
          client.authDecision(req, true).then(() => client.decryptRequest(encodedContUri));
        });

        client.setReqErrorListener((err) => reject(err));

        client.decryptRequest(encodedAuthUri);
      }))
    );

    it('returns a decoded request for encoded Container request without safe-auth: scheme', () => (
      new Promise((resolve, reject) => {
        client.setContainerReqListener((res) => {
          should(res).not.be.undefined().and.be.Object().and.not.empty().and.have.properties(['reqId', 'contReq']);
          return resolve();
        });

        client.setAuthReqListener((req) => reject(req));

        client.setReqErrorListener((err) => reject(err));

        client.decryptRequest(encodedContUri);
      })
    ));
  });

  describe('encode auth response', () => {
    let decodedReq = null;
    const prepareReq = () => new Promise((resolve, reject) => {
      client.setAuthReqListener((req) => {
        decodedReq = req;
        return resolve();
      });

      client.setReqErrorListener((err) => reject(err));

      decodedReqForRandomClient(encodedAuthUri);
    });

    before(() => prepareReq());

    after(() => helper.clearAccount());

    it('throws an error if request is undefined', () => client.authDecision()
      .should.be.rejectedWith(Error)
      .then((err) => {
        should(err.message).be.equal(i18n.__('messages.invalid_params'));
      })
    );

    it('throws an error if decision is not boolean type', () => (
      Promise.all([
        client.authDecision({}, 123).should.be.rejectedWith(Error).then((err) => should(err.message).be.equal(i18n.__('messages.invalid_params'))),
        client.authDecision({}, 'string').should.be.rejectedWith(Error).then((err) => should(err.message).be.equal(i18n.__('messages.invalid_params'))),
        client.authDecision({}, { a: 1 }).should.be.rejectedWith(Error).then((err) => should(err.message).be.equal(i18n.__('messages.invalid_params'))),
        client.authDecision({}, [1, 2, 3]).should.be.rejectedWith(Error).then((err) => should(err.message).be.equal(i18n.__('messages.invalid_params'))),
        client.authDecision({}, [1, 2, 3]).should.be.rejectedWith(Error).then((err) => should(err.message).be.equal(i18n.__('messages.invalid_params')))
      ]))
    );

    it('throws an error if request doesn\'t have request ID(reqId)', () => client.authDecision({}, true)
      .should.be.rejectedWith(Error)
      .then((err) => should(err.message).be.equal(i18n.__('messages.invalid_req')))
    );

    it('throws an error when invalid request is passed', () => client.authDecision(Object.assign({}, decodedReq, { reqId: 123 }), true)
      .should.be.rejectedWith(Error)
      .then((err) => should(err.message).be.equal(i18n.__('messages.invalid_req')))
    );

    it('returns encoded response URI on success of deny', () => client.authDecision(decodedReq, false)
      .should.be.fulfilled()
      .then((res) => should(res).not.be.empty().and.be.String())
    );

    it('returns encoded response URI on success of allow', () => prepareReq()
      .then(() => client.authDecision(decodedReq, true))
      .should.be.fulfilled()
      .then((res) => should(res).not.be.empty().and.be.String())
    );
  });

  describe('encode container response', () => {
    let decodedReq = null;
    const prepareReq = () => new Promise((resolve, reject) => {
      client.setContainerReqListener((req) => {
        decodedReq = req;
        return resolve();
      });

      client.setAuthReqListener((req) => {
        client.authDecision(req, true).then(() => client.decryptRequest(encodedContUri));
      });

      client.setReqErrorListener(reject);

      decodedReqForRandomClient(encodedAuthUri);
    });

    before(() => prepareReq());

    after(() => helper.clearAccount());

    it('throws an error if request is undefined', () => client.containerDecision()
      .should.be.rejectedWith(Error)
      .then((err) => {
        should(err.message).be.equal(i18n.__('messages.invalid_params'));
      })
    );

    it('throws an error if decision is not boolean type', () => (
      Promise.all([
        client.containerDecision({}, 123).should.be.rejectedWith(Error).then((err) => should(err.message).be.equal(i18n.__('messages.invalid_params'))),
        client.containerDecision({}, 'string').should.be.rejectedWith(Error).then((err) => should(err.message).be.equal(i18n.__('messages.invalid_params'))),
        client.containerDecision({}, { a: 1 }).should.be.rejectedWith(Error).then((err) => should(err.message).be.equal(i18n.__('messages.invalid_params'))),
        client.containerDecision({}, [1, 2, 3]).should.be.rejectedWith(Error).then((err) => should(err.message).be.equal(i18n.__('messages.invalid_params'))),
        client.containerDecision({}, [1, 2, 3]).should.be.rejectedWith(Error).then((err) => should(err.message).be.equal(i18n.__('messages.invalid_params')))
      ]))
    );

    it('throws an error if request doesn\'t have request ID(reqId)', () => client.containerDecision({}, true)
      .should.be.rejectedWith(Error)
      .then((err) => should(err.message).be.equal(i18n.__('messages.invalid_req')))
    );

    it('throws an error when invalid request is passed', () => client.containerDecision(Object.assign({}, decodedReq, { reqId: 123 }), true)
      .should.be.rejectedWith(Error)
      .then((err) => should(err.message).be.equal(i18n.__('messages.invalid_req')))
    );

    it('returns encoded response URI on success of deny', () => client.containerDecision(decodedReq, false)
      .should.be.fulfilled()
      .then((res) => should(res).not.be.empty().and.be.String())
    );

    it('returns encoded response URI on success of allow', () => prepareReq()
      .then(() => client.containerDecision(decodedReq, true))
      .should.be.fulfilled()
      .then((res) => should(res).not.be.empty().and.be.String())
    );
  });

  describe('get authorised apps', () => {
    const prepareReq = () => new Promise((resolve, reject) => {
      client.setAuthReqListener((req) => client.authDecision(req, true).then(resolve));

      client.setReqErrorListener(reject);

      client.decryptRequest(encodedAuthUri);
    });

    before(() => helper.createRandomAccount());

    after(() => helper.clearAccount());

    it('return empty array before registering any app', () => client.getAuthorisedApps()
      .should.be.fulfilled()
      .then((apps) => should(apps).be.Array().and.be.empty())
    );

    it('return apps list after registering apps', () => prepareReq()
      .then(() => client.getAuthorisedApps())
      .should.be.fulfilled()
      .then((apps) => should(apps).be.Array().and.not.be.empty())
    );
  });

  describe('revoke app', () => {
    let appId = null;
    before(() => new Promise(
      (resolve, reject) => {
        client.setAuthReqListener((req) => {
          appId = req.authReq.app.id;
          return client.authDecision(req, true).then(resolve);
        });

        client.setReqErrorListener(reject);

        decodedReqForRandomClient(encodedAuthUri);
      })
    );

    after(() => helper.clearAccount());

    it('throws an error when appId is undefined', () => client.revokeApp()
      .should.be.rejectedWith(Error)
      .then((err) => should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('AppId'))))
    );

    it('throws an error when appId is not of String type', () => (
      Promise.all([
        client.revokeApp(123).should.be.rejectedWith(Error).then((err) => should(err.message).be.equal(i18n.__('messages.must_be_string', i18n.__('AppId')))),
        client.revokeApp(true).should.be.rejectedWith(Error).then((err) => should(err.message).be.equal(i18n.__('messages.must_be_string', i18n.__('AppId')))),
        client.revokeApp({ a: 1 }).should.be.rejectedWith(Error).then((err) => should(err.message).be.equal(i18n.__('messages.must_be_string', i18n.__('AppId')))),
        client.revokeApp([1, 2, 3]).should.be.rejectedWith(Error).then((err) => should(err.message).be.equal(i18n.__('messages.must_be_string', i18n.__('AppId'))))
      ])
    ));

    it('throws an error when appId is empty string', () => client.revokeApp(' ')
      .should.be.rejectedWith(Error)
      .then((err) => should(err.message).be.equal(i18n.__('messages.should_not_be_empty', i18n.__('AppId'))))
    );

    it('removes app from registered app list', () => client.revokeApp(appId)
      .should.be.fulfilled()
      .then(() => client.getAuthorisedApps())
      .then((apps) => should(apps).be.Array().and.be.empty())
    );
  });

  describe('after revoking', () => {
    before(() => new Promise(
      (resolve, reject) => {
        client.setAuthReqListener((req) => {
          const appId = req.authReq.app.id;
          return client.authDecision(req, true)
            .then(() => client.revokeApp(appId).then(resolve));
        });

        client.setReqErrorListener(reject);

        decodedReqForRandomClient(encodedAuthUri);
      })
    );

    after(() => helper.clearAccount());

    it('same app can be registered again', () => (
      new Promise((resolve, reject) => {
        setTimeout(() => {
          client.setAuthReqListener((req) => (
            client.authDecision(req, true)
              .then(() => client.getAuthorisedApps()
                .then((apps) => {
                  should(apps.length).be.equal(1);
                  return resolve();
                }))
          ));
          client.setReqErrorListener(reject);
          client.decryptRequest(encodedAuthUri);
        }, 1000);
      }))
    );
  });

  describe('re-authorising', () => {
    before(() => new Promise(
      (resolve, reject) => {
        client.setAuthReqListener((req) => client.authDecision(req, true).then(resolve));

        client.setReqErrorListener(reject);

        decodedReqForRandomClient(encodedAuthUri);
      })
    );

    after(() => helper.clearAccount());

    it('doesn\'t throw error', () => (
      new Promise((resolve, reject) => {
        client.setAuthReqListener((req) => (
          client.authDecision(req, true)
            .then((res) => {
              should(res).not.be.empty().and.be.String();
              return resolve();
            })
        ));
        client.setReqErrorListener(reject);
        client.decryptRequest(encodedAuthUri);
      })
    ));
  });
});
