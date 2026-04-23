import React from 'react';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './utils/toast';
import './App.css';
import './styles/globals.css';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Layout />
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
