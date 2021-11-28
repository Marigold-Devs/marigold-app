import { useQuery } from 'react-query';
import { ClientsService } from 'services';

const useClients = ({ params }) =>
  useQuery(
    ['useClients', params.type],
    () =>
      ClientsService.list({
        params: {
          type: params.type,
        },
      }),
    {
      refetchOnWindowFocus: false,
      placeholderData: { data: [] },
      select: (query) => query.data,
    }
  );

export default useClients;
