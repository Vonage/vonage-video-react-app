import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import '../css/App.css';
import '../css/index.css';
import Room from './pages/MeetingRoom/index';
import WaitingRoom from './pages/WaitingRoom';
import WaitingDoctor from './pages/WaitingDoctor';
import SessionProvider from '../Context/SessionProvider/session';
import { PreviewPublisherProvider } from '../Context/PreviewPublisherProvider';
import { PublisherProvider } from '../Context/PublisherProvider';
import RedirectToWaitingRoom from '../components/RedirectToWaitingRoom';
import UnsupportedBrowserPage from './pages/UnsupportedBrowserPage';
import RoomContext from '../Context/RoomContext';
import RofimInit from './context/RofimContext';
import ErrorPage from './pages/ErrorPage';
import GoodBye from './pages/GoodBye';

const App = () => {
  return (
    <Router>
      <RofimInit>
        <SessionProvider>
          <Routes>
            <Route element={<RoomContext />}>
              <Route
                path="/"
                element={
                  <PreviewPublisherProvider>
                    <WaitingRoom />
                  </PreviewPublisherProvider>
                }
              />
              <Route path="/waiting-doctor" element={<WaitingDoctor />} />
              <Route
                path="/room/:roomName"
                element={
                  <RedirectToWaitingRoom>
                    <PublisherProvider>
                      <Room />
                    </PublisherProvider>
                  </RedirectToWaitingRoom>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/goodbye" element={<GoodBye />} />
            <Route path="/unsupported-browser" element={<UnsupportedBrowserPage />} />
            <Route path="/error" element={<ErrorPage />} />
          </Routes>
        </SessionProvider>
      </RofimInit>
    </Router>
  );
};

export default App;
