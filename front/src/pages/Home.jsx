import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Loader2, AlertCircle, X } from 'lucide-react';
import { useContentsStore } from '../stores';
import { useAuthStore } from '../stores';

import mascotImg from '../assets/mascot.png';
import saturn from '../assets/saturn.png';

// 모달들
import { LoginPromptModal } from '../@design-system/components/Modal';
import LoginModal from '../@design-system/components/LoginModal';

function Home() {
  const [searchInput, setSearchInput] = useState('');
  const [selectedAge, setSelectedAge] = useState('2-4세');
  const [showMascot, setShowMascot] = useState(true);

  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { contents, isLoading, error, searchContents, clearError, loadContents } =
    useContentsStore();

  const koreanContents = contents.filter((content) => content.language === 'ko');

  // 연령 옵션 배열
  const ageOptions = ['2-4세', '4-6세', '7-9세', '10세이상'];
  const indicatorIndex = ageOptions.indexOf(selectedAge);

  /** 초기 로딩 */
  useEffect(() => {
    loadContents();
  }, [loadContents]);

  /** 검색 비우면 전체 목록 로딩 */
  useEffect(() => {
    if (!searchInput.trim()) {
      loadContents();
    }
  }, [searchInput, loadContents]);

  /** 스크롤 시 마스코트 제어 */
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const documentHeight = document.body.scrollHeight;
      const screenHeight = window.innerHeight;

      setShowMascot(!(scrollY + screenHeight >= documentHeight - 150));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 🔵 자동 슬라이드 (3초마다 다음 나이대로 이동)
  useEffect(() => {
    const ageOrder = ['2-4세', '4-6세', '7-9세', '10세이상'];

    const interval = setInterval(() => {
      setSelectedAge((prev) => {
        const currentIndex = ageOrder.indexOf(prev);
        const nextIndex = (currentIndex + 1) % ageOrder.length;
        return ageOrder[nextIndex];
      });
    }, 3000); // 3초마다 자동 변경

    return () => clearInterval(interval);
  }, []);


  /** 검색 기능 */
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) searchContents(searchInput.trim());
  };

  /** 연령 필터링 */
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

      {/* 헤더 */}
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
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#e7efff] text-gray-600 w-20 h-10 rounded-full border border-[#b9c7e5] flex items-center justify-center gap-1 hover:shadow-md hover:scale-105 active:scale-95 transition-all"
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

      {/* 콘텐츠 + 추천 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">

        {/* 콘텐츠 목록 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3">

          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <article
                key={i}
                className="rounded-[18px] overflow-hidden border-2 border-[#d7c6c6] animate-pulse"
              >
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
                    if (!isAuthenticated) setIsLoginPromptOpen(true);
                    else navigate(`/player?contentId=${content.contentsId}`);
                  }}
                  className="relative aspect-[16/9] bg-cover bg-center rounded-xl cursor-pointer group"
                  style={{ backgroundImage: `url(${content.thumbUrl})` }}
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center">
                      <svg fill="white" viewBox="0 0 24 24" className="w-8 h-8 ml-1">
                        <path d="M5 3l14 9-14 9V3z" />
                      </svg>
                    </div>
                  </div>

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

        {/* 오른쪽 사이드바 */}
        <aside>
          <div className="sticky top-[90px] grid gap-4 rounded-[22px] p-6 border-2 border-[#a9b9d3]">

            {/* 제목 */}
            <div className="text-2xl font-[DungeonFighterOnlineBeatBeat] text-[#8C85A5] text-center">
              나이별 추천동화
            </div>

            {/* 추천 썸네일 */}
            {filtered.length > 0 ? (
              <div
                key={filtered[0].contentsId} 
                onClick={() => {
                  if (!isAuthenticated) setIsLoginPromptOpen(true);
                  else navigate(`/player?contentId=${filtered[0].contentsId}`);
                }}
                className="relative aspect-[16/9] rounded-xl cursor-pointer group overflow-hidden border border-[#8C85A5]"
              >

                {/* Hover 오버레이 */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center">
                    <svg fill="white" viewBox="0 0 24 24" className="w-8 h-8 ml-1">
                      <path d="M5 3l14 9-14 9V3z" />
                    </svg>
                  </div>
                </div>

                {/* ✨ 페이드 효과 추가된 썸네일 */}
                <div
                  className="
                    absolute inset-0 bg-cover bg-center 
                    transition-all duration-700 
                    opacity-100 group-hover:scale-[1.02]
                  "
                  style={{ backgroundImage: `url(${filtered[0].thumbUrl})` }}
                />
              </div>
            ) : (
              <div className="text-sm text-[#8C85A5] text-center font-[DungeonFighterOnlineBeatBeat]">
                해당 나이대 추천 영상이 없어요.
              </div>
            )}

            {/* 나이 버튼 */}
            <div className="flex gap-2 justify-between mt-2">
              {ageOptions.map((age, idx) => (
                <button
                  key={age}
                  onClick={() => setSelectedAge(age)}
                  className={`
                    px-4 py-1 rounded-full text-xs border-2 font-[DungeonFighterOnlineBeatBeat]
                    transition-all duration-200
                    ${
                      selectedAge === age
                        ? 'bg-[#8C85A5] text-white border-[#8C85A5]'
                        : 'bg-white text-[#8C85A5] border-[#a9b9d3] hover:bg-[#f1f4ff]'
                    }
                  `}
                >
                  {age}
                </button>
              ))}
            </div>

            {/* 인디케이터 - 버튼과 연동 */}
            <div className="flex justify-center items-center gap-2 mt-3 mb-1">
              {ageOptions.map((_, idx) => {
                const isActive = idx === indicatorIndex;

                return (
                  <div
                    key={idx}
                    className={`
                      transition-all duration-200 border
                      ${
                        isActive
                          ? 'w-6 h-3 rounded-full bg-[#8C85A5] border-[#8C85A5]'
                          : 'w-3 h-3 rounded-full bg-[#d0d9ea] border-[#a9b9d3]'
                      }
                    `}
                  />
                );
              })}
            </div>
          </div>

          {/* 마스코트 */}
          {showMascot && (
            <div className="sticky top-[480px] mt-16 flex flex-col items-center space-y-3">
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
        className="
          fixed bottom-6 right-6 w-14 h-14 bg-white rounded-full shadow-lg
          border border-gray-300 flex items-center justify-center
          hover:shadow-xl hover:scale-105 active:scale-95 transition-all
        "
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M6 14 L12 8 L18 14" />
        </svg>
      </button>

      {/* 로그인 모달 */}
      <LoginPromptModal
        isOpen={isLoginPromptOpen}
        onClose={() => setIsLoginPromptOpen(false)}
        onConfirm={() => {
          setIsLoginPromptOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}

export default Home;
