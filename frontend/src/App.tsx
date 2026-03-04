import { BrowserRouter as Router, Route, Routes, FutureConfig } from 'react-router-dom';
import './css/App.css';
import './css/index.css';
import MeetingRoom from './pages/MeetingRoom';
import GoodBye from './pages/GoodBye/index';
import WaitingRoom from './pages/WaitingRoom';
import { PreviewPublisherProvider } from './Context/PreviewPublisherProvider';
import LandingPage from './pages/LandingPage';
import { PublisherProvider } from './Context/PublisherProvider';
import RedirectToWaitingRoom from './components/RedirectToWaitingRoom';
import UnsupportedBrowserPage from './pages/UnsupportedBrowserPage';
import RoomProvider from './Context/RoomProvider';
import Box from '@mui/material/Box';
import useTheme from '@ui/theme';
import AppContextProvider from './AppContextProvider';
import RedirectToUnsupportedBrowserPage from '@components/RedirectToUnsupportedBrowserPage';
import SuspenseBoundary from '@web/components/SuspenseBoundary/SuspenseBoundary';
import WaitingRoomSkeleton from '@pages/WaitingRoom/WaitingRoom.skeleton';
import MeetingRoomSkeleton from '@pages/MeetingRoom/MeetingRoom.skeleton';
import SessionProvider from '@Context/SessionProvider/session';
import ErrorBoundary from './components/ErrorBoundary';
import EnvGuard from './components/EnvGuard';
import { ErrorPage } from './pages/ErrorBoundary';

const futureConfig: Partial<FutureConfig> = {
  /**
   * Enable relative splat paths to ensure that dynamic imports in the app work correctly regardless of the base path.
   */
  v7_relativeSplatPath: true,
  v7_startTransition: true,
};

const InnerApp = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: {
          xs: theme.colors.surface,
          md: theme.colors.background,
        },
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'auto',
        height: '100dvh',
      }}
    >
      <Router future={futureConfig}>
        <Routes>
          <Route element={<RedirectToUnsupportedBrowserPage />}>
            <Route
              path="/waiting-room/:roomName"
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
              path="/room/:roomName"
              element={
                <RedirectToWaitingRoom>
                  <SuspenseBoundary fallback={<MeetingRoomSkeleton />}>
                    <RoomProvider>
                      <SessionProvider>
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

          <Route path="/goodbye" element={<GoodBye />} />
          <Route path="*" element={<LandingPage />} />
          <Route path="/unsupported-browser" element={<UnsupportedBrowserPage />} />
        </Routes>
      </Router>
    </Box>
  );
};

/**
 * The wrapper is necessary temporarily since app also need to have access to theme context.
 */
const App = () => {
  return (
    <AppContextProvider>
      <ErrorBoundary fallback={(error) => <ErrorPage error={error} />}>
        <EnvGuard />
        <InnerApp />
      </ErrorBoundary>
    </AppContextProvider>
  );
};

export default App;
