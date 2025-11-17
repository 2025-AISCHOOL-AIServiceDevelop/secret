import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2, AlertCircle, X } from 'lucide-react';
import { useContentsStore } from '../stores';
import mascotImg from '../assets/mascot.png';
import saturn from '../assets/saturn.png';

function Home() {
  const [searchInput, setSearchInput] = useState('');
  const [selectedAge, setSelectedAge] = useState(null);

  // 마스코트 표시 여부
  const [showMascot, setShowMascot] = useState(true);

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

  // 스크롤 위치 감지해서 마스코트 자동 숨김 처리
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const documentHeight = document.body.scrollHeight;
      const screenHeight = window.innerHeight;

      // footer 근처 도달하면 hide
      if (scrollY + screenHeight >= documentHeight - 150) {
        setShowMascot(false);
      } else {
        setShowMascot(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) searchContents(searchInput.trim());
  };

  const getAgeFilteredContents = () => {
    if (!selectedAge) return contents;

    switch (selectedAge) {
      case '2-4세':
        return contents.filter((c) => c.durationSec <= 130);
      case '4-5세':
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
          aria-hidden="true"
          className="absolute left-1/2 -translate-x-1/2 -top-[0.5px] h-auto max-w-[34px] drop-shadow"
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
            className="w-full bg-white border-2 border-[#a9b9d3] rounded-full px-4 py-3 text-sm pr-12"
            placeholder="동화를 검색해보세요"
          />

          {/* 검색 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="
              absolute right-2 top-1/2 -translate-y-1/2
              bg-[#e7efff]
              text-gray-600 
              px-3 py-1.5
              rounded-full text-[13px]
              font-semibold
              border border-[#b9c7e5]
              hover:shadow-md hover:scale-105 active:scale-95
              transition-all flex items-center gap-1.5
            "
          >
            {isLoading ? (
              <Loader2 className="w-[14px] h-[14px] animate-spin text-gray-600" />
            ) : (
              <Search className="w-[14px] h-[14px] text-gray-600" />
            )}
            검색
          </button>
        </form>
      </div>

      {/* 에러 메시지 */}
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

      {/* 메인 콘텐츠 + 오른쪽 사이드 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">

        {/* 왼쪽 콘텐츠 목록 */}
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
                className="
                  rounded-[20px]
                  overflow-hidden
                  bg-white/70
                  shadow-[0_4px_12px_rgba(0,0,0,0.12)]
                  hover:shadow-[0_8px_20px_rgba(0,0,0,0.18)]
                  transition-shadow
                  duration-300
                "
              >

                <Link to={`/player?contentId=${content.contentsId}`}>
                  <div
                    className="
                      relative h-[300px] bg-cover bg-center rounded-xl cursor-pointer
                      transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:brightness-105 group
                    "
                    style={{ backgroundImage: `url(${content.thumbUrl})` }}
                  >

                    {/* Hover Play */}
                    <div
                      className="
                        absolute inset-0 flex items-center justify-center
                        bg-black/20 opacity-0 group-hover:opacity-100
                        transition-opacity duration-300
                      "
                    >
                      <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <svg fill="white" viewBox="0 0 24 24" className="w-8 h-8 ml-1">
                          <path d="M5 3l14 9-14 9V3z" />
                        </svg>
                      </div>
                    </div>

                    {/* 길이 표기 */}
                    {content.durationSec && (
                      <span
                        className="
                          absolute bottom-3 right-3 bg-black/40 text-white text-sm font-semibold
                          px-3 py-1.5 rounded-md backdrop-blur-sm
                        "
                      >
                        {Math.floor(content.durationSec / 60)}:
                        {String(content.durationSec % 60).padStart(2, '0')}
                      </span>
                    )}
                  </div>
                </Link>

                <div className="px-3 py-3 bg-[#f1f6ff]">
                  <h3 className="font-black text-lg tracking-tight drop-shadow-sm">
                    {content.title}
                  </h3>
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
          {/* 추천 박스 */}
          <div
            className="sticky top-[90px] grid gap-3 rounded-[22px] p-6 border-2"
            style={{ background: '#e6eefc', borderColor: '#a9b9d3' }}
          >
            <div className="font-extrabold text-lg text-[#35446b]">나이별 추천동화</div>

            {filtered.length > 0 ? (
              <Link to={`/player?contentId=${filtered[0].contentsId}`}>
                <div
                  className="
                    relative h-[190px] rounded-[18px] border-2 bg-white overflow-hidden
                    cursor-pointer hover:brightness-105 transition group
                  "
                  style={{ borderColor: '#c9d6f2' }}
                >
                  <div
                    className="
                      absolute inset-0 flex items-center justify-center
                      bg-black/20 opacity-0 group-hover:opacity-100
                      transition-opacity duration-300
                      z-10
                    "
                  >
                    <div className="w-14 h-14 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <svg fill="white" viewBox="0 0 24 24" className="w-7 h-7 ml-1">
                        <path d="M5 3l14 9-14 9V3z" />
                      </svg>
                    </div>
                  </div>

                  <div
                    className="w-full h-full bg-cover bg-center opacity-70"
                    style={{ backgroundImage: `url(${filtered[0].thumbUrl})` }}
                  />

                  <div className="p-2 bg-white bg-opacity-90">
                    <div className="font-bold text-xs text-[#5a6ea0] truncate">
                      {filtered[0].title}
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="text-xs text-gray-500 text-center">
                해당 나이대 추천 영상이 없어요.
              </div>
            )}

            {/* 나이 버튼 */}
            <div className="flex gap-2 flex-nowrap justify-between">
              {['2-4세', '4-6세', '7-9세', '10세이상'].map((age) => (
                <button
                  key={age}
                  onClick={() => setSelectedAge(age)}
                  className={`
                    px-4 py-1 rounded-full text-xs border-2 whitespace-nowrap min-w-[65px]
                    transition-all
                    ${
                      selectedAge === age
                        ? 'bg-[#5a6ea0] text-white border-[#5a6ea0]'
                        : 'bg-white text-[#5a6ea0] border-[#a9b9d3] hover:bg-[#dfe7ff]'
                    }
                  `}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          {/* 마스코트 — 조건부 렌더링으로 footer 겹침 제거 */}
          {showMascot && (
            <div
              className="
                sticky top-[480px]
                mt-10 
                flex flex-col items-center 
                space-y-3
                animate-fadeInSlow
                z-10
              "
            >
              {/* 말풍선 */}
              <div className="relative bg-white rounded-2xl px-4 py-3 shadow-md text-sm text-gray-700 border border-[#d3dff7] w-[240px]">
                전래동화를 다양한 언어로 배워보세요!
                <span className="absolute -bottom-2 left-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white"></span>
              </div>

              {/* 마스코트 이미지 */}
              <img src={mascotImg} alt="Mascot" className="w-52 drop-shadow-lg animate-bounce-slow" />
            </div>
          )}
        </aside>
      </div>

      {/* TOP 버튼 */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="
          fixed bottom-6 right-6
          w-16 h-16 flex items-center justify-center
          bg-white rounded-full shadow-lg border border-gray-200
          hover:shadow-xl hover:scale-105 active:scale-95
          transition-all
          z-50
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
          stroke="#6b7280"
          fill="none"
          className="w-7 h-7"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}

export default Home;
