import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './i18n.js';

/**
 * The root HTML element where the React application is rendered.
 * This element must exist in the DOM for the application to mount correctly.
 */
const rootElement = document.getElementById('root')!;

/**
 * Initializes and renders the React application into the root element.
 */
ReactDOM.createRoot(rootElement).render(<App />);
