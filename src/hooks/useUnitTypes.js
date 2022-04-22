import { useQuery } from 'react-query';
import { UnitTypesService } from 'services';

const useUnitTypes = () =>
  useQuery(
    'useUnitTypes',
    () =>
      UnitTypesService.list({
        params: {
          page: 1,
          page_size: 100,
        },
      }),
    {
      initialData: { data: { results: [] } },
      select: (query) => query?.data?.results,
    }
  );

export default useUnitTypes;
