import { Outlet, Link, useLocation } from 'react-router-dom'
import './App.css'

function App() {
  const location = useLocation()

  return (
    <div className="min-h-dvh grid grid-rows-[auto_1fr_auto]">
      <header className="sticky top-0 z-10 bg-header border-b-2 border-headerBorder">
        <div className="max-w-[1200px] mx-auto px-5 py-4 flex items-center justify-between">
          <Link to="/" className="font-extrabold text-[22px] text-[#6f58b1] no-underline">두근두근 지구말</Link>
          <nav className="flex gap-2">
            <Link className={`no-underline font-bold rounded-full px-4 py-2 border-2 border-[#a89a77] ${location.pathname === '/login' ? 'bg-white' : 'bg-white/70'} text-[#394b69]` } to="/login">로그인</Link>
            <Link className="no-underline font-bold rounded-full px-4 py-2 border-2 border-[#a89a77] bg-white/70 text-[#394b69]" to="/">마이페이지</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto p-5">
        <Outlet />
      </main>

      <footer className="bg-header border-t-2 border-headerBorder">
        <div className="max-w-[1200px] mx-auto px-5 py-3 text-[#6c5d3d] text-xs">
          모든 이미지는 두근두근 지구말의 소유로 임의 복제 또는 배포를 금합니다.
        </div>
      </footer>
    </div>
  )
}

export default App
