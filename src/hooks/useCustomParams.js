import { useSearchParams } from 'react-router-dom';

const useCustomParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const setQueryParams = (
    param,
    { shouldResetPage = false, shouldIncludeCurrentParams = true } = {}
  ) => {
    const newSearchParams = {
      ...(shouldIncludeCurrentParams ? Object.fromEntries(searchParams) : {}),
      ...(shouldResetPage ? { page: 1 } : {}),
      ...param,
    };
    Object.keys(newSearchParams).forEach((key) =>
      newSearchParams[key] === undefined ? delete newSearchParams[key] : {}
    );

    setSearchParams(newSearchParams);
  };

  return { setSearchParams: setQueryParams };
};

export default useCustomParams;
