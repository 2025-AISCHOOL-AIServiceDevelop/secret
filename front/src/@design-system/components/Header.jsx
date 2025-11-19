import { useState, memo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, LogIn } from 'lucide-react';
import { AppTitle } from './Typography';
import LoginModal from './LoginModal';   // 정확한 경로
import { useAuthStore } from '../../stores';

export const Header = memo(() => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();

  // 로그인 모달 상태
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLoginClick = () => {
    setShowLoginModal(true);  // 모달 열기
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const location = useLocation();

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.location.reload();   
    } else {
      navigate("/");              
    }
  };


  const pillBtn =
    "text-2xl text-stroke-2 font-[DungeonFighterOnlineBeatBeat] text-[#FFFFFF] " +
    "inline-flex items-center justify-center " +
    "w-[130.7px] h-[57.3px] shrink-0 " +
    "rounded-full border-[2.5px] border-[#6C798A] bg-[#B1D2FA] " +
    "leading-none select-none transition-all duration-200 " +
    "hover:bg-[#c9ddff] focus:outline-none focus:ring-2 focus:ring-[#B1D2FA]/50 ";

  return (
    <header className="sticky z-10 bg-header border-[3px] rounded-[18px] border-[#5E5A6A] shadow-sm">
      <div className="relative w-full max-w-screen-2xl mx-auto px-1 py-1 flex items-center justify-center">

        {/* 중앙 로고 */}
        <button 
          onClick={handleLogoClick}
          className="flex justify-center items-center"
        >
          <AppTitle>
            <img
              src="/rogo2.png"
              alt="두근두근지구말"
              className="h-40 object-contain mx-auto pointer-events-none"
            />
          </AppTitle>
        </button>


        {/* 오른쪽 버튼들 */}
        <nav className="absolute font-[DungeonFighterOnlineBeatBeat] right-8 top-1/2 -translate-y-1/2 flex gap-3 z-10">
          {!isAuthenticated ? (
            <button
              onClick={handleLoginClick}
              className={`${pillBtn} flex items-center gap-2 text-center`}
            >
              <span className="btn-label-wrap">
                <span className="btn-label-outline" aria-hidden="true">
                  로그인
                </span>
                <span className="btn-label-fill">로그인</span>
              </span>
            </button>
          ) : (
            <>
              <Link
                to="/mypage"
                className="text-2xl text-stroke-2 font-[DungeonFighterOnlineBeatBeat] text-[#FFFFFF]
                inline-flex items-center justify-center gap-2
                w-[130.7px] h-[57.3px] shrink-0
                rounded-full border-[2.5px] border-[#6C798A] bg-[#B1D2FA]
                leading-none select-none
                transition-colors duration-150
                hover:bg-[#c9ddff]"
              >
                <span className="btn-label-wrap">
                  <span className="btn-label-outline" aria-hidden="true">
                    마이페이지
                  </span>
                  <span className="btn-label-fill">마이페이지</span>
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="text-2xl text-stroke-2 font-[DungeonFighterOnlineBeatBeat] text-[#FFFFFF]
                inline-flex items-center justify-center gap-2
                w-[130.7px] h-[57.3px] shrink-0
                rounded-full border-[2.5px] border-[#6C798A] bg-[#B1D2FA]
                leading-none select-none
                transition-colors duration-150
                hover:bg-[#c9ddff]"
              >
                <span className="btn-label-wrap">
                  <span className="btn-label-outline" aria-hidden="true">
                    로그아웃
                  </span>
                  <span className="btn-label-fill">로그아웃</span>
                </span>
              </button>
            </>
          )}
        </nav>
      </div>

      {showLoginModal && (
        <LoginModal 
          isOpen={showLoginModal}  
          onClose={() => setShowLoginModal(false)} 
        />
      )}

    </header>
  );
});

Header.displayName = 'Header';
export default Header;
