/**
 * Entry point of the React app (frontend).
 * This file runs when the app loads in the browser: it finds the HTML element with id "root"
 * and renders the main App component inside it. StrictMode helps catch common mistakes during development.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Create a "root" for React to attach the app to the DOM
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component; StrictMode wraps it for extra checks in development
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

