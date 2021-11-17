import { useQuery } from 'react-query';
import { ProductsService } from 'services';

const useProducts = ({ params }) =>
  useQuery(
    ['products', params.page, params.pageSize, params.search],
    () => ProductsService.list({ params }),
    {
      refetchOnWindowFocus: false,
      placeholderData: { data: { results: [], total: 0 } },
      select: (query) => ({
        products: query.data.results,
        total: query.data.count,
      }),
    }
  );

export default useProducts;
