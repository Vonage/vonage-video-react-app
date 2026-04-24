import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerIcon } from '@vonage/vivid';
import App from './App';

registerIcon();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
