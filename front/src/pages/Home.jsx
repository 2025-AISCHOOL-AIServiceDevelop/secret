import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Loader2, AlertCircle, X } from 'lucide-react';
import { useContentsStore } from '../stores';
import { useAuthStore } from '../stores';
import mascotImg from '../assets/mascot.png';
import saturn from '../assets/saturn.png';

// 모달들
import { LoginPromptModal } from '../@design-system/components/Modal';

// ⭐ LoginModal 추가
import kakaoLogo from '../assets/kakao.png';
import googleLogo from '../assets/google.png';
import { API_BASE_URL } from '../services/api';

function LoginModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleLogin = (provider) => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/${provider}`;
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center">
      <div className="bg-white w-[900px] max-w-[90%] min-h-[560px] rounded-2xl shadow-2xl flex overflow-hidden relative">

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center text-[18px] hover:bg-black/80 transition"
        >
          ✕
        </button>

        {/* LEFT */}
        <div className="w-[45%] bg-[#e1ecff] grid place-items-center p-8">
          <div
            className="w-[240px] h-[240px] rounded-full shadow-md"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #ffffff, #b7c6ea 60%, #9ab0e0)',
            }}
          />
        </div>

        {/* RIGHT */}
        <div className="flex-1 p-12 flex flex-col justify-center">
          <h2 className="text-[26px] font-extrabold mb-4">간편 로그인 또는 회원가입</h2>
          <p className="text-gray-600 mb-8">두근두근 지구말을 계속 이용하세요!</p>

          <button onClick={() => handleLogin('kakao')} className="w-full mb-4">
            <img src={kakaoLogo} className="w-full h-auto rounded-xl hover:scale-105 transition-transform" />
          </button>

          <button onClick={() => handleLogin('google')} className="w-full mb-4">
            <img src={googleLogo} className="w-full h-auto rounded-xl hover:scale-105 transition-transform" />
          </button>

          <p className="text-xs text-gray-500 mt-4 leading-relaxed">
            로그인 시 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}



function Home() {
  const [searchInput, setSearchInput] = useState('');
  const [selectedAge, setSelectedAge] = useState(null);
  const [showMascot, setShowMascot] = useState(true);

  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false); // 로그인 필요 모달
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);   // 카카오/구글 로그인 모달

  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const {
    contents,
    isLoading,
    error,
    searchContents,
    clearError,
    loadContents,
  } = useContentsStore();

  const koreanContents = contents.filter((content) => content.language === 'ko');

  useEffect(() => {
    loadContents();
  }, [loadContents]);

  useEffect(() => {
    if (!searchInput.trim()) {
      loadContents();
    }
  }, [searchInput, loadContents]);

  // 스크롤 시 마스코트 제어
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const documentHeight = document.body.scrollHeight;
      const screenHeight = window.innerHeight;

      if (scrollY + screenHeight >= documentHeight - 150) {
        setShowMascot(false);
      } else {
        setShowMascot(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 검색
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) searchContents(searchInput.trim());
  };

  // 연령 필터링
  const getAgeFilteredContents = () => {
    if (!selectedAge) return contents;
    switch (selectedAge) {
      case '2-4세':
        return contents.filter((c) => c.durationSec <= 130);
      case '4-6세':
        return contents.filter((c) => c.durationSec > 130 && c.durationSec <= 150);
      case '7-9세':
        return contents.filter((c) => c.durationSec > 150 && c.durationSec <= 200);
      case '10세이상':
        return contents.filter((c) => c.durationSec > 240);
      default:
        return contents;
    }
  };

  const filtered = getAgeFilteredContents();



  return (
    <div className="container mx-auto">

      {/* 헤더 타이틀 */}
      <div className="relative mb-8 pt-7 text-center">
        <img
          src={saturn}
          alt="토성 아이콘"
          className="absolute left-1/2 -translate-x-1/2 -top-[0.5px] max-w-[34px]"
        />
        <h3 className="text-4xl font-[DungeonFighterOnlineBeatBeat] text-[#8C85A5] mb-2">
          전래동화 시리즈
        </h3>
      </div>

      {/* 검색창 */}
      <div className="flex justify-center mt-3 mb-5">
        <form onSubmit={handleSearch} className="w-[min(720px,90%)] relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-white border-2 border-[#a9b9d3] rounded-full px-4 py-3 pr-12"
            placeholder="동화를 검색해보세요"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#e7efff] text-gray-600 w-20 h-10 rounded-full border border-[#b9c7e5] flex items-center justify-center gap-1   /* ⭐ 아이콘 + 텍스트 한 줄 정렬 */
                        hover:shadow-md hover:scale-105
                        active:scale-95 transition-all
                      "
          >
            {isLoading ? (
              <Loader2 className="w-[14px] h-[14px] animate-spin" />
            ) : (
              <Search className="w-[14px] h-[14px]" />
            )}
            검색
          </button>
        </form>
      </div>

      {/* 에러 */}
      {error && (
        <div className="text-center mb-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button onClick={clearError} className="ml-2 hover:bg-red-200 p-1 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 본문 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">

        {/* 콘텐츠 목록 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <article key={i} className="rounded-[18px] overflow-hidden border-2 border-[#d7c6c6] animate-pulse">
                <div className="h-[180px] bg-gray-200" />
                <div className="px-3 py-3 bg-[#f1f6ff]">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </article>
            ))
          ) : koreanContents.length > 0 ? (
            koreanContents.map((content) => (
              <article
                key={content.contentsId}
                className="rounded-[20px] overflow-hidden bg-white/70 shadow transition-shadow"
              >
                <div
                  onClick={() => {
                    if (!isAuthenticated) {
                      setIsLoginPromptOpen(true);
                    } else {
                      navigate(`/player?contentId=${content.contentsId}`);
                    }
                  }}
                  className="relative aspect-[16/9] bg-cover bg-center rounded-xl cursor-pointer group"
                  style={{ backgroundImage: `url(${content.thumbUrl})` }}
                >
                  {/* Hover Play */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center">
                      <svg fill="white" viewBox="0 0 24 24" className="w-8 h-8 ml-1">
                        <path d="M5 3l14 9-14 9V3z" />
                      </svg>
                    </div>
                  </div>

                  {/* length */}
                  {content.durationSec && (
                    <span className="absolute bottom-3 right-3 bg-black/40 text-white text-sm px-3 py-1.5 rounded-md">
                      {Math.floor(content.durationSec / 60)}:
                      {String(content.durationSec % 60).padStart(2, '0')}
                    </span>
                  )}
                </div>

                <div className="px-3 py-3 bg-[#f1f6ff]">
                  <h3 className="font-black text-lg">{content.title}</h3>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              표시할 콘텐츠가 없습니다.
            </div>
          )}
        </section>

        {/* 오른쪽 추천 + 마스코트 */}
        <aside>
          <div className="sticky top-[90px] grid gap-3 rounded-[22px] p-6 border-2">
            <div className="font-extrabold text-lg text-[#35446b]">나이별 추천동화</div>

            {filtered.length > 0 ? (
              <div
                onClick={() => {
                  if (!isAuthenticated) setIsLoginPromptOpen(true);
                  else navigate(`/player?contentId=${filtered[0].contentsId}`);
                }}
                className="relative h-[190px] rounded-[18px] border-2 bg-white cursor-pointer group overflow-hidden"
              >
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="w-full h-full bg-cover bg-center opacity-70" style={{ backgroundImage: `url(${filtered[0].thumbUrl})` }} />

                <div className="p-2 bg-white bg-opacity-90">
                  <div className="font-bold text-xs text-[#5a6ea0] truncate">
                    {filtered[0].title}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-500 text-center">해당 나이대 추천 영상이 없어요.</div>
            )}

            {/* Age buttons */}
            <div className="flex gap-2 justify-between">
              {['2-4세', '4-6세', '7-9세', '10세이상'].map((age) => (
                <button
                  key={age}
                  onClick={() => setSelectedAge(age)}
                  className={`px-4 py-1 rounded-full text-xs border-2 ${
                    selectedAge === age
                      ? 'bg-[#5a6ea0] text-white border-[#5a6ea0]'
                      : 'bg-white text-[#5a6ea0] border-[#a9b9d3] hover:bg-[#dfe7ff]'
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          {showMascot && (
            <div className="sticky top-[480px] mt-10 flex flex-col items-center space-y-3">
              <div className="relative bg-white rounded-2xl px-4 py-3 shadow-md text-sm w-[240px] text-gray-700">
                전래동화를 다양한 언어로 배워보세요!
                <span className="absolute -bottom-2 left-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white"></span>
              </div>
              <img src={mascotImg} className="w-52 drop-shadow-lg" />
            </div>
          )}
        </aside>
      </div>

      {/* Top 버튼 */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 w-16 h-16 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center"
      >
        ↑
      </button>

      {/* 로그인 필요 모달 */}
      <LoginPromptModal
        isOpen={isLoginPromptOpen}
        onClose={() => setIsLoginPromptOpen(false)}
        onConfirm={() => {
          setIsLoginPromptOpen(false);
          setIsLoginModalOpen(true); // ⭐ 여기서 실제 로그인모달 열림
        }}
      />

      {/* 실제 로그인 모달 */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

    </div>
  );
}

export default Home;
