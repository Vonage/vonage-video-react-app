import ReactDOM from 'react-dom/client';
import { registerIcon } from '@vonage/vivid';
import Box from '@ui/Box';
import App from './App.jsx';
import './i18n.js';
import designTokens from './designTokens/designTokens.js';

// Register Vivid icons for use throughout the application
registerIcon();

/**
 * The root HTML element where the React application is rendered.
 * This element must exist in the DOM for the application to mount correctly.
 */
const rootElement = document.getElementById('root')!;

ReactDOM.createRoot(rootElement).render(
  <Box
    sx={{
      backgroundColor: {
        xs: designTokens.color.light.surface.value,
        md: designTokens.color.light.background.value,
      },
      position: 'relative',
      overflow: 'hidden',
      height: '100dvh',
    }}
  >
    <App />
  </Box>
);
