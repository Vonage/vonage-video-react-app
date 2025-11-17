import { Outlet } from 'react-router-dom';
import { ReactElement } from 'react';
import RedirectToUnsupportedBrowserPage from '../components/RedirectToUnsupportedBrowserPage';
import { AudioOutputProvider } from './AudioOutputProvider';
import UserProvider from './user';
import appConfig from './AppConfig';
import { BackgroundPublisherProvider } from './BackgroundPublisherProvider';
import type { AppConfig, AppConfigApi } from './AppConfig';

/**
 * Wrapper for all of the contexts used by the waiting room and the meeting room.
 * @param {object} props - The component props.
 * @param {AppConfig} [props.appConfigValue] - Optional AppConfig value to initialize the context with... For testing purposes.
 * @returns {ReactElement} The context.
 */
const RoomContext = ({ appConfigValue }: { appConfigValue?: AppConfig }): ReactElement => (
  <appConfig.Provider value={appConfigValue} onCreated={fetchAppConfiguration}>
    <UserProvider>
      <BackgroundPublisherProvider>
        <RedirectToUnsupportedBrowserPage>
          <AudioOutputProvider>
            <Outlet />
          </AudioOutputProvider>
        </RedirectToUnsupportedBrowserPage>
      </BackgroundPublisherProvider>
    </UserProvider>
  </appConfig.Provider>
);

/**
 * Fetches the app static configuration if it has not been loaded yet.
 * @param {AppConfigApi} context - The AppConfig context.
 */
function fetchAppConfiguration(context: AppConfigApi): void {
  const { isAppConfigLoaded } = context.getState();

  if (isAppConfigLoaded) {
    return;
  }

  context.actions.loadAppConfig();
}

export default RoomContext;
