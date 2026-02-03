import ReactDOM from 'react-dom/client';
import { registerIcon } from '@vonage/vivid';
import App from './App.jsx';
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

/**
 * Here you should set your actual logging provider configuration.
 * Optional for testing you can uncomment this and use verbose true to see logs in console.
 */
// Logger.setup(() => ({
//   verbose: false,
//   log: (_eventName: string, _payload?: Record<string, unknown>) => {},
//   reportError: (_error: unknown, _context?: Record<string, unknown>) => {},
// }));

ReactDOM.createRoot(rootElement, {
  onUncaughtError,
  onRecoverableError,
  onCaughtError,
}).render(<App />);
