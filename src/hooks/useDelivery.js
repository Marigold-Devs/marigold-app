import { useQuery } from 'react-query';
import { DeliveriesService } from 'services';

const useDelivery = ({ id }) =>
  useQuery(['useDelivery', id], () => DeliveriesService.retrieve(id), {
    refetchOnWindowFocus: false,
    select: (query) => query.data,
    enabled: id !== undefined,
  });

export default useDelivery;
