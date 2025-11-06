import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import './pages/index.js'
import App from './App.jsx'

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Player = lazy(() => import('./pages/Player.jsx'))
const Mypage = lazy(() => import('./pages/Mypage.jsx')) // ✅ 추가

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'player', element: <Player /> },
      { path: 'mypage', element: <Mypage /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    }>
      <RouterProvider router={router} />
    </Suspense>
  </StrictMode>,
)
