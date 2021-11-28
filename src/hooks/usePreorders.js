import { useQuery } from 'react-query';
import { PreordersService } from 'services';

const usePreorders = ({ params }) =>
  useQuery(
    ['usePreorders', params.page, params.pageSize],
    () =>
      PreordersService.list({
        params: {
          page: params.page,
          page_size: params.pageSize,
        },
      }),
    {
      refetchOnWindowFocus: false,
      placeholderData: { data: { results: [], count: 0 } },
      select: (query) => ({
        preorders: query.data.results,
        total: query.data.count,
      }),
    }
  );

export default usePreorders;
