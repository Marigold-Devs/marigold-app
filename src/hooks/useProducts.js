import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'globals/variables';
import { useQuery } from 'react-query';
import { ProductsService } from 'services';

const useProducts = ({ params, options }) =>
  useQuery(
    ['useProducts', params?.page, params?.pageSize, params?.search],
    () =>
      ProductsService.list({
        params: {
          page: params?.page || DEFAULT_PAGE,
          page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
          search: params?.search,
          ids: params?.ids,
        },
      }),
    {
      initialData: { data: { results: [], count: 0 } },
      select: (query) => ({
        products: query.data.results,
        total: query.data.count,
      }),
      ...options,
    }
  );

export default useProducts;
