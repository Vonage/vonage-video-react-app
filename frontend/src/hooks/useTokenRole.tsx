import { useLocation } from 'react-router-dom';

/**
 * Type definitions for user roles.
 * @typedef {string} TokenRole
 * @property {string} admin - The admin user role.
 * @property {string} participant - The participant user role.
 * @property {string} viewer - The viewer user role.
 */
export type TokenRole = 'admin' | 'participant' | 'viewer';

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
