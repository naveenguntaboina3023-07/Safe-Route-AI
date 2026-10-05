import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: { background: '#1f2937', color: '#f9fafb', fontSize: '14px' },
        success: { iconTheme: { primary: '#16a34a', secondary: '#f9fafb' } },
        error:   { iconTheme: { primary: '#dc2626', secondary: '#f9fafb' } },
      }}
    />
  </React.StrictMode>
);
