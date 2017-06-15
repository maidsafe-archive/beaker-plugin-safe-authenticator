import {
  GET_AUTHORISED_APPS,
  REVOKE_APP,
  SET_APP_LIST
} from '../actions/app';
import { trimErrorMsg } from '../utils';

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
      return { ...state, fetchingApps: false, error: trimErrorMsg(action.payload.message) };
    }
    case `${REVOKE_APP}_PENDING`: {
      return { ...state, loading: true };
    }
    case `${REVOKE_APP}_FULFILLED`: {
      return { ...state, loading: false };
    }
    case `${REVOKE_APP}_REJECTED`: {
      return { ...state, loading: false, error: trimErrorMsg(action.payload.message) };
    }
    case SET_APP_LIST: {
      return { ...state, authorisedApps: action.apps };
    }
    default: {
      return state;
    }
  }
};

export default app;
