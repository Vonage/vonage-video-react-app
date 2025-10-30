import { Outlet } from 'react-router-dom';
import { ReactElement } from 'react';
import RedirectToUnsupportedBrowserPage from '../components/RedirectToUnsupportedBrowserPage';
import { AudioOutputProvider } from './AudioOutputProvider';
import UserProvider from './user';
import { AppConfigProvider } from './AppConfig';
import { BackgroundPublisherProvider } from './BackgroundPublisherProvider';
import type { AppConfig, AppConfigContextType } from './AppConfig';

/**
 * Wrapper for all of the contexts used by the waiting room and the meeting room.
 * @param {object} props - The component props.
 * @param {AppConfig} [props.appConfigValue] - Optional AppConfig value to initialize the context with... For testing purposes.
 * @returns {ReactElement} The context.
 */
const RoomContext = ({ appConfigValue }: { appConfigValue?: AppConfig }): ReactElement => (
  <AppConfigProvider value={appConfigValue} onCreated={fetchAppConfiguration}>
    <UserProvider>
      <BackgroundPublisherProvider>
        <RedirectToUnsupportedBrowserPage>
          <AudioOutputProvider>
            <Outlet />
          </AudioOutputProvider>
        </RedirectToUnsupportedBrowserPage>
      </BackgroundPublisherProvider>
    </UserProvider>
  </AppConfigProvider>
);

/**
 * Fetches the app static configuration if it has not been loaded yet.
 * @param {AppConfigContextType} context - The AppConfig context.
 */
function fetchAppConfiguration(context: AppConfigContextType): void {
  const { isAppConfigLoaded } = context.getState();

  if (isAppConfigLoaded) {
    return;
  }

  context.actions.loadAppConfig();
}

export default RoomContext;
