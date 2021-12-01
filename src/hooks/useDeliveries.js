import { useQuery } from 'react-query';
import { DeliveriesService } from 'services';

const useDeliveries = ({ params }) =>
  useQuery(
    ['useDeliveries', params.page, params.pageSize],
    () =>
      DeliveriesService.list({
        params: {
          page: params.page,
          page_size: params.pageSize,
        },
      }),
    {
      refetchOnWindowFocus: false,
      placeholderData: { data: { results: [], count: 0 } },
      select: (query) => ({
        deliveries: query.data.results,
        total: query.data.count,
      }),
    }
  );

export default useDeliveries;
