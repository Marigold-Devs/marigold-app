import { useQuery } from 'react-query';
import { NotificationsService } from 'services';

const useNotificationsCount = () =>
  useQuery('useNotificationsCount', () => NotificationsService.count(), {
    refetchOnWindowFocus: false,
    placeholderData: { data: 0 },
    select: (query) => query.data,
    refetchInterval: 2500,
  });

export default useNotificationsCount;
