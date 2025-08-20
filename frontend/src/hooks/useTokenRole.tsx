import { useLocation } from 'react-router-dom';
import { TokenRole } from '../types/tokenRoles';

/**
 * Custom hook to get the user's token role from the URL.
 * @returns {TokenRole} The user's token role.
 */
const useTokenRole = (): TokenRole => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tokenRole = (searchParams.get('tokenRole') as TokenRole) || 'admin';

  return tokenRole;
};

export default useTokenRole;
