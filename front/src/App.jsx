import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import './App.css';
import { Header, Footer } from './@design-system';
import { useAuthStore } from './stores';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const { checkAuthStatus } = useAuthStore();

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <ErrorBoundary>
      <div className="min-h-dvh grid grid-rows-[auto_1fr_auto]">
        <Header />

        <main className="w-full max-w-screen-2xl mx-auto p-5">
          <Outlet />
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  )
}

export default App
