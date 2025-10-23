import { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './css/App.css';
import './css/index.css';
import { CssBaseline } from '@mui/material';
import WaitingRoomSkeleton from '@pages/WaitingRoom/WaitingRoom.skeleton';
import { PreviewPublisherProvider } from '@Context/PreviewPublisherProvider';
import MeetingRoomSkeleton from '@pages/MeetingRoom/MeetingRoom.skeleton';
import RedirectToUnsupportedBrowserPage from '@components/RedirectToUnsupportedBrowserPage';
import MeetingRoom from './pages/MeetingRoom';
import GoodBye from './pages/GoodBye/index';
import WaitingRoom from './pages/WaitingRoom';
import LandingPage from './pages/LandingPage';
import { PublisherProvider } from './Context/PublisherProvider';
import RedirectToWaitingRoom from './components/RedirectToWaitingRoom';
import UnsupportedBrowserPage from './pages/UnsupportedBrowserPage';
import RoomContext from './Context/RoomContext';
import AppContextProvider from './AppContextProvider';

export const App = () => {
  return (
    <AppContextProvider>
      <CssBaseline />
      <Router>
        <Routes>
          <Route element={<RedirectToUnsupportedBrowserPage />}>
            <Route
              path="/waiting-room/:roomName"
              element={
                <Suspense fallback={<WaitingRoomSkeleton />}>
                  <RoomContext>
                    <PreviewPublisherProvider>
                      <WaitingRoom />
                    </PreviewPublisherProvider>
                  </RoomContext>
                </Suspense>
              }
            />

            <Route
              path="/room/:roomName"
              element={
                <RedirectToWaitingRoom>
                  <Suspense fallback={<MeetingRoomSkeleton />}>
                    <RoomContext>
                      <PublisherProvider>
                        <MeetingRoom />
                      </PublisherProvider>
                    </RoomContext>
                  </Suspense>
                </RedirectToWaitingRoom>
              }
            />
          </Route>

          <Route path="/goodbye" element={<GoodBye />} />
          <Route path="*" element={<LandingPage />} />
          <Route path="/unsupported-browser" element={<UnsupportedBrowserPage />} />
        </Routes>
      </Router>
    </AppContextProvider>
  );
};

export default App;
