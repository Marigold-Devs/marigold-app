import { actions, selectors } from 'ducks/auth';
import { useSelector } from 'react-redux';
import { useActionDispatch } from './useActionDispatch';

const useAuth = () => {
  const user = useSelector(selectors.selectUser());
  const accessToken = useSelector(selectors.selectAccessToken());
  const refreshToken = useSelector(selectors.selectRefreshToken());

  const login = useActionDispatch(actions.login);
  const logout = useActionDispatch(actions.logout);

  return {
    user,
    accessToken,
    refreshToken,
    login,
    logout,
  };
};

export default useAuth;
