import { BrowserRouter as Router, Route, Routes, FutureConfig } from 'react-router-dom';
import './css/App.css';
import './css/index.css';
import MeetingRoom from './pages/MeetingRoom';
import GoodBye from './pages/GoodBye/index';
import WaitingRoom from './pages/WaitingRoom';
import { PreviewPublisherProvider } from './Context/PreviewPublisherProvider';
import LandingPage from './pages/LandingPage';
import { PublisherProvider } from './Context/PublisherProvider';
import { RedirectToWaitingRoom, ErrorBoundary, EnvGuard } from './components';
import UnsupportedBrowserPage from './pages/UnsupportedBrowserPage';
import RoomProvider from './Context/RoomProvider';
import AppContextProvider from './AppContextProvider';
import RedirectToUnsupportedBrowserPage from '@components/RedirectToUnsupportedBrowserPage';
import SuspenseBoundary from '@web/components/SuspenseBoundary/SuspenseBoundary';
import WaitingRoomSkeleton from '@pages/WaitingRoom/WaitingRoom.skeleton';
import MeetingRoomSkeleton from '@pages/MeetingRoom/MeetingRoom.skeleton';
import SessionProvider from '@Context/SessionProvider/session';
import LoggerSynchronizer from '@Context/LoggerSynchronizer';
import { ErrorPage } from './pages/ErrorBoundary';
import { runtime$ } from '@core/stores';
import { videoClient } from './services';
import { NotificationsContainer } from '@ui/components';
import { BackendLoggingProvider } from './logger/providers';

const futureConfig: Partial<FutureConfig> = {
  /**
   * Enable relative splat paths to ensure that dynamic imports in the app work correctly regardless of the base path.
   */
  v7_relativeSplatPath: true,
  v7_startTransition: true,
};

const InnerApp = () => {
  return (
    <div className="bg-vera-surface vera-desktop:bg-vera-background relative overflow-x-hidden overflow-y-auto h-dvh">
      <Router future={futureConfig}>
        <Routes>
          <Route element={<RedirectToUnsupportedBrowserPage />}>
            <Route
              path="/waiting-room/:roomIdentifier"
              element={
                <SuspenseBoundary fallback={<WaitingRoomSkeleton />}>
                  <RoomProvider>
                    <PreviewPublisherProvider>
                      <WaitingRoom />
                    </PreviewPublisherProvider>
                  </RoomProvider>
                </SuspenseBoundary>
              }
            />

            <Route
              path="/room/:roomIdentifier"
              element={
                <RedirectToWaitingRoom>
                  <SuspenseBoundary fallback={<MeetingRoomSkeleton />}>
                    <RoomProvider>
                      <SessionProvider>
                        <LoggerSynchronizer />
                        <PublisherProvider>
                          <MeetingRoom />
                        </PublisherProvider>
                      </SessionProvider>
                    </RoomProvider>
                  </SuspenseBoundary>
                </RedirectToWaitingRoom>
              }
            />
          </Route>

          <Route path="/goodbye/:roomIdentifier?" element={<GoodBye />} />
          <Route path="*" element={<LandingPage />} />
          <Route path="/unsupported-browser" element={<UnsupportedBrowserPage />} />
        </Routes>
      </Router>
    </div>
  );
};

export const loggerProvider = new BackendLoggingProvider();

/**
 * The wrapper is necessary temporarily since app also need to have access to theme context.
 */
const App = () => {
  return (
    <AppContextProvider>
      <ErrorBoundary fallback={(error) => <ErrorPage error={error} />}>
        <EnvGuard />
        <runtime$.Provider videoClient={videoClient} loggerProvider={loggerProvider}>
          <NotificationsContainer />
          <InnerApp />
        </runtime$.Provider>
      </ErrorBoundary>
    </AppContextProvider>
  );
};

export default App;
