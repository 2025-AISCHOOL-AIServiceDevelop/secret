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

const STORY_SUMMARIES = {
  "흥부와 놀부": "착한 흥부는 복을 받고 욕심 많은 놀부는 벌을 받는 이야기",
  "황소자리는 윙크쟁이": "귀여운 황소가 용기와 매력을 인정받아 별자리가 된 이야기",
  "황새와 여우의 저녁초대": "서로에게 장난친 결과가 돌아오는 이야기",
  "황소를 부러워한 개구리": "욕심과 허세는 결국 큰 화를 부른다는 이야기",
  "황금 알을 낳는 거위": "욕심을 부리면 가진 것마저 잃는다는 교훈",
  "황금 털 양자리": "따뜻한 마음을 지닌 양이 하늘의 별자리가 된 이야기",
  "혹부리 할아버지": "착한 노인은 복을 받고 욕심 많은 이는 벌을 받는 이야기",
  "호랑이와 곶감": "무서운 호랑이도 오해 때문에 겁을 집어먹는 이야기",
  "해와 바람": "따뜻함이 힘보다 더 큰 변화를 만든다는 이야기",
  "행복한 왕자": "진정한 행복은 나눔과 희생에서 온다는 이야기",
  "현명한 여우와 늙은 사자": "여우가 사자의 함정을 눈치채고 지혜로 위기를 극복하는 이야기",
  "해님 달님": "남매가 지혜롭게 위험을 벗어나 해와 달이 되었다는 이야기",
  "학과 공작새": "화려함보다 진정한 아름다움은 겸손에서 나온다는 이야기",
  "피리 부는 늑대": "음악으로 마음을 움직이는 늑대의 이야기",
  "팥죽 할머니와 호랭이": "용감한 할머니와 동물들이 힘을 합쳐 호랑이를 물리치는 이야기",
  "토끼의 재판": "지혜로운 판단으로 억울함을 해결하는 이야기",
  "토끼와 자라": "기지를 발휘해 위기에서 탈출하는 토끼 이야기",
  "토끼와 거북이": "느려도 꾸준하면 승리할 수 있다는 교훈",
  "콩쥐 팥쥐": "착한 콩쥐는 복을 받고 못된 팥쥐는 벌을 받는 이야기",
  "커다란 순무": "힘을 합치면 무엇이든 해결할 수 있다는 내용",
  "청개구리": "말 안 듣던 청개구리가 결국 슬픔을 겪는 이야기",
  "장화 신은 고양이": "영리한 고양이가 주인을 성공으로 이끌어주는 이야기",
  "자린고비와 달랑곱재기": "지나친 인색함이 결국 자신에게 돌아오는 이야기",
  "의 좋은 형제": "서로 돕는 마음이 큰 복을 부르는 이야기",
  "은혜 갚은 호랑이": "도움을 받은 호랑이가 보답하는 이야기",
  "은혜 갚은 까치": "까치가 은혜를 갚아 위기를 구해주는 이야기",
  "은혜 갚은 생쥐": "작은 생쥐도 도움을 베풀어 큰 은혜를 갚는 이야기",
  "우리는 쌍둥이자리": "서로 의지하며 힘을 합쳐 별자리가 된 쌍둥이들의 이야기",
  "욕심 많은 개": "거울 속 자신의 모습을 먹이로 착각해 가진 것을 잃는 개 이야기",
  "요술 맷돌": "욕심 때문에 요술 맷돌을 잃어버리는 이야기",
  "젊어지는 샘물": "젊어지는 샘물을 욕심내다 벌을 받는 이야기",
  "여우와 신 포도": "얻지 못하는 것을 합리화하는 여우의 이야기",
  "엄마와 아기 물고기자리": "사랑 많은 모자가 별자리가 된 이야기",
  "양치기 소년": "거짓말은 결국 신뢰를 잃는다는 이야기",
  "얄미운 여우": "꾀를 부리다 벌을 받는 이야기",
  "알리바바와 40인의 도둑": "용기와 지혜로 위기를 해결하는 이야기",
  "알라딘의 램프": "요술램프 덕분에 소원이 이루어지는 모험 이야기",
  "아기 돼지 삼형제": "준비성이 중요하다는 교훈을 주는 이야기",
  "시골쥐와 서울쥐": "화려함보다 안전한 삶이 더 소중하다는 이야기",
  "소중한 유산": "성실함이 결국 복으로 돌아오는 이야기",
  "외톨이가 된 박쥐": "우유부단함은 결국 신뢰를 잃는다는 이야기",
  "소금 짐을 지고 가는 나귀": "장난은 결국 자신에게 돌아오는 이야기",
  "소가 된 게으름뱅이": "게으름은 오히려 고생을 부른다는 이야기",
  "선녀와 나무꾼": "사람과 선녀의 슬프지만 아름다운 이야기",
  "삼 년 고개": "약속을 어기면 벌을 받는다는 교훈 이야기",
  "사자 똥이 뿌직": "사자의 실수와 유머가 담긴 이야기",
  "빨간 부채 파란 부채": "착한 마음은 복을 받고 욕심은 벌을 부른다는 이야기",
  "봄의 여신 처녀자리": "순수한 마음을 지닌 여신이 별자리가 된 이야기",
  "별을 쏘는 사수자리": "용감한 전사가 하늘의 사수자리가 된 이야기",
  "벌거벗은 임금님": "아첨과 거짓이 결국 드러나는 이야기",
  "소녀와 우유통": "꿈만 꾸다 현실을 놓쳐버린 이야기",
  "물병자리 소년": "순수한 선행으로 별자리가 된 소년 이야기",
  "멸치의 꿈": "작은 존재도 큰 꿈을 가질 수 있다는 이야기",
  "며느리 방귀는 복방귀": "웃음과 지혜로 문제를 해결하는 이야기",
  "매미와 여우": "방심하면 위험에 닥친다는 교훈",
  "똥꼬로 나팔 부는 호랑이": "호랑이의 허세와 실수가 유머로 펼쳐지는 이야기",
  "도깨비 방망이": "착한 사람은 복을, 욕심 많은 사람은 벌을 받는 이야기",
  "도깨비 감투": "감투의 힘을 욕심내다 벌받는 이야기",
  "노새와 여우 늑대": "침착함으로 위기를 넘기는 이야기",
  "냄새 맡은 값": "재치로 억울함을 해결하는 이야기",
  "방귀 시합": "방귀로 웃음을 주는 엉뚱한 시합 이야기",
  "까마귀와 여우": "아첨에 속아 치즈를 잃은 까마귀 이야기",
  "금도끼 은도끼": "정직한 사람에게 복이 돌아온다는 이야기",
  "공주와 완두콩": "민감한 공주의 진짜 정체를 알아보는 이야기",
  "곰과 두 친구": "진짜 친구가 누구인지 위기에서 드러나는 이야기",
  "고양이 목에 방울달기": "말만 많은 회의의 무용함을 풍자한 이야기",
  "개와 고양이": "서로 사이가 나빠진 이유를 보여주는 이야기",
  "개미와 베짱이": "준비성의 중요성을 보여주는 이야기",
  "개구쟁이 염소자리": "장난꾸러기 염소가 별자리가 된 이야기",
  "갈대와 올리브 나무": "유연함이 진정한 강함임을 보여주는 이야기",
  "까마귀의 멋내기": "꾸민다고 본모습이 변하지 않는다는 이야기"
};


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

                  <p className="mt-1 text-sm text-gray-600 leading-snug">
                    {STORY_SUMMARIES[content.title] ?? "재미있는 전래동화를 통해 언어를 배워봐요!"}
                  </p>
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
