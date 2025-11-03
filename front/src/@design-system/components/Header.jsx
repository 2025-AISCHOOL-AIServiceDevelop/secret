import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppTitle } from './Typography';
import { useAuthStore } from '../../stores';

// Header component
export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-10 bg-header border-b-2 border-headerBorder">
      <div className="w-full max-w-screen-2xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link to="/">
          <AppTitle>두근두근 지구말</AppTitle>
        </Link>
        <nav className="flex gap-2 items-center">
          {isAuthenticated ? (
            <>
              <span className="text-[#394b69] font-medium mr-2">
                안녕하세요, {user?.name || user?.userName || '사용자'}님
              </span>
              <Link
                className={`no-underline font-bold rounded-full px-4 py-2 border-2 border-[#a89a77] ${
                  location.pathname === '/mypage' ? 'bg-white' : 'bg-white/70'
                } text-[#394b69]`}
                to="/mypage"
              >
                마이페이지
              </Link>
              <button
                onClick={handleLogout}
                className="no-underline font-bold rounded-full px-4 py-2 border-2 border-[#a89a77] bg-white/70 text-[#394b69] hover:bg-white transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              className={`no-underline font-bold rounded-full px-4 py-2 border-2 border-[#a89a77] ${
                location.pathname === '/login' ? 'bg-white' : 'bg-white/70'
              } text-[#394b69]`}
              to="/login"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
