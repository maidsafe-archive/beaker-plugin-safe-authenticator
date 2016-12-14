import ffiLoader from '../ffi/ffi_loader';

/* eslint-disable import/prefer-default-export */
export const loadLibrary = (libPath) => ffiLoader.loadLibrary(libPath);
/* eslint-enable import/prefer-default-export */
