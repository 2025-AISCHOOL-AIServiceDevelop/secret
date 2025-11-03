import { Link, useLocation } from 'react-router-dom'
import { AppTitle } from './Typography'

// Header component
export const Header = () => {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-10 bg-header border-[3px] rounded-[18px] border-[#5E5A6A] rounded-2xl shadow-sm">
      <div className="relative w-full max-w-screen-2xl mx-auto px-1 py-1 flex items-center justify-center">
        
        {/* 중앙 로고 */}
        <Link to="/"  className="flex justify-center items-center">
          <AppTitle><img src = "/rogo.png" alt ="두근두근지구말" className="h-40 object-contain mx-auto pointer-events-none"/> </AppTitle>
          
        </Link>
        {/* 오른쪽 버튼 고정 */}
        <nav className="absolute right-8 top-1/2 -translate-y-1/2 flex gap-3 z-10">
          <Link to="/login"
            className={`no-underline font-bold rounded-full px-5 py-2 border-2 border-[#a89a77] ${
              location.pathname === '/login' ? 'bg-white' : 'bg-white/70'
            } text-[#394b69]`}
          >
            로그인
          </Link>

          <Link to="/mypage"
            className="no-underline font-extrabold text-[#394b69]
          inline-flex items-center justify-center
          w-[130.7px] h-[57.3px] shrink-0
          rounded-full border-[2.5px] border-[#6C798A] bg-[#B1D2FA]
          leading-none select-none
          transition-colors duration-150
          hover:bg-[#c9ddff] focus:outline-none focus:ring-2 focus:ring-[#B1D2FA]/50" 
          >
            마이페이지
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header
