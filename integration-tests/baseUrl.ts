const isDebugMode = process.env.debugMode === 'true';

const normalizeBaseUrl = (url: string): string => (url.endsWith('/') ? url : `${url}/`);

const baseURL = (() => {
  if (process.env.BASE_URL) {
    return normalizeBaseUrl(process.env.BASE_URL);
  }
  if (isDebugMode) {
    return 'http://localhost:5173/';
  }
  return 'http://127.0.0.1:3345/';
})();

export default baseURL;
