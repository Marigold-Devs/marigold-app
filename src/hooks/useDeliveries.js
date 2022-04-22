import { useQuery } from 'react-query';
import { DeliveriesService } from 'services';

const useDeliveries = ({ params }) =>
  useQuery(
    ['useDeliveries', params.page, params.pageSize, params.paymentStatus],
    () =>
      DeliveriesService.list({
        params: {
          payment_status: params.paymentStatus,
          page: params.page,
          page_size: params.pageSize,
        },
      }),
    {
      initialData: { data: { results: [], count: 0 } },
      select: (query) => ({
        deliveries: query.data.results,
        total: query.data.count,
      }),
    }
  );

export default useDeliveries;
