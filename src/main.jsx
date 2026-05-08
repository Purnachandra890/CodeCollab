import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './AuthContext';
import { RoomsProvider } from './RoomsContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <RoomsProvider>
      <App />
    </RoomsProvider>
  </AuthProvider>
);
