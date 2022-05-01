import { useMutation, useQuery } from 'react-query';
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

export const useDeliveryRetrieve = ({ id }) =>
  useQuery(['useDeliveryRetrieve', id], () => DeliveriesService.retrieve(id), {
    select: (query) => query.data,
    enabled: id !== undefined,
  });

export const useDeliveryEdit = () =>
  useMutation(
    ({
      checkedBy,
      deliveredBy,
      id,
      paymentStatus,
      preparedBy,
      pulledOutBy,
      status,
    }) =>
      DeliveriesService.edit({
        id,
        body: {
          checked_by: checkedBy,
          delivered_by: deliveredBy,
          payment_status: paymentStatus,
          prepared_by: preparedBy,
          pulled_out_by: pulledOutBy,
          status,
        },
      })
  );

export default useDeliveries;
