import { useQuery } from 'react-query';
import { PreordersService } from 'services';

const usePreorder = ({ id }) =>
  useQuery(['usePreorder', id], () => PreordersService.retrieve(id), {
    refetchOnWindowFocus: false,
    select: (query) => query.data,
    enabled: id !== undefined,
  });

export default usePreorder;
