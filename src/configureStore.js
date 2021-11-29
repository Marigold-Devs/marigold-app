import rootReducer from 'ducks';
import { APP_KEY } from 'globals/variables';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'react-router-redux';
import { applyMiddleware, compose, createStore } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const configureStore = (initialState = {}) => {
  // Create middlewares
  const history = createBrowserHistory();
  const middlewares = [routerMiddleware(history)];
  const enhancers = [applyMiddleware(...middlewares)];

  // Create a persist version of the reducer
  const persistConfig = {
    key: APP_KEY,
    storage,
    blacklist: ['_persist'],
    keyPrefix: '',
  };
  const persistedReducer = persistReducer(persistConfig, rootReducer);

  // Create store
  const store = createStore(
    persistedReducer,
    initialState,
    compose(...enhancers)
  );

  return store;
};

export default configureStore;
