import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'globals/variables';
import { useMutation, useQuery } from 'react-query';
import { PreordersService } from 'services';

const usePreorders = ({ params }) =>
  useQuery(
    [
      'usePreorders',
      params?.dateCreated,
      params?.dateFulfilled,
      params?.page,
      params?.pageSize,
      params?.search,
      params?.status,
    ],
    () =>
      PreordersService.list({
        params: {
          date_created: params?.dateCreated,
          date_fulfilled: params?.dateFulfilled,
          page: params?.page || DEFAULT_PAGE,
          page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
          search: params?.search,
          status: params?.status,
        },
      }),
    {
      initialData: { data: { results: [], count: 0 } },
      select: (query) => ({
        preorders: query.data.results,
        total: query.data.count,
      }),
    }
  );

export const usePreorderRetrieve = ({ id }) =>
  useQuery(['usePreorderRetrieve', id], () => PreordersService.retrieve(id), {
    select: (query) => query.data,
    enabled: id !== undefined,
  });

export const usePreorderCreate = () =>
  useMutation(
    ({ branchId, deliveryType, description, supplier, preorderProducts }) =>
      PreordersService.create({
        body: {
          branch_id: branchId,
          delivery_type: deliveryType,
          description,
          supplier,
          preorder_products: preorderProducts,
        },
      })
  );

export const usePreorderEdit = () =>
  useMutation(({ id, description, preorderProducts, status }) =>
    PreordersService.edit({
      id,
      body: {
        description,
        preorder_products: preorderProducts,
        status,
      },
    })
  );

export default usePreorders;
