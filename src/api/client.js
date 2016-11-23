import clientManager from '../ffi/client_manager';

export const manifest = {
  registerNetworkListener: 'sync'
};

/**
 * Set SAFE Network connectivity state listener
 * @param cb - callback to be invoked on network state change
 */
export const onNetworkStateChange = (cb) => {
  if (typeof cb !== 'function') {
    throw new Error('Network listener callback should be a function');
  }
  clientManager.setNetworkListener(cb);
};
