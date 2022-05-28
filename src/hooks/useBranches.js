import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'globals/variables';
import { useQuery } from 'react-query';
import { BranchesService } from 'services';

const useBranches = () =>
  useQuery(
    'useBranches',
    () =>
      BranchesService.list({
        params: {
          page: DEFAULT_PAGE,
          page_size: DEFAULT_PAGE_SIZE,
        },
      }).catch((e) => Promise.reject(e.errors)),
    {
      initialData: { data: { results: [] } },
      select: (query) => query?.data?.results,
    }
  );

export default useBranches;
