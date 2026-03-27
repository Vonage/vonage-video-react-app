// Workaround: ensure MUI createTheme module is evaluated before any component
// (e.g. Box) reads the default theme. This avoids a Vite optimizeDeps init-order
// issue that can surface as `createTheme_default is not a function`.
import '@mui/material/styles/createTheme';

import ReactDOM from 'react-dom/client';
import { registerIcon } from '@vonage/vivid';
import App from './App.jsx';
import './i18n.js';
import Logger from './logger';
import { BackendLoggingProvider } from './logger/providers';

// Register Vivid icons for use throughout the application
registerIcon();

/**
 * The root HTML element where the React application is rendered.
 * This element must exist in the DOM for the application to mount correctly.
 */
const rootElement = document.getElementById('root')!;

const { onUncaughtError, onRecoverableError, onCaughtError } = Logger;

Logger.setup(() => new BackendLoggingProvider());

ReactDOM.createRoot(rootElement, {
  onUncaughtError,
  onRecoverableError,
  onCaughtError,
}).render(<App />);
