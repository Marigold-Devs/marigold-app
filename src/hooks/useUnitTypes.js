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
      refetchOnWindowFocus: false,
      placeholderData: { data: { results: [] } },
      select: (query) => query?.data?.results,
    }
  );

export default useUnitTypes;
