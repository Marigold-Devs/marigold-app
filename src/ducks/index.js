import { APP_KEY } from 'globals/variables';
import { routerReducer } from 'react-router-redux';
import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
import authReducer, { key as AUTH_KEY, types } from './auth';
import uiReducer, { key as UI_KEY } from './ui';

const appReducer = combineReducers({
  router: routerReducer,
  [AUTH_KEY]: authReducer,
  [UI_KEY]: uiReducer,
});

export default (state, action) => {
  if (action.type === types.LOGOUT) {
    storage.removeItem(APP_KEY);
    // eslint-disable-next-line no-param-reassign
    state = undefined;
  }

  return appReducer(state, action);
};
