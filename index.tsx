import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { GOOGLE_CLIENT_ID } from './config';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.startsWith('YOUR_GOOGLE_CLIENT_ID')) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.right = '0';
  container.style.bottom = '0';
  container.style.backgroundColor = 'rgba(0,0,0,0.8)';
  container.style.color = 'white';
  container.style.display = 'flex';
  container.style.justifyContent = 'center';
  container.style.alignItems = 'center';
  container.style.zIndex = '9999';
  container.innerHTML = `
    <div style="background-color: #ff4444; padding: 2rem; border-radius: 0.5rem; text-align: center;">
      <h1 style="font-size: 1.5rem; font-weight: bold;">Configuration Error</h1>
      <p style="margin-top: 1rem;">Google Client ID is not configured. Please edit the <strong>config.ts</strong> file and restart the server.</p>
    </div>
  `;
  document.body.appendChild(container);
  throw new Error('Google Client ID is not configured. Please edit the config.ts file.');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);