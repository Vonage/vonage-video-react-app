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
  const token = queryParams.get('t');
  const patientId = queryParams.get('patientId');
  const language = queryParams.get('lng');

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
    if (rofimSession?.username) {
      setStorageItem(STORAGE_KEYS.USERNAME, rofimSession.username);
    }
  }

  if (patientId) {
    setStorageItem('patientId', patientId);
  }

  if (language) {
    setStorageItem('i18nextLng', language);
  }
};

export const getRofimSession = () => {
  const token = getStorageItem('token');
  return parseSession(token);
};
