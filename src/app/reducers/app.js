import {
  GET_AUTHORISED_APPS,
  REVOKE_APP
} from '../actions/app';

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
      // TODO handle response (replace authorisedApps value with action.payload)
      return {
        ...state,
        fetchingApps: false,
        authorisedApps: [
          {
            id: 1,
            name: 'Cookley',
            vendor: 'kpeters0'
          }, {
            id: 2,
            name: 'Overhold',
            vendor: 'jwallace1'
          }
        ]
      };
    }
    case `${GET_AUTHORISED_APPS}_REJECTED`: {
      return { ...state, fetchingApps: false, error: action.payload.message };
    }
    case `${REVOKE_APP}_PENDING`: {
      return { ...state, loading: true };
    }
    case `${REVOKE_APP}_FULFILLED`: {
      // TODO handle response and remove app from authorisedApps
      return { ...state, loading: false };
    }
    case `${REVOKE_APP}_REJECTED`: {
      return { ...state, loading: false, error: action.payload.message };
    }
    default: {
      return state;
    }
  }
};

export default app;
