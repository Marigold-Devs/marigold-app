import { useQuery } from 'react-query';
import { ReportsService } from 'services';

const useReportsCustomers = ({ params }) =>
  useQuery(
    ['useReportsCustomers', params.page, params.pageSize, params.dateRange],
    () =>
      ReportsService.listTopPayingCustomers({
        params: {
          page: params.page,
          page_size: params.pageSize,
          date_range: params.dateRange,
        },
      }),
    {
      initialData: { data: { results: [], count: 0 } },
      select: (query) => ({
        customers: query.data.results,
        total: query.data.count,
      }),
    }
  );

export default useReportsCustomers;
