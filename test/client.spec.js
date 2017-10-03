/* eslint-disable no-underscore-dangle */
import crypto from 'crypto';
import i18n from 'i18n';
import client, { Authenticator } from '../src/ffi/authenticator';
import * as helper from './helper';
import CONST from '../src/constants';

const to = helper.to;

// jest.setTimeout(10000);
describe('Client', () => {

  const setupListeners = ( listenerType ) =>
  {
    // return 5
    console.log("setting up listeners");
    return new Promise( ( resolve, reject ) =>
    {
      // resolve(10);

      console.log("set upppppppppppp");
      const contListener = client.setListener(listenerType, (err, res) => {
        client.removeListener(listenerType, contListener);
        console.log("ressss", res);

        resolve( res )
      });


      // console.log("setting req reeerrrrr", CONST.LISTENER_TYPES.REQUEST_ERR);

      const errListener = client.setListener(CONST.LISTENER_TYPES.REQUEST_ERR, (err) => {
        client.removeListener(CONST.LISTENER_TYPES.REQUEST_ERR, errListener);
        // expect(Object.keys(err)).not.toHaveLength(0);

        console.log("ERRRR", err);
        reject(err);
      });


    })
  };

  let randomCredentials = null;
  const encodedAuthUri = 'safe-auth:AAAAAAgMpeUAAAAAHgAAAAAAAABuZXQubWFpZHNhZmUuZXhh' +
  'bXBsZXMudGVzdC1hcHAAEAAAAAAAAABTQUZFIGV4YW1wbGUgQXBwEQAAAAAAAABNYWlkU2FmZS5uZXQgTHR' +
  'kLgEDAAAAAAAAAAoAAAAAAAAAX2Rvd25sb2FkcwUAAAAAAAAAAAAAAAEAAAACAAAAAwAAAAQAAAAHAAAAAA' +
  'AAAF9wdWJsaWMFAAAAAAAAAAAAAAABAAAAAgAAAAMAAAAEAAAACgAAAAAAAABfZG9jdW1lbnRzBQAAAAAAA' +
  'AAAAAAAAQAAAAIAAAADAAAABAAAAA==';
  const encodedUnRegisterAuthUri = 'safe-auth:AAAAAKfmUZgCAAAA';
  const encodedContUri = 'safe-auth:AAAAAGGCe2cBAAAAHgAAAAAAAABuZXQubWFpZHNhZmUuZXhhbX' +
  'BsZXMudGVzdC1hcHAAEAAAAAAAAABTQUZFIGV4YW1wbGUgQXBwEQAAAAAAAABNYWlkU2FmZS5uZXQgTHRkLg' +
  'EAAAAAAAAADAAAAAAAAABfcHVibGljTmFtZXMFAAAAAAAAAAAAAAABAAAAAgAAAAMAAAAEAAAA';

  const decodedReqForRandomClient = (uri) => helper.createRandomAccount()
    .then(() => client.decodeRequest(uri));

  describe('Unregistered client', () => {
    test.skip('gets back encoded response', () => (
      new Promise((resolve) => {
        client.decodeRequest(encodedUnRegisterAuthUri)
          .then((res) => {
            expect(res).toContain();
            expect(res.indexOf('safe-')).not.toBe(-1);
            return resolve();
          });
      })
    ));
  });

  describe('create Account', () => {
    let err,
      res;
    beforeAll(() => { err = null; res = null; });
    afterAll(() => helper.clearAccount());
    test(
      'throws an error when account locator is empty',
      async () => {
        expect.assertions(3);
        [err, res] = await to(client.createAccount());
        expect(err).toBeInstanceOf(Error);
        expect(err).toHaveProperty('message');
        expect(err.message).toBe(i18n.__('messages.should_not_be_empty', i18n.__('Locator')));
      }
    );

    test(
      'throws error when account secret is empty',
      async () => {
        [err, res] = await to(client.createAccount('test'));
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe(i18n.__('messages.should_not_be_empty', i18n.__('Secret')));
      }
    );

    test(
      'throws an error when account locator is not string',
      async () => {
        [err, res] = await to(client.createAccount(1111, 111));
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe(i18n.__('messages.must_be_string', i18n.__('Locator')));
      });

    test(
      'throws an error when account secret is not string',
      async () => {
        [err, res] = await to(client.createAccount('test', 111));
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe(i18n.__('messages.must_be_string', i18n.__('Secret')));
      });

    test(
      'throws an error when account locator is empty string',
      async () => {
        [err, res] = await to(client.createAccount(' ', 'test'));
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe(i18n.__('messages.should_not_be_empty', i18n.__('Locator')));
      });

    test(
      'throws an error when account secret is empty string',
      async () => {
        [err, res] = await to(client.createAccount('test', ' '));
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe(i18n.__('messages.should_not_be_empty', i18n.__('Secret')));
      }
    );

    test(
      'sets authenticator handle when account creation is successful',
      async () => {
        randomCredentials = helper.getRandomCredentials();
        expect.assertions(5);

        [err, res] = await to(client.createAccount(randomCredentials.locator,
          randomCredentials.secret, randomCredentials.invite));

        expect(res).not.toBeNull();
        expect(client.registeredClientHandle).not.toBeNull();
        expect(client.registeredClientHandle).not.toHaveLength(0);
        expect(client.registeredClientHandle).toBeDefined();
        expect(client.registeredClientHandle).toBeInstanceOf(Buffer);
      });

    test(
      'emit network state as connected when account creation is successful',
      () => (
        new Promise((resolve) => {
          const nwListener = client.setListener(CONST.LISTENER_TYPES.NW_STATE_CHANGE,
            (err, state) => {
              expect(err).toBeNull();
              expect(state).toBeDefined();
              expect(state).toBe(CONST.NETWORK_STATUS.CONNECTED);
              client.removeListener(CONST.LISTENER_TYPES.NW_STATE_CHANGE, nwListener);
              return resolve();
            });
          helper.createRandomAccount();
        }))
    );
  });

  describe('login', () => {
    let err, res;

    beforeAll( async () =>
    {
      err = null;
      res = null;
      randomCredentials = await helper.createRandomAccount()
    });

    afterAll(() => helper.clearAccount());

    test('throws an error when account locator is empty',
      async () =>
      {
        [err, res] = await to(client.login());
        expect(err.message).toBe(i18n.__('messages.should_not_be_empty', i18n.__('Locator')));

      });

    test('throws an error when account secret is empty',
      async () =>
      {
        [err, res] = await to(client.login('test'));
        expect(err.message).toBe(i18n.__('messages.should_not_be_empty', i18n.__('Secret')));
      });

    test(
      'throws an error when account locator is not string',
      async () =>
      {
        [err, res] = await to(client.login(1111, 111));
        expect(err.message).toBe(i18n.__('messages.must_be_string', i18n.__('Locator')));
      }
    );

    test(
      'throws an error when account secret is not string',
      async () =>
      {
        [err, res] = await to(client.login('test', 111));
        expect(err.message).toBe(i18n.__('messages.must_be_string', i18n.__('Secret')));
      }
    );

    test(
      'throws an error when account locator is empty string',
      async () =>
      {
        [err, res] = await to(client.login('  ', 'test'));
        expect(err.message).toBe(i18n.__('messages.should_not_be_empty', i18n.__('Locator')));
      }
    );

    test(
      'throws an error when account secret is empty string',
      async () =>
      {
        [err, res] = await to(client.login('test', '  '));
        expect(err.message).toBe(i18n.__('messages.should_not_be_empty', i18n.__('Secret')));
      }
    );

    test(
      'sets authenticator handle when account login is successful',
      async () =>
      {
        [err, res] = await to(client.login(randomCredentials.locator,
        randomCredentials.secret))

          expect(res).not.toBeNull();
          expect(client.registeredClientHandle).not.toHaveLength(0);
          expect(client.registeredClientHandle).not.toBeNull();
          expect(client.registeredClientHandle).toBeDefined();
          expect(client.registeredClientHandle).toBeInstanceOf(Buffer);
      }
    );

    // test(
    //   'emit network state as connected when account login is successful',
    //   () => (
    //     new Promise((resolve) => {
    //       const nwListener = client.setListener(CONST.LISTENER_TYPES.NW_STATE_CHANGE,
    //         (err, state) => {
    //           expect(err).toBeNull();
    //           expect(state).toBeDefined();
    //           expect(state).toBe(CONST.NETWORK_STATUS.CONNECTED);
    //           client.removeListener(CONST.LISTENER_TYPES.NW_STATE_CHANGE, nwListener);
    //           return resolve();
    //         });
    //       helper.createRandomAccount();
    //     }))
    // );
  });

  //
  describe('decrypt request', () => {
    let err, res, randomAccount;

    console.log("Starting decryptpppptttt");
    beforeAll( async() =>
    {
      console.log("before decryptpppptttt");
      err = null;
      res = null;
      let x = await helper.createRandomAccount()
      console.log("xxxxxx", x);
      return x;

    });

    afterAll(() =>
    {
      console.log("after decryppptttt");
      helper.clearAccount()
    });

    test('throws an error when encoded URI is empty',
      async() =>
      {
        console.log("starting this empty uri test");
        [err, res] = await to(client.decodeRequest());
        expect(res).toBeUndefined();
        expect(err).not.toBeNull();
      });

      test( 'throws an error for container request of unknown app',
        async () =>
        {
          console.log("start of async unknown test");
          let prom = to( setupListeners( CONST.LISTENER_TYPES.CONTAINER_REQ ));
          console.log("fired prom");
          client.decodeRequest(encodedContUri);

          console.log("fired decode unkown");
          [err, res] = await prom;
          console.log("got err, res unkown", err, res);

          expect(res).toBeUndefined();
          expect(err).not.toBeNull();
        })


    // test('throws an error for container request of unknown app',
    //   async() => {
    //     console.log("ABOUT TO TESSSTTTT");
    //     let outcome =  await new Promise((resolve, reject) => {
    //
    //       console.log("setting up oooooooor promise");
    //       const contListener = client.setListener(CONST.LISTENER_TYPES.CONTAINER_REQ, (err, res) => {
    //         client.removeListener(CONST.LISTENER_TYPES.CONTAINER_REQ, contListener);
    //         console.log("ressss", res);
    //         expect(err).not.toBeNull();
    //         expect(res).not.toBeNull();
    //
    //         resolve(res);
    //       });
    //
    //       const errListener = client.setListener(CONST.LISTENER_TYPES.REQUEST_ERR, (err) => {
    //         client.removeListener(CONST.LISTENER_TYPES.REQUEST_ERR, errListener);
    //
    //         console.log("ERRRR", err);
    //         // expect(Object.keys(err)).not.toHaveLength(0);
    //         expect(err).not.toBeNull();
    //         reject(err);
    //       });
    //
    //       client.decodeRequest(encodedContUri);
    //     })
    //
    //     console.log("outcommmeeee", outcome);
    //   }
    //
    // );

    test( 'something insane and working',
    async () =>
    {
      console.log("start of async test");
      let prom = to( setupListeners( CONST.LISTENER_TYPES.AUTH_REQ ));
      console.log("fired prom");
      client.decodeRequest(`safe-auth:${crypto.randomBytes(32).toString('base64')}`);

      console.log("fired decode");
      [err, res] = await prom;
      console.log("got err, res", err, res);
      expect(res).toBeUndefined();
      expect(err).not.toBeNull();
    })

    test( 'something insane and working2222',
    async () =>
    {
      console.log("start of async test");
      let prom = to( setupListeners( CONST.LISTENER_TYPES.AUTH_REQ ));
      console.log("fired prom");
      client.decodeRequest(`safe-auth:${crypto.randomBytes(32).toString('base64')}`);

      console.log("fired decode");
      [err, res] = await prom;
      console.log("got err, res", err, res);
      expect(res).toBeUndefined();
      expect(err).not.toBeNull();
    })

    test( 'something insane and working3333',
    async () =>
    {
      console.log("start of async test");
      let prom = to( setupListeners( CONST.LISTENER_TYPES.AUTH_REQ ));
      console.log("fired prom");
      client.decodeRequest(`safe-auth:${crypto.randomBytes(32).toString('base64')}`);

      console.log("fired decode");
      [err, res] = await prom;
      console.log("got err, res", err, res);
      expect(res).toBeUndefined();
      expect(err).not.toBeNull();
    })

    // test('throws an error for invalid URI', () => (
    //   new Promise((resolve, reject) => {
    //
    //     console.log("promise for the invalid uri");
    //     const authListener = client.setListener(CONST.LISTENER_TYPES.AUTH_REQ, (err, res) => {
    //       client.removeListener(CONST.LISTENER_TYPES.AUTH_REQ, authListener);
    //       reject(res);
    //     });
    //
    //     const errListener = client.setListener(CONST.LISTENER_TYPES.REQUEST_ERR, (err) => {
    //       client.removeListener(CONST.LISTENER_TYPES.REQUEST_ERR, errListener);
    //       expect(err).not.toBeNull( )
    //       resolve(err);
    //     });
    //
    //     // client.decodeRequest(`safe-auth:${crypto.randomBytes(32).toString('base64')}`);
    //   })
    // ));
    //
    // test('returns a decoded request for encoded Auth request', () => (
    //   new Promise((resolve, reject) => {
    //     const authListener = client.setListener(CONST.LISTENER_TYPES.AUTH_REQ, (err, res) => {
    //       expect(Object.keys(res)).not.toHaveLength(0).and.have.properties(['reqId', 'authReq']);
    //       expect(res.reqId).toBeDefined().and.be.Number();
    //       expect(res.authReq).not.toHaveLength(0).and.have.properties([
    //         'app',
    //         'app_container',
    //         'containers',
    //         'containers_len',
    //         'containers_cap']);
    //       expect(res.authReq.app).not.toHaveLength(0).and.have.properties([
    //         'id',
    //         'scope',
    //         'name',
    //         'vendor']);
    //       expect(res.authReq.app.id).not.toHaveLength(0).toContain();
    //       expect(res.authReq.app.name).not.toHaveLength(0).toContain();
    //       expect(res.authReq.app.vendor).not.toHaveLength(0).toContain();
    //       expect(res.authReq.app_container).toBeDefined().and.be.Boolean();
    //       expect(res.authReq.containers).toBeDefined().and.be.Array();
    //       expect(res.authReq.containers_len).toBeDefined().and.be.Number();
    //       expect(res.authReq.containers_cap).toBeDefined().and.be.Number();
    //
    //       if (res.authReq.containers_len > 0) {
    //         const container0 = res.authReq.containers[0];
    //         expect(Object.keys(container0)).not.toHaveLength(0).and.have.properties([
    //           'cont_name',
    //           'access'
    //         ]);
    //         expect(container0.cont_name).not.toHaveLength(0).toContain();
    //         expect(container0.access).not.toHaveLength(0).and.be.Object();
    //       }
    //       client.removeListener(CONST.LISTENER_TYPES.AUTH_REQ, authListener);
    //       return resolve();
    //     });
    //
    //     const errListener = client.setListener(CONST.LISTENER_TYPES.REQUEST_ERR, (err) => {
    //       client.removeListener(CONST.LISTENER_TYPES.REQUEST_ERR, errListener);
    //       reject(err);
    //     });
    //
    //     client.decodeRequest(encodedAuthUri);
    //   })
    // ));
    //
    // test(
    //   'returns a decoded request for encoded Auth request without safe-auth: scheme',
    //   () => (
    //     new Promise((resolve, reject) => {
    //       const authListener = client.setListener(CONST.LISTENER_TYPES.AUTH_REQ, (err, res) => {
    //         expect(Object.keys(res)).not.toHaveLength(0).and.have.properties(['reqId', 'authReq']);
    //         client.removeListener(CONST.LISTENER_TYPES.AUTH_REQ, authListener);
    //         return resolve();
    //       });
    //
    //       const errListener = client.setListener(CONST.LISTENER_TYPES.REQUEST_ERR, (err) => {
    //         client.removeListener(CONST.LISTENER_TYPES.REQUEST_ERR, errListener);
    //         reject(err);
    //       });
    //
    //       client.decodeRequest(encodedAuthUri.replace('safe-auth:', ''));
    //     })
    //   )
    // );
    //
    // test('retuns a decoded request for encoded Container request', () => (
    //   new Promise((resolve, reject) => {
    //     const contListener = client.setListener(CONST.LISTENER_TYPES.CONTAINER_REQ, (err, res) => {
    //       expect(Object.keys(res)).not.toHaveLength(0).and.have.properties(['reqId', 'contReq']);
    //       expect(res.reqId).toBeDefined().and.be.Number();
    //       expect(res.contReq).not.toHaveLength(0).and.have.properties([
    //         'app',
    //         'containers',
    //         'containers_len',
    //         'containers_cap']);
    //       expect(res.contReq.app).not.toHaveLength(0).and.have.properties([
    //         'id',
    //         'scope',
    //         'name',
    //         'vendor']);
    //       expect(res.contReq.app.id).not.toHaveLength(0).toContain();
    //       // should(res.contReq.app.scope).not.be.undefined().and.be.String();
    //       expect(res.contReq.app.name).not.toHaveLength(0).toContain();
    //       expect(res.contReq.app.vendor).not.toHaveLength(0).toContain();
    //       expect(res.contReq.containers).toBeDefined().and.be.Array();
    //       expect(res.contReq.containers_len).toBeDefined().and.be.Number();
    //       expect(res.contReq.containers_cap).toBeDefined().and.be.Number();
    //
    //       if (res.contReq.containers_len > 0) {
    //         const container0 = res.contReq.containers[0];
    //         expect(Object.keys(container0)).not.toHaveLength(0).and.have.properties([
    //           'cont_name',
    //           'access'
    //         ]);
    //         expect(container0.cont_name).not.toHaveLength(0).toContain();
    //         expect(container0.access).not.toHaveLength(0).and.be.Object();
    //       }
    //       client.removeListener(CONST.LISTENER_TYPES.CONTAINER_REQ, contListener);
    //       return resolve();
    //     });
    //
    //     const authL = client.setListener(CONST.LISTENER_TYPES.AUTH_REQ, (err, req) => {
    //       client.encodeAuthResp(req, true).then(() => client.decodeRequest(encodedContUri));
    //       client.removeListener(CONST.LISTENER_TYPES.AUTH_REQ, authL);
    //     });
    //
    //     const errL = client.setListener(CONST.LISTENER_TYPES.REQUEST_ERR, (err) => {
    //       client.removeListener(CONST.LISTENER_TYPES.REQUEST_ERR, errL);
    //       reject(err);
    //     });
    //
    //     client.decodeRequest(encodedAuthUri);
    //   })));
    //
    // test(
    //   'returns a decoded request for encoded Container request without safe-auth: scheme',
    //   () => (
    //     new Promise((resolve, reject) => {
    //       const contL = client.setListener(CONST.LISTENER_TYPES.CONTAINER_REQ, (err, res) => {
    //         expect(Object.keys(res)).not.toHaveLength(0).and.have.properties(['reqId', 'contReq']);
    //         client.removeListener(CONST.LISTENER_TYPES.CONTAINER_REQ, contL);
    //         return resolve();
    //       });
    //
    //       const authL = client.setListener(CONST.LISTENER_TYPES.AUTH_REQ, (err, req) => {
    //         client.removeListener(CONST.LISTENER_TYPES.AUTH_REQ, authL);
    //         reject(req);
    //       });
    //
    //       const errL = client.setListener(CONST.LISTENER_TYPES.REQUEST_ERR, (err) => {
    //         client.removeListener(CONST.LISTENER_TYPES.REQUEST_ERR, errL);
    //         reject(err);
    //       });
    //
    //       client.decodeRequest(encodedContUri);
    //     })
    //   )
    // );
  });
  //
  // describe('encode auth response', () => {
  //   let decodedReq = null;
  //   const prepareReq = () => new Promise((resolve, reject) => {
  //     const authL = client.setListener(CONST.LISTENER_TYPES.AUTH_REQ, (err, req) => {
  //       decodedReq = req;
  //       client.removeListener(CONST.LISTENER_TYPES.AUTH_REQ, authL);
  //       return resolve();
  //     });
  //
  //     const errL = client.setListener(CONST.LISTENER_TYPES.REQUEST_ERR, (err) => {
  //       client.removeListener(CONST.LISTENER_TYPES.REQUEST_ERR, errL);
  //       reject(err);
  //     });
  //
  //     decodedReqForRandomClient(encodedAuthUri);
  //   });
  //
  //   beforeAll(() => prepareReq());
  //
  //   afterAll(() => helper.clearAccount());
  //
  //   test('throws an error if request is undefined', () => expect(client.encodeAuthResp()).rejects.toBe(Error)
  //     .then((err) => {
  //       expect(err.message).toBe(i18n.__('messages.invalid_params'));
  //     }));
  //
  //   test('throws an error if decision is not boolean type', () => (
  //     Promise.all([
  //       expect(client.encodeAuthResp({}, 123)).rejects.toBe(Error).then((err) => expect(err.message).toBe(i18n.__('messages.invalid_params'))),
  //       expect(client.encodeAuthResp({}, 'string')).rejects.toBe(Error).then((err) => expect(err.message).toBe(i18n.__('messages.invalid_params'))),
  //       expect(client.encodeAuthResp({}, { a: 1 })).rejects.toBe(Error).then((err) => expect(err.message).toBe(i18n.__('messages.invalid_params'))),
  //       expect(client.encodeAuthResp({}, [1, 2, 3])).rejects.toBe(Error).then((err) => expect(err.message).toBe(i18n.__('messages.invalid_params'))),
  //       expect(client.encodeAuthResp({}, [1, 2, 3])).rejects.toBe(Error).then((err) => expect(err.message).toBe(i18n.__('messages.invalid_params')))
  //     ])));
  //
  //   test(
  //     'throws an error if request doesn\'t have request ID(reqId)',
  //     () => expect(client.encodeAuthResp({}, true)).rejects.toBe(Error)
  //       .then((err) => expect(err.message).toBe(i18n.__('messages.invalid_req')))
  //   );
  //
  //   test(
  //     'throws an error when invalid request is passed',
  //     () => expect(client.encodeAuthResp(Object.assign({}, decodedReq, { reqId: 123 }), true)).rejects.toBe(Error)
  //       .then((err) => expect(err.message).toBe(i18n.__('messages.invalid_req')))
  //   );
  //
  //   test(
  //     'returns encoded response URI on success of deny',
  //     () => expect(client.encodeAuthResp(decodedReq, false)).to.be.fulfilled()
  //       .then((res) => expect(Object.keys(res)).not.toHaveLength(0).toContain())
  //   );
  //
  //   test('returns encoded response URI on success of allow', () => expect(prepareReq()
  //     .then(() => client.encodeAuthResp(decodedReq, true))).to.be.fulfilled()
  //     .then((res) => expect(Object.keys(res)).not.toHaveLength(0).toContain()));
  // });
  //
  // describe('encode container response', () => {
  //   let decodedReq = null;
  //   const prepareReq = () => new Promise((resolve, reject) => {
  //     const contListener = client.setListener(CONST.LISTENER_TYPES.CONTAINER_REQ, (err, req) => {
  //       decodedReq = req;
  //       client.removeListener(CONST.LISTENER_TYPES.CONTAINER_REQ, contListener);
  //       return resolve();
  //     });
  //
  //     const authListener = client.setListener(CONST.LISTENER_TYPES.AUTH_REQ, (err, req) => {
  //       client.encodeAuthResp(req, true).then(() => client.decodeRequest(encodedContUri));
  //       client.removeListener(CONST.LISTENER_TYPES.AUTH_REQ, authListener);
  //     });
  //
  //     const errListener = client.setListener(CONST.LISTENER_TYPES.REQUEST_ERR, (err) => {
  //       client.removeListener(CONST.LISTENER_TYPES.REQUEST_ERR, errListener);
  //       reject(err);
  //     });
  //
  //     decodedReqForRandomClient(encodedAuthUri);
  //   });
  //
  //   beforeAll(() => prepareReq());
  //
  //   afterAll(() => helper.clearAccount());
  //
  //   test(
  //     'throws an error if request is undefined',
  //     () => expect(client.encodeContainersResp()).rejects.toBe(Error)
  //       .then((err) => {
  //         expect(err.message).toBe(i18n.__('messages.invalid_params'));
  //       })
  //   );
  //
  //   test('throws an error if decision is not boolean type', () => (
  //     Promise.all([
  //       expect(client.encodeContainersResp({}, 123)).rejects.toBe(Error).then((err) => expect(err.message).toBe(i18n.__('messages.invalid_params'))),
  //       expect(client.encodeContainersResp({}, 'string')).rejects.toBe(Error).then((err) => expect(err.message).toBe(i18n.__('messages.invalid_params'))),
  //       expect(client.encodeContainersResp({}, { a: 1 })).rejects.toBe(Error).then((err) => expect(err.message).toBe(i18n.__('messages.invalid_params'))),
  //       expect(client.encodeContainersResp({}, [1, 2, 3])).rejects.toBe(Error).then((err) => expect(err.message).toBe(i18n.__('messages.invalid_params'))),
  //       expect(client.encodeContainersResp({}, [1, 2, 3])).rejects.toBe(Error).then((err) => expect(err.message).toBe(i18n.__('messages.invalid_params')))
  //     ])));
  //
  //   test(
  //     'throws an error if request doesn\'t have request ID(reqId)',
  //     () => expect(client.encodeContainersResp({}, true)).rejects.toBe(Error)
  //       .then((err) => expect(err.message).toBe(i18n.__('messages.invalid_req')))
  //   );
  //
  //   test(
  //     'throws an error when invalid request is passed',
  //     () => expect(
  //       client.encodeContainersResp(Object.assign({}, decodedReq, { reqId: 123 }), true)
  //     ).rejects.toBe(Error)
  //       .then((err) => expect(err.message).toBe(i18n.__('messages.invalid_req')))
  //   );
  //
  //   test(
  //     'returns encoded response URI on success of deny',
  //     () => expect(client.encodeContainersResp(decodedReq, false)).to.be.fulfilled()
  //       .then((res) => expect(Object.keys(res)).not.toHaveLength(0).toContain())
  //   );
  //
  //   test('returns encoded response URI on success of allow', () => expect(prepareReq()
  //     .then(() => client.encodeContainersResp(decodedReq, true))).to.be.fulfilled()
  //     .then((res) => expect(Object.keys(res)).not.toHaveLength(0).toContain()));
  // });
  //
  // describe('get authorised apps', () => {
  //   const prepareReq = () => new Promise((resolve, reject) => {
  //     const authL = client.setListener(CONST.LISTENER_TYPES.AUTH_REQ,
  //       (err, req) => client.encodeAuthResp(req, true).then(() => {
  //         client.removeListener(CONST.LISTENER_TYPES.AUTH_REQ, authL);
  //         resolve();
  //       }));
  //
  //     const errL = client.setListener(CONST.LISTENER_TYPES.REQUEST_ERR, (err) => {
  //       client.removeListener(CONST.LISTENER_TYPES.REQUEST_ERR, errL);
  //       reject(err);
  //     });
  //
  //     client.decodeRequest(encodedAuthUri);
  //   });
  //
  //   beforeAll(() => helper.createRandomAccount());
  //
  //   afterAll(() => helper.clearAccount());
  //
  //   test(
  //     'return empty array before registering any app',
  //     () => expect(client.getRegisteredApps()).to.be.fulfilled()
  //       .then((apps) => expect(Object.keys(apps)).toHaveLength(0))
  //   );
  //
  //   test('return apps list after registering apps', () => expect(prepareReq()
  //     .then(() => client.getRegisteredApps())).to.be.fulfilled()
  //     .then((apps) => expect(Object.keys(apps)).not.toHaveLength(0)));
  // });
  //
  // describe('revoke app', () => {
  //   let appId = null;
  //   beforeAll(() => new Promise(
  //     (resolve, reject) => {
  //       const authL = client.setListener(CONST.LISTENER_TYPES.AUTH_REQ, (err, req) => {
  //         appId = req.authReq.app.id;
  //         return client.encodeAuthResp(req, true).then(() => {
  //           client.removeListener(CONST.LISTENER_TYPES.AUTH_REQ, authL);
  //           resolve();
  //         });
  //       });
  //
  //       const errL = client.setListener(CONST.LISTENER_TYPES.REQUEST_ERR, () => {
  //         client.removeListener(CONST.LISTENER_TYPES.REQUEST_ERR, errL);
  //         reject();
  //       });
  //
  //       decodedReqForRandomClient(encodedAuthUri);
  //     }));
  //
  //   afterAll(() => helper.clearAccount());
  //
  //   test('throws an error when appId is undefined', () => expect(client.revokeApp()).rejects.toBe(Error)
  //     .then((err) => expect(err.message).toBe(i18n.__('messages.should_not_be_empty', i18n.__('AppId')))));
  //
  //   test('throws an error when appId is not of String type', () => (
  //     Promise.all([
  //       expect(client.revokeApp(123)).rejects.toBe(Error).then((err) => expect(err.message).toBe(i18n.__('messages.must_be_string', i18n.__('AppId')))),
  //       expect(client.revokeApp(true)).rejects.toBe(Error).then((err) => expect(err.message).toBe(i18n.__('messages.must_be_string', i18n.__('AppId')))),
  //       expect(client.revokeApp({ a: 1 })).rejects.toBe(Error).then((err) => expect(err.message).toBe(i18n.__('messages.must_be_string', i18n.__('AppId')))),
  //       expect(client.revokeApp([1, 2, 3])).rejects.toBe(Error).then((err) => expect(err.message).toBe(i18n.__('messages.must_be_string', i18n.__('AppId'))))
  //     ])
  //   ));
  //
  //   test('throws an error when appId is empty string', () => expect(client.revokeApp(' ')).rejects.toBe(Error)
  //     .then((err) => expect(err.message).toBe(i18n.__('messages.should_not_be_empty', i18n.__('AppId')))));
  //
  //   test('removes app from registered app list', () => expect(client.revokeApp(appId)).to.be.fulfilled()
  //     .then(() => client.getRegisteredApps())
  //     .then((apps) => expect(Object.keys(apps)).toHaveLength(0)));
  // });
  //
  // describe('after revoking', () => {
  //   beforeAll(() => new Promise(
  //     (resolve, reject) => {
  //       const authL = client.setListener(CONST.LISTENER_TYPES.AUTH_REQ, (err, req) => {
  //         const appId = req.authReq.app.id;
  //         return client.encodeAuthResp(req, true)
  //           .then(() => client.revokeApp(appId).then(() => {
  //             client.removeListener(CONST.LISTENER_TYPES.AUTH_REQ, authL);
  //             resolve();
  //           }));
  //       });
  //
  //       const errL = client.setListener(CONST.LISTENER_TYPES.REQUEST_ERR, (err) => {
  //         client.removeListener(CONST.LISTENER_TYPES.REQUEST_ERR, errL);
  //         reject(err);
  //       });
  //
  //       decodedReqForRandomClient(encodedAuthUri);
  //     }));
  //
  //   afterAll(() => helper.clearAccount());
  //
  //   test('same app can be registered again', () => (
  //     new Promise((resolve, reject) => {
  //       setTimeout(() => {
  //         const authL = client.setListener(CONST.LISTENER_TYPES.AUTH_REQ, (err, req) => (
  //           client.encodeAuthResp(req, true)
  //             .then(() => client.getRegisteredApps()
  //               .then((apps) => {
  //                 expect(apps.length).toBe(1);
  //                 client.removeListener(CONST.LISTENER_TYPES.AUTH_REQ, authL);
  //                 return resolve();
  //               }))
  //         ));
  //         const errL = client.setListener(CONST.LISTENER_TYPES.REQUEST_ERR, (err) => {
  //           client.removeListener(CONST.LISTENER_TYPES.REQUEST_ERR, errL);
  //           reject(err);
  //         });
  //         client.decodeRequest(encodedAuthUri);
  //       }, 1000);
  //     })));
  // });
  //
  // describe('re-authorising', () => {
  //   beforeAll(() => new Promise(
  //     (resolve, reject) => {
  //       const authL = client.setListener(CONST.LISTENER_TYPES.AUTH_REQ,
  //         (err, req) => client.encodeAuthResp(req, true).then(() => {
  //           client.removeListener(CONST.LISTENER_TYPES.AUTH_REQ, authL);
  //           resolve();
  //         }));
  //
  //       const errL = client.setListener(CONST.LISTENER_TYPES.REQUEST_ERR, (err) => {
  //         client.removeListener(CONST.LISTENER_TYPES.REQUEST_ERR, errL);
  //         reject(err);
  //       });
  //
  //       decodedReqForRandomClient(encodedAuthUri);
  //     }));
  //
  //   afterAll(() => helper.clearAccount());
  //
  //   test.skip('doesn\'t throw error', () => (
  //     new Promise((resolve, reject) => {
  //       client.setListener(CONST.LISTENER_TYPES.AUTH_REQ, (err, req) => (
  //         client.encodeAuthResp(req, true)
  //           .then((res) => {
  //             expect(Object.keys(res)).not.toHaveLength(0).toContain();
  //             return resolve();
  //           })
  //       ));
  //       client.setListener(CONST.LISTENER_TYPES.REQUEST_ERR, reject);
  //       client.decodeRequest(encodedAuthUri);
  //     })
  //   ));
  // });
  //
  // describe('account information', () => {
  //   beforeAll(() => new Promise(
  //     (resolve, reject) => {
  //       const authL = client.setListener(CONST.LISTENER_TYPES.AUTH_REQ, (err, req) => (
  //         client.encodeAuthResp(req, true).then(() => {
  //           client.removeListener(CONST.LISTENER_TYPES.AUTH_REQ, authL);
  //           resolve();
  //         })
  //       ));
  //
  //       const errL = client.setListener(CONST.LISTENER_TYPES.REQUEST_ERR, () => {
  //         client.removeListener(CONST.LISTENER_TYPES.REQUEST_ERR, errL);
  //         reject();
  //       });
  //
  //       decodedReqForRandomClient(encodedAuthUri);
  //     }));
  //
  //   afterAll(() => helper.clearAccount());
  //
  //   test('are retrievable', () => expect(client.getAccountInfo()).to.be.fulfilled()
  //     .then((res) => {
  //       expect(Object.keys(res)).not.toHaveLength(0).and.have.properties([
  //         'done',
  //         'available']);
  //       expect(res.done).toBeDefined().and.be.Number();
  //       expect(res.available).toBeDefined().and.be.Number();
  //     }));
  // });
});
