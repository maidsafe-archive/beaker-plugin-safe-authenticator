import {
  NETWORK_CONNECTING,
  NETWORK_DISCONNECTED,
  NETWORK_CONNECTED
} from '../actions/network_state';
import CONSTANTS from '../constants.json';

const initialState = {
  state: 0
};

const networkState = (state = initialState, action) => {
  switch (action.type) {
    case NETWORK_CONNECTING: {
      return { state: CONSTANTS.NETWORK_STATUS.NETWORK_CONNECTING };
    }
    case NETWORK_CONNECTED: {
      return { state: CONSTANTS.NETWORK_STATUS.NETWORK_CONNECTED };
    }
    case NETWORK_DISCONNECTED: {
      return { state: CONSTANTS.NETWORK_STATUS.NETWORK_DISCONNECTED };
    }
    default: {
      return state;
    }
  }
};

export default networkState;
