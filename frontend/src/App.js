import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { router } from './router';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { borderRadius: '8px', fontFamily: 'inherit' },
            success: { iconTheme: { primary: '#2e7d32', secondary: '#fff' } },
            error: { iconTheme: { primary: '#c62828', secondary: '#fff' } },
          }}
        />
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}
