import { useQuery } from 'react-query';
import { ProductsService } from 'services';

const useProduct = ({ id }) =>
  useQuery(['useProduct', id], () => ProductsService.retrieve(id), {
    select: (query) => query.data,
    enabled: id !== undefined,
  });

export default useProduct;
