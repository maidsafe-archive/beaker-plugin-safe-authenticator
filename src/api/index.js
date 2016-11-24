import client from '../ffi/client_manager';

const safeAuthApi = [
  {
    name: 'safeAuthenticator',
    isInternal: true,
    manifest: client.manifest,
    methods: client
  }
];

export default safeAuthApi;
