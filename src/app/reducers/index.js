import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import app from './app';
import auth from './auth';

const rootReducer = combineReducers({
  app,
  auth,
  routing
});

export default rootReducer;
