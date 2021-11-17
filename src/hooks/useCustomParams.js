import { useSearchParams } from 'react-router-dom';

const useCustomParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const setQueryParams = (
    param,
    { shouldResetPage = false, shouldIncludeCurrentParams = true } = {}
  ) => {
    setSearchParams({
      ...(shouldIncludeCurrentParams ? Object.fromEntries(searchParams) : {}),
      ...(shouldResetPage ? { page: 1 } : {}),
      ...param,
    });
  };

  return { setSearchParams: setQueryParams };
};

export default useCustomParams;
