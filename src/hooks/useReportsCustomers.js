import { useQuery } from 'react-query';
import { ReportsService } from 'services';

const useReportsCustomers = ({ params }) =>
  useQuery(
    ['useReportsCustomers', params.page, params.pageSize],
    () =>
      ReportsService.listTopPayingCustomers({
        params: {
          page: params.page,
          page_size: params.pageSize,
        },
      }),
    {
      refetchOnWindowFocus: false,
      placeholderData: { data: { results: [], count: 0 } },
      select: (query) => ({
        customers: query.data.results,
        total: query.data.count,
      }),
    }
  );

export default useReportsCustomers;
