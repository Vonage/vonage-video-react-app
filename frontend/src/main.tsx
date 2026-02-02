import ReactDOM from 'react-dom/client';
import { registerIcon } from '@vonage/vivid';
import App from './App.jsx';
import './i18n.js';
import { frontendLogger } from './logger';
import { createConsoleLoggerProvider } from './logger/providers/consoleProvider.ts';

// Register Vivid icons for use throughout the application
registerIcon();

/**
 * The root HTML element where the React application is rendered.
 * This element must exist in the DOM for the application to mount correctly.
 */
const rootElement = document.getElementById('root')!;
await frontendLogger.setup(() => createConsoleLoggerProvider());

const root = ReactDOM.createRoot(rootElement, frontendLogger.getReactRootOptions());
root.render(<App />);
