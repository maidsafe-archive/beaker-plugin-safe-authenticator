import {
  NETWORK_CONNECTING,
  NETWORK_DISCONNECTED,
  NETWORK_CONNECTED
} from '../actions/network_state';
import CONSTANTS from '../../constants.json';

const initialState = {
  state: CONSTANTS.NETWORK_STATUS.CONNECTING
};

const networkState = (state = initialState, action) => {
  switch (action.type) {
    case NETWORK_CONNECTING: {
      return { state: CONSTANTS.NETWORK_STATUS.CONNECTING };
    }
    case NETWORK_CONNECTED: {
      return { state: CONSTANTS.NETWORK_STATUS.CONNECTED };
    }
    case NETWORK_DISCONNECTED: {
      return { state: CONSTANTS.NETWORK_STATUS.DISCONNECTED };
    }
    default: {
      return state;
    }
  }
};

export default networkState;
