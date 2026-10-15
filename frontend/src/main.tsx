// runs interceptors before vonage sdk initialize resources (XHR, navigator.mediaDevices clones, etc)
import '@core/interceptors';

// executes application setup before anything else (e.g. overrides, mocks, etc)
import './setup';

import ReactDOM from 'react-dom/client';
import { registerIcon } from '@vonage/vivid';
import App, { loggerProvider } from './App.jsx';
import './i18n.js';
import Logger from './logger';

// Register Vivid icons for use throughout the application
registerIcon();

/**
 * The root HTML element where the React application is rendered.
 * This element must exist in the DOM for the application to mount correctly.
 */
const rootElement = document.getElementById('root')!;

const { onUncaughtError, onRecoverableError, onCaughtError } = Logger;

Logger.setup(() => loggerProvider);

ReactDOM.createRoot(rootElement, {
  onUncaughtError,
  onRecoverableError,
  onCaughtError,
}).render(<App />);
