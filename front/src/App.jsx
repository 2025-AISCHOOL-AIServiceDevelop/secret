import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import './App.css';
import { Header, Footer } from './@design-system';
import { useAuthStore } from './stores';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const { checkAuthStatus, isLoading } = useAuthStore();

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <ErrorBoundary>
      <div className="min-h-dvh grid grid-rows-[auto_1fr_auto]">
        <Header />

        {/* 헤더와 동일한 폭 규칙 */}
        <main className="
          w-full                     /* 헤더처럼 전체폭 */
          my-[0.05rem]
          rounded-[23px] border-[3px] border-[#5E5A6A]
          bg-[#E0EEFF]
          shadow-[0_2px_4px_rgba(0,0,0,0.08)]
          ">
          {/* 헤더 내부 컨테이너와 동일 */}
          <div className="w-full max-w-screen-2xl mx-auto p-6">
            {/* <Outlet /> */}

           {isLoading ? (
            <div className="min-h-[40vh] flex items-center justify-center">
              <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-[#5E5A6A]" />
            </div>
           ) : (
             <Outlet />
           )}

          </div>
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  )
}

export default App
