import { useSelector } from 'react-redux';
import { actions, selectors } from 'ducks/ui';
import { useActionDispatch } from './useActionDispatch';

const useUI = () => {
  const isSidebarCollapsed = useSelector(selectors.selectIsSidebarCollapsed());
  const onCollapseSidebar = useActionDispatch(actions.onCollapseSidebar);

  return {
    isSidebarCollapsed,
    onCollapseSidebar,
  };
};

export default useUI;
