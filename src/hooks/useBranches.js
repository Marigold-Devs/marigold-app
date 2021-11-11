import { useQuery } from 'react-query';
import { BranchesService } from 'services';

const useBranches = ({ params }) =>
  useQuery('branches', () => BranchesService.list({ params }), {
    refetchOnWindowFocus: false,
    placeholderData: { data: { results: [] } },
    select: (query) => query?.data?.results,
  });

export default useBranches;
