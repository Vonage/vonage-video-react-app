import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './css/App.css';
import './css/index.css';
import Room from './pages/MeetingRoom/index';
import GoodBye from './pages/GoodBye/index';
import WaitingRoom from './pages/WaitingRoom';
import SessionProvider from './Context/SessionProvider/session';
import { PreviewPublisherProvider } from './Context/PreviewPublisherProvider';
import LandingPage from './pages/LandingPage';
import PreCallTest from './pages/PreCallTest';
import { PublisherProvider } from './Context/PublisherProvider';
import RedirectToWaitingRoom from './components/RedirectToWaitingRoom';
import UnsupportedBrowserPage from './pages/UnsupportedBrowserPage';
import RoomContext from './Context/RoomContext';

const App = () => {
  return (
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
                    <Room />
                  </PublisherProvider>
                </RedirectToWaitingRoom>
              </SessionProvider>
            }
          />
        </Route>
        <Route path="/goodbye" element={<GoodBye />} />
        <Route path="/precall/:roomName" element={<PreCallTest />} />
        <Route path="*" element={<LandingPage />} />
        <Route path="/unsupported-browser" element={<UnsupportedBrowserPage />} />
      </Routes>
    </Router>
  );
};

export default App;
