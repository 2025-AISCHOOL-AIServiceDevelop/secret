import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Loader2, AlertCircle, X } from 'lucide-react';
import { useContentsStore } from '../stores';
import { useAuthStore } from '../stores';
import earth from '../assets/earth.png';
import mascotImg from '../assets/mascot.png';
import saturn from '../assets/saturn.png';

// 모달들
import { LoginPromptModal } from '../@design-system/components/Modal';
import LoginModal from '../@design-system/components/LoginModal';

function Home() {
  const [searchInput, setSearchInput] = useState('');
  const [selectedAge, setSelectedAge] = useState('5-6세');
  const [showMascot, setShowMascot] = useState(true);

  // 검색 실행 여부
  const [isSearchExecuted, setIsSearchExecuted] = useState(false);

  // 랜덤 말풍선 문구 목록
  const bubbleMessages = [
    "전래동화를 다양한 언어로 배워보세요!",
    "오늘도 재미있는 동화 모험을 떠나볼까요?",
    "새로운 동화를 매일 만나보세요!",
    "듣고 따라하면서 언어 실력을 키워봐요!",
    "즐겁게 보고 배우는 다국어 동화 학습!",
    "오늘은 어떤 동화를 읽어볼까요?",
    "듣고 말하고 따라하며 실력이 UP!",
    "짧은 이야기로 집중력도 길러봐요!",
    "읽고 싶은 동화를 검색해보세요!",
    "다양한 언어를 전래동화를 통해 배워봐요!"
  ];

  // 선택된 말풍선 문구 상태
  const [bubbleText, setBubbleText] = useState("");


  // 추천 패널용 전체 데이터
  const [allContents, setAllContents] = useState([]);

  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const {
    contents,
    isLoading,
    error,
    searchContents,
    clearError,
    loadContents
  } = useContentsStore();

  // 배열 섞기 함수
  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  // 검색결과(좌측 리스트)
  const koreanContents = contents.filter((c) => c.language === 'ko');

  // 최초 1회만 랜덤 셔플된 목록
  const [shuffledKoreanContents, setShuffledKoreanContents] = useState([]);

  // 페이지 처음 들어왔을 때 1번만 셔플
  useEffect(() => {
  if (contents.length > 0) {
    const ko = contents.filter((c) => c.language === "ko");
    setShuffledKoreanContents(shuffleArray(ko));
  }
  }, [contents]);

  // 검색 중이면 검색 결과, 아니면 셔플된 목록 사용
  const listToShow = isSearchExecuted ? koreanContents : shuffledKoreanContents;


  // 추천 패널용 전체 데이터
  const koreanAllContents = allContents.filter((c) => c.language === 'ko');

  const ageOptions = ['5-6세', '7-8세', '9-10세', '11세 이상'];
  const indicatorIndex = ageOptions.indexOf(selectedAge);

  /** 초기 로딩 */
  useEffect(() => {
    loadContents();
  }, [loadContents]);

  // 말풍선 랜덤 문구 선택
  useEffect(() => {
    const randomMsg = bubbleMessages[Math.floor(Math.random() * bubbleMessages.length)];
    setBubbleText(randomMsg);
  }, []);


  /** 전체 콘텐츠 저장 */
  useEffect(() => {
    if (contents.length > 0 && allContents.length === 0) {
      setAllContents(contents);
    }
  }, [contents, allContents]);

  /** 검색창 비우면 전체 콘텐츠 복구 */
  useEffect(() => {
    if (!searchInput.trim()) {
      loadContents();
      setIsSearchExecuted(false);
      setShowMascot(true);
    }
  }, [searchInput, loadContents]);

  /** 스크롤 시 마스코트 제어 */
  useEffect(() => {
    const handleScroll = () => {
      if (isSearchExecuted) {
        setShowMascot(false);
        return;
      }

      const scrollY = window.scrollY;
      const documentHeight = document.body.scrollHeight;
      const screenHeight = window.innerHeight;

      setShowMascot(!(scrollY + screenHeight >= documentHeight - 150));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSearchExecuted]);

  /** 자동 나이대 슬라이드 */
  useEffect(() => {
    const order = ['5-6세', '7-8세', '9-10세', '11세 이상'];

    const interval = setInterval(() => {
      setSelectedAge((prev) => {
        const idx = order.indexOf(prev);
        return order[(idx + 1) % order.length];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  /** 검색 실행 */
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      searchContents(searchInput.trim());
      setIsSearchExecuted(true);
      setShowMascot(false);
    }
  };

  /** 추천 패널 필터링 */
  const getAgeFilteredContents = () => {
    const base = koreanAllContents;

    switch (selectedAge) {
      case '5-6세':
        return base.filter((c) => c.durationSec <= 130);  

      case '7-8세':
        return base.filter((c) => c.durationSec > 130 && c.durationSec <= 200);

      case '9-10세':
        return base.filter((c) => c.durationSec > 200 && c.durationSec <= 260);

      case '11세 이상':
        return base.filter((c) => c.durationSec > 260);

      default:
        return base;
    }
  };


  const filteredList = getAgeFilteredContents();
  const filtered =
  filteredList.length > 0
    ? [filteredList[Math.floor(Math.random() * filteredList.length)]]
    : [];

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

      {/* 콘텐츠 + 추천 */}
      <div
        className={`grid gap-4 ${
          koreanContents.length > 0
            ? 'grid-cols-1 lg:grid-cols-[1fr_380px]'
            : 'grid-cols-1' // 검색 결과 없으면 추천 패널 제거 → 1컬럼
        }`}
      >

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
            listToShow.map((content) => (
              <article
                key={content.contentsId}
                className="rounded-[20px] overflow-hidden bg-white/70 shadow transition-shadow"
              >
                <div
                  onClick={() => {
                    if (!isAuthenticated) setIsLoginPromptOpen(true);
                    else navigate(`/player?contentId=${content.contentsId}`);
                  }}
                  className="relative aspect-[16/9] rounded-xl cursor-pointer group overflow-hidden"
                >
                  {/* 확대되는 배경 이미지 */}
                  <div
                    className="
                      absolute inset-0 bg-cover bg-center 
                      transition-all duration-700 
                      group-hover:scale-[1.02]
                    "
                    style={{ backgroundImage: `url(${content.thumbUrl})` }}
                  />

                  {/* Hover 시 어두워지는 오버레이 + 재생 아이콘 */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center">
                      <svg fill="white" viewBox="0 0 24 24" className="w-8 h-8 ml-1">
                        <path d="M5 3l14 9-14 9V3z" />
                      </svg>
                    </div>
                  </div>

                  {/* 영상길이 */}
                  {content.durationSec && (
                    <span className="absolute bottom-3 right-3 bg-black/40 text-white text-sm px-3 py-1.5 rounded-md z-10">
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
            /* 검색 결과 없을 때 중앙정렬 */
            <div className="col-span-full flex flex-col items-center justify-center py-24">
              <img src={earth} alt="earth-empty" className="w-64 opacity-95 drop-shadow-lg" />

              <p className="mt-6 text-[#8C85A5] text-3xl font-[DungeonFighterOnlineBeatBeat] text-center">
                앗! 찾으시는 동화가 없어요!
              </p>
              <p className="text-xl text-[#8C85A5]/70 mt-2 text-center">
                다른 단어로 검색해보세요
              </p>
            </div>
          )}
        </section>

        {/* 추천 패널 — 검색 결과 있을 때만 표시 */}
        {koreanContents.length > 0 && (
          <aside>
              <div className="sticky top-[60px] grid gap-4 rounded-[22px] p-6 bg-white/30 backdrop-blur-sm shadow-xl">

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
                  className="relative aspect-[16/9] rounded-xl cursor-pointer group overflow-hidden"
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center">
                      <svg fill="white" viewBox="0 0 24 24" className="w-8 h-8 ml-1">
                        <path d="M5 3l14 9-14 9V3z" />
                      </svg>
                    </div>
                  </div>

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
                {ageOptions.map((age) => (
                  <button
                    key={age}
                    onClick={() => setSelectedAge(age)}
                    className={`
                      px-4 py-1 rounded-full text-xs border font-[DungeonFighterOnlineBeatBeat]
                      transition-all duration-200
                      ${
                        selectedAge === age
                          ? 'bg-[#8C85A5] text-white border-[#8C85A5]'
                          : 'bg-white/60 text-[#8C85A5] border-[#8C85A580] hover:bg-white/80'
                      }
                    `}


                  >
                    {age}
                  </button>
                ))}
              </div>

              {/* 인디케이터 */}
              <div className="flex justify-center items-center gap-2 mt-3 mb-1">
                {ageOptions.map((_, idx) => {
                  const isActive = idx === indicatorIndex;

                  return (
                    <div
                      key={idx}
                      className={`
                        transition-all duration-200 border
                        ${isActive 
                          ? 'w-6 h-3 rounded-full bg-[#8C85A5] border-[#8C85A5]'
                          : 'w-3 h-3 rounded-full bg-[#8C85A5]/20 border-[#8C85A5]'
                        }
                      `}
                    />
                  );
                })}
              </div>

            </div>

            {/* 마스코트 — 검색 결과 있을 때만 표시 */}
            {showMascot && (
              <div className="sticky top-[480px] mt-10 flex flex-col items-center space-y-3">
                <div className="relative bg-white rounded-2xl px-4 py-3 shadow-md text-sm w-[240px] text-gray-700">
                  {bubbleText}
                  <span className="absolute -bottom-2 left-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white"></span>
                </div>
                <img src={mascotImg} className="w-52 drop-shadow-lg" />
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Top 버튼 */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="
          fixed bottom-6 right-12 w-14 h-14 bg-white rounded-full shadow-lg
          border border-gray-300 flex items-center justify-center
          hover:shadow-xl hover:scale-105 active:scale-95 transition-all
        "
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M6 14 L12 8 L18 14" />
        </svg>
      </button>

      {/* 모달들 */}
      <LoginPromptModal
        isOpen={isLoginPromptOpen}
        onClose={() => setIsLoginPromptOpen(false)}
        onConfirm={() => {
          setIsLoginPromptOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}

export default Home;
