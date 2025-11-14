import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import './App.css';
import { Header, Footer } from './@design-system';
import { useAuthStore } from './stores';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastContainer } from './components/Toast';

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

        <main className="
          w-full                     /* 헤더처럼 전체폭 */
          my-[0.05rem]                /* 상하 여백 */
          p-10
          ">
          <Outlet />
        </main>

        <Footer />
      </div>
      
      {/* 전역 토스트 컨테이너 */}
      <ToastContainer />
    </ErrorBoundary>
  )
}

export default App
