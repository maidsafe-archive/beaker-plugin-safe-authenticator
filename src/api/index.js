import * as client from './client';

const safeAuthApi = [
  {
    name: 'safeAuthenticator',
    isInternal: true,
    manifest: client.manifest,
    methods: client
  }
];

export default safeAuthApi;
