import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './css/App.css';
import './css/index.css';
import MeetingRoom from './pages/MeetingRoom';
import GoodBye from './pages/GoodBye/index';
import WaitingRoom from './pages/WaitingRoom';
import SessionProvider from './Context/SessionProvider/session';
import { PreviewPublisherProvider } from './Context/PreviewPublisherProvider';
import LandingPage from './pages/LandingPage';
import { PublisherProvider } from './Context/PublisherProvider';
import RedirectToWaitingRoom from './components/RedirectToWaitingRoom';
import UnsupportedBrowserPage from './pages/UnsupportedBrowserPage';
import RoomContext from './Context/RoomContext';
import Box from '@ui/Box';
import useTheme, { ThemeProvider } from '@ui/theme';

const App = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: {
          xs: theme.colors.surface,
          md: theme.colors.background,
        },
        position: 'relative',
        overflow: 'hidden',
        height: '100dvh',
      }}
    >
      <Router>
        <Routes>
          <Route element={<RoomContext />}>
            <Route
              path="/waiting-room/:roomName"
              element={
                <PreviewPublisherProvider>
                  <WaitingRoom />
                </PreviewPublisherProvider>
              }
            />
            <Route
              path="/room/:roomName"
              element={
                <SessionProvider>
                  <RedirectToWaitingRoom>
                    <PublisherProvider>
                      <MeetingRoom />
                    </PublisherProvider>
                  </RedirectToWaitingRoom>
                </SessionProvider>
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

const AppWrapper = () => {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
};

export default AppWrapper;
