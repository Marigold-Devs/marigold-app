import { useQuery } from 'react-query';
import { NotificationsService } from 'services';

const useNotifications = ({ params }) =>
  useQuery(
    ['useNotifications', params.page, params.pageSize, params.branchId],
    () =>
      NotificationsService.list({
        params: {
          page: params.page,
          page_size: params.pageSize,
          branch_id: params.branchId,
        },
      }),
    {
      refetchOnWindowFocus: false,
      placeholderData: { data: { results: [], count: 0 } },
      select: (query) => ({
        notifications: query.data.results,
        total: query.data.count,
      }),
    }
  );

export default useNotifications;
