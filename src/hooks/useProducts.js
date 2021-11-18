import { useQuery } from 'react-query';
import { ProductsService } from 'services';

const useProducts = ({ params }) =>
  useQuery(
    ['useProducts', params.page, params.pageSize, params.search],
    () =>
      ProductsService.list({
        params: {
          page: params.page,
          page_size: params.pageSize,
          search: params.search,
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

export default useProducts;
