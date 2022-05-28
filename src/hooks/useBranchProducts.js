import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'globals/variables';
import { useMutation, useQuery } from 'react-query';
import { BranchProductsService } from 'services';

const useBranchProducts = ({ params, options }) =>
  useQuery(
    [
      'useBranchProducts',
      params?.branchId,
      params?.page,
      params?.pageSize,
      params?.search,
      params?.status,
    ],
    () =>
      BranchProductsService.list({
        params: {
          branch_id: params?.branchId,
          page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
          page: params?.page || DEFAULT_PAGE,
          search: params?.search,
          status: params?.status,
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

export const useBranchProductConvert = () =>
  useMutation(
    ({ fromBranchProductId, fromQuantity, toBranchProductId, toQuantity }) =>
      BranchProductsService.convert({
        body: {
          from_branch_product_id: fromBranchProductId,
          from_quantity: fromQuantity,
          to_branch_product_id: toBranchProductId,
          to_quantity: toQuantity,
        },
      })
  );

export default useBranchProducts;
