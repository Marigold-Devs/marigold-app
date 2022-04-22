import { useQuery } from 'react-query';
import { ReportsService } from 'services';

const useReportsProducts = ({ params }) =>
  useQuery(
    [
      'useReportsProducts',
      params.page,
      params.pageSize,
      params.branchId,
      params.dateRange,
    ],
    () =>
      ReportsService.listTopSellingProducts({
        params: {
          page: params.page,
          page_size: params.pageSize,
          branch_id: params.branchId,
          date_range: params.dateRange,
        },
      }),
    {
      initialData: { data: { results: [], count: 0 } },
      select: (query) => ({
        products: query.data.results,
        total: query.data.count,
      }),
    }
  );

export default useReportsProducts;
