export const NETWORK_CONNECTING = 'NETWORK_CONNECTING';
export const NETWORK_CONNECTED = 'NETWORK_CONNECTED';
export const NETWORK_DISCONNECTED = 'NETWORK_DISCONNECTED';

export const setNetworkConnecting = () => {
  console.warn('Network reconnecting');
  return {
    type: NETWORK_CONNECTING
  };
};

export const setNetworkConnected = () => (
  {
    type: NETWORK_CONNECTED
  }
);

export const setNetworkDisconnected = () => (
  {
    type: NETWORK_DISCONNECTED
  }
);
