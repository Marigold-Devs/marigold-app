import { useQuery } from 'react-query';
import { BranchProductsService } from 'services';

const useBranchProducts = ({ params }) =>
  useQuery(
    [
      'useBranchProducts',
      params.page,
      params.pageSize,
      params.search,
      params.branchId,
      params.status,
    ],
    () =>
      BranchProductsService.list({
        params: {
          page: params.page,
          page_size: params.pageSize,
          branch_id: params.branchId,
          search: params.search,
          status: params.status,
        },
      }),
    {
      refetchOnWindowFocus: false,
      placeholderData: { data: { results: [], count: 0 } },
      select: (query) => ({
        products: query.data.results,
        total: query.data.count,
      }),
    }
  );

export default useBranchProducts;
