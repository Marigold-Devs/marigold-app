import { useQuery } from 'react-query';
import { BranchesService } from 'services';

const useBranches = () =>
  useQuery(
    'useBranches',
    () =>
      BranchesService.list({
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

export default useBranches;
