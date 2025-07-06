import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Pastikan Anda memiliki file CSS ini untuk Tailwind
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Dengan membungkus App dengan AuthProvider, semua komponen di dalam App
      bisa mengakses data user melalui hook useAuth()
    */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);