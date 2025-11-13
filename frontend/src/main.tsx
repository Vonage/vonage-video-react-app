import ReactDOM from 'react-dom/client';
import { registerIcon } from '@vonage/vivid';
import Box from '@ui/Box';
import { colors } from '@utils/customTheme/customTheme';
import App from './App.jsx';
import './i18n.js';

// Register Vivid icons for use throughout the application
registerIcon();

/**
 * The root HTML element where the React application is rendered.
 * This element must exist in the DOM for the application to mount correctly.
 */
const rootElement = document.getElementById('root')!;

ReactDOM.createRoot(rootElement).render(
  <Box sx={{ backgroundColor: colors.surface, position: 'relative' }}>
    <App />
  </Box>
);
