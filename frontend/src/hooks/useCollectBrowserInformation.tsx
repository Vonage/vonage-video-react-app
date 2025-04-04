import useSessionContext from './useSessionContext';

export type BrowserInformationType = {
  sessionId?: string;
  browser: string;
  screenResolution: string;
  referrer: string;
  currentUrl: string;
  language: string;
  isOnline: boolean;
  timeZone: string;
  cookiesEnabled: boolean;
  windowSize: {
    height: number;
    width: number;
  };
  connectionId?: string;
};

/**
 * Collects browser and session data from the user.
 * @returns {BrowserInformationType} The session and browser information from the user.
 */
const useCollectBrowserInformation = (): BrowserInformationType => {
  const { session } = useSessionContext();
  return {
    sessionId: session?.sessionId,
    browser: navigator.userAgent,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    referrer: document.referrer || 'No referrer',
    currentUrl: window.location.href,
    language: navigator.language,
    isOnline: navigator.onLine,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookiesEnabled: navigator.cookieEnabled,
    windowSize: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    connectionId: session?.connectionId,
  };
};

export default useCollectBrowserInformation;
