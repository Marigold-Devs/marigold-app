import { DEFAULT_PAGE, MAX_PAGE_SIZE } from 'globals/variables';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { UnitTypesService } from 'services';

const useUnitTypes = () =>
  useQuery(
    'useUnitTypes',
    () =>
      UnitTypesService.list({
        params: {
          page: DEFAULT_PAGE,
          page_size: MAX_PAGE_SIZE,
        },
      }).catch((e) => Promise.reject(e.errors)),
    {
      initialData: { data: { results: [] } },
      select: (query) => query?.data?.results,
    }
  );

export const useUnitTypeCreate = () => {
  const queryClient = useQueryClient();

  return useMutation(({ name }) => UnitTypesService.create({ name }), {
    onSuccess: () => {
      queryClient.invalidateQueries('useUnitTypes');
    },
  });
};

export const useUnitTypeEdit = () => {
  const queryClient = useQueryClient();

  return useMutation(({ id, name }) => UnitTypesService.edit(id, { name }), {
    onSuccess: () => {
      queryClient.invalidateQueries('useUnitTypes');
    },
  });
};

export default useUnitTypes;
