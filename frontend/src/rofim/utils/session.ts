import { jwtDecode } from 'jwt-decode';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../../utils/storage';

const parseSession = (rawJwt: string | null) => {
  if (!rawJwt) {
    return null;
  }

  return jwtDecode<{
    username: string;
    room: string;
    token: string;
    sessionId: string;
  }>(rawJwt);
};

export const initRofimSession = () => {
  const queryParams = new URLSearchParams(window.location.search);
  let token = queryParams.get('t');
  let patientId = queryParams.get('patientId');

  if (!token && !getStorageItem('token')) {
    throw new Error('Missing Rofim Session Token');
  }

  if (token) {
    setStorageItem('token', token);
    window.history.replaceState(
      {},
      document.title,
      window.location.href.replace(window.location.search, '')
    );
    const rofimSession = parseSession(token);
    rofimSession?.username && setStorageItem(STORAGE_KEYS.USERNAME, rofimSession.username);
  }

  patientId && setStorageItem('patientId', patientId);
};

export const getRofimSession = () => {
  const token = getStorageItem('token');
  return parseSession(token);
};
