import {
  GET_AUTHORISED_APPS,
  REVOKE_APP,
  SET_APP_LIST,
  CLEAR_APP_LIST
} from '../actions/app';
import { parseErrCode } from '../utils';

const initialState = {
  authorisedApps: [],
  fetchingApps: false,
  error: null,
  loading: false
};
const app = (state = initialState, action) => {
  switch (action.type) {
    case `${GET_AUTHORISED_APPS}_PENDING`: {
      return { ...state, fetchingApps: true };
    }
    case `${GET_AUTHORISED_APPS}_FULFILLED`: {
      return {
        ...state,
        fetchingApps: false,
        authorisedApps: action.payload
      };
    }
    case `${GET_AUTHORISED_APPS}_REJECTED`: {
      return { ...state, fetchingApps: false, error: JSON.parse(action.payload.message).description };
    }
    case `${REVOKE_APP}_PENDING`: {
      return { ...state, loading: true };
    }
    case `${REVOKE_APP}_FULFILLED`: {
      return { ...state, loading: false };
    }
    case `${REVOKE_APP}_REJECTED`: {
      return { ...state, loading: false, error: JSON.parse(action.payload.message).description };
    }
    case SET_APP_LIST: {
      return { ...state, authorisedApps: action.apps };
    }
    case CLEAR_APP_LIST: {
      return { ...state, error: null };
    }
    default: {
      return state;
    }
  }
};

export default app;
