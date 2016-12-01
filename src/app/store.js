import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware, push } from 'react-router-redux';
import { hashHistory } from 'react-router';
import createLogger from 'redux-logger';
import rootReducer from './reducers';

const actionCreators = {
  push
};

const logger = createLogger({
  level: 'info',
  collapsed: true,
});

const router = routerMiddleware(hashHistory);

const enhancer = compose(
  applyMiddleware(router, logger),
  window.devToolsExtension ?
    window.devToolsExtension({ actionCreators }) :
    noop => noop
);

export default function configureStore(initialState) {
  return createStore(rootReducer, initialState, enhancer);
}
