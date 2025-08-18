import { useLocation } from 'react-router-dom';

const useTokenRole = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tokenRole = searchParams.get('tokenRole') || 'admin';

  return tokenRole;
};

export default useTokenRole;
