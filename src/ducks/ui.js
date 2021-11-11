import { createAction, handleActions } from 'redux-actions';
import { createSelector } from 'reselect';

export const key = 'USER_INTEFACE';

export const types = {
  ON_COLLAPSE_SIDEBAR: `${key}/ON_COLLAPSE_SIDEBAR`,
};

const initialState = {
  isSidebarCollapsed: false,
};

const reducer = handleActions(
  {
    [types.ON_COLLAPSE_SIDEBAR]: (state, { payload }) => ({
      ...state,
      isSidebarCollapsed: payload,
    }),
  },
  initialState
);

export const actions = {
  onCollapseSidebar: createAction(types.ON_COLLAPSE_SIDEBAR),
};

const selectState = (state) => state[key] || initialState;
export const selectors = {
  selectIsSidebarCollapsed: () =>
    createSelector(selectState, (state) => state.isSidebarCollapsed),
};

export default reducer;
