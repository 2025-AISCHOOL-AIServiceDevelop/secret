import { useMemo } from "react";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useTutorStore, useContentsStore } from '../stores';
import saturn from '../assets/saturn.png';
import userIcon from "../assets/user-icon.png";
import level1 from "../assets/level1.png";
import level2 from "../assets/level2.png";
import level3 from "../assets/level3.png";
import continueReading from "../assets/continue-reading.png";
import { API_BASE_URL } from '../services/api';
import studyCompletedImg from "../assets/study-completed.png";





function Mypage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getUserFeedbackHistory } = useTutorStore();
  const { getContentById } = useContentsStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  //랜덤 100가지 응원메시지
  const praiseMessages = [
      "오늘도 반짝! 너의 시간이 정말 특별해!",
      "조금 느려도 괜찮아, 넌 잘하고 있어!",
      "우와~ 너 정말 멋진 아이야!",
      "틀려도 괜찮아, 우리는 배우는 중이야!",
      "너의 노력은 별처럼 반짝여!",
      "하이파이브! 오늘도 힘차게 출발~",
      "쉬었다가 다시 하면 더 잘할 수 있어!",
      "와아~ 오늘의 너, 정말 대단해!",
      "너의 배움이 지구를 더 빛나게 해!",
      "작은 한 걸음도 큰 용기야!",
      "네가 있어서 하루가 더 즐거워졌어!",
      "오늘도 너답게 멋지게 해보자!",
      "너의 웃음이 모두를 행복하게 해!",
      "실수는 괜찮아, 다시 하면 돼!",
      "넌 언제나 반짝이는 아이야!",
      "천천히 해도 충분히 잘하고 있어!",
      "오늘도 한 걸음 앞으로~",
      "너의 마음 정말 예쁘다!",
      "용감하게 시작한 너를 응원해!",
      "넌 할 수 있어! 내가 응원할게!",
      "너의 생각은 정말 멋져!",
      "오늘도 최고였어, 정말 대단해!",
      "궁금한 건 뭐든 물어봐도 돼!",
      "네가 해낸 건 정말 특별해!",
      "오늘도 씩씩하게 도전해보자!",
      "너의 용기가 아주 멋져 보여!",
      "와~ 이렇게 잘해줘서 고마워!",
      "실패해도 괜찮아, 다시 하면 돼!",
      "네가 좋아하는 걸 찾아보자!",
      "넌 언제나 소중한 존재야!",
      "작은 변화가 큰 기적을 만든다!",
      "너의 성장 속도는 너만의 것이야!",
      "오늘도 웃는 얼굴 너무 예쁘다!",
      "어렵지만 포기하지 않아 멋져!",
      "넌 이미 훌륭하게 해내고 있어!",
      "조금씩 천천히, 그게 가장 멋진 길이야!",
      "네가 좋아하는 마음을 따라가봐!",
      "넌 언제나 특별하고 대단해!",
      "배워가는 모습이 정말 자랑스러워!",
      "매일 조금씩 더 멋져지는 중이야!",
      "너의 아이디어는 정말 반짝여!",
      "오늘도 새로운 모험을 떠나보자!",
      "네가 노력한 만큼 더 빛나고 있어!",
      "조용히 집중하는 모습이 너무 좋아!",
      "넌 이미 충분히 잘하고 있어!",
      "우와~ 이만큼 성장했어!",
      "네가 웃으면 세상이 환해져!",
      "실패해도 용감했던 게 더 멋져!",
      "너의 마음은 언제나 소중해!",
      "오늘도 용기 내서 와줘서 고마워!",
      "너무 잘하고 있어, 계속 해보자!",
      "네가 있으면 더 즐거운 하루야!",
      "차근차근 하면 뭐든 할 수 있어!",
      "네 생각을 말해줘서 고마워!",
      "오늘도 새로운 걸 배웠구나! 멋져!",
      "넌 언제나 나의 작은 영웅이야!",
      "매일 노력하는 네 모습이 반짝여!",
      "하나씩 배우는 게 가장 멋진 거야!",
      "네 감정도 모두 소중해!",
      "너는 너라서 더 멋져!",
      "와~ 스스로 해냈구나! 대단해!",
      "결국 해낸 너, 정말 자랑스러워!",
      "쉬어도 괜찮아, 다시 시작하면 돼!",
      "오늘의 넌 어제보다 더 멋져!",
      "도전하는 모습이 정말 용감해!",
      "실수는 배움의 열쇠야!",
      "네 손으로 만든 건 다 특별해!",
      "천천히 해도 괜찮아, 넌 잘하고 있어!",
      "네가 보여준 용기 정말 대단해!",
      "너의 목소리는 언제나 소중해!",
      "오늘도 새로운 걸 해보자!",
      "네가 노력한 건 절대 사라지지 않아!",
      "너의 웃음은 선물 같아!",
      "마음을 표현해줘서 고마워!",
      "더 해보고 싶다면 함께 해보자!",
      "오늘도 빛나는 하루를 만들자!",
      "네가 좋아하는 것도 특별해!",
      "너의 선택을 응원해!",
      "우와~ 너 정말 놀라운 아이야!",
      "네가 만든 세계는 아름다워!",
      "혼자서 해낸 건 정말 대단한 일이야!",
      "오늘도 용기 내줘서 고마워!",
      "너의 마음 한 스푼, 정말 예뻐!",
      "작은 실천이 큰 변화를 만든다!",
      "너의 배움은 오늘도 자라고 있어!",
      "뭐든 조금씩 하면 더 즐거워져!",
      "오늘의 너, 정말 최고였어!",
      "네가 포기하지 않아 너무 멋져!",
      "실수해도 괜찮아, 넌 충분히 소중해!",
      "함께라서 더 즐거운 하루야!",
      "너의 상상은 하늘만큼 넓어!",
      "오늘도 멋진 이야기를 만들자!",
      "너의 노력은 항상 빛이 나!",
      "마음이 흔들려도 괜찮아, 다시 하면 돼!",
      "네가 해낸 모든 걸 응원해!",
      "오늘의 너를 꼭 안아주고 싶어!",
      "언제나 넌 특별하고 멋진 친구야!",
      "도전하는 마음이 정말 위대해!",
      "너의 작은 용기가 세상을 바꿔!",
      "오늘도 반짝이는 너를 응원해!"

    ];

  const randomPraise = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * praiseMessages.length);
    return praiseMessages[randomIndex];
  }, [praiseMessages]);

  




  // Get user feedback history🌱🌱이부분은 밑에 지운다음에 다시 살리면 됨!  🌱🌱2번!!
  const userFeedbackHistory = user ? getUserFeedbackHistory(user.id || 1) : [];


  ///🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱이부분 나중에 지워야함 임시로 넣어둔것  🌱1번!!
  // 1) 실제 기록 불러오기
// const realHistory = user ? getUserFeedbackHistory(user.id || 1) : [];

// // 2) UI 미리보기용 더미 데이터 (원하는 내용으로 바꿔도 됨)
// const mockHistory = [
//   {
//     id: 1,
//     contentsId: 3,
//     contentsTitle: '콩쥐 팥쥐',
//     score: 85,
//     lang: 'ko',
//     accuracy: 92,
//     targetSentence: '학습한 동화의 예시 문장입니다.',
//     createdAt: new Date().toISOString(),
//   },
// ];

// // 3) 실제 기록이 있으면 그걸 쓰고, 없으면 mockHistory 사용
// const userFeedbackHistory =
//   realHistory.length > 0 ? realHistory : mockHistory;
///🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱이부분 나중에 지워야함 임시로 넣어둔것
  


const uniqueFeedbackHistory = useMemo(() => {
  if (!userFeedbackHistory || userFeedbackHistory.length === 0) return [];

  const byContent = new Map();

  userFeedbackHistory.forEach((fb) => {
    if (!fb.contentsId) return;

    const key = fb.contentsId;
    const prev = byContent.get(key);

    // 이전 기록이 없으면 넣기
    if (!prev) {
      byContent.set(key, fb);
      return;
    }

    // 있으면 createdAt 비교해서 더 최신 것만 남기기
    const prevTime = new Date(prev.createdAt || 0).getTime();
    const curTime = new Date(fb.createdAt || 0).getTime();
    if (curTime > prevTime) {
      byContent.set(key, fb);
    }
  });

  return Array.from(byContent.values());
}, [userFeedbackHistory]);





  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

    // 통계 값 계산
  const totalPractice = userFeedbackHistory.length;
  const avgScore =
    totalPractice > 0
      ? Math.round(
          userFeedbackHistory.reduce((sum, fb) => sum + (fb.score || 0), 0) /
            totalPractice
        )
      : 0;
  const languageCount = new Set(
    userFeedbackHistory.map((fb) => fb.lang).filter(Boolean)
  ).size;


  const goToPlayer = (contentsId) => {
  if (!contentsId) return;
  navigate(`/player?contentId=${contentsId}`);
};

  

// 시청 정보 헬퍼 함수 정리

const getWatchMeta = (contentsId) => {
  if (!user || !contentsId) return { watchedSeconds: 0, totalSeconds: 0 };

  const storageKey = `watch_${user.id}_${contentsId}`;
  const saved = localStorage.getItem(storageKey);
  if (!saved) return { watchedSeconds: 0, totalSeconds: 0 };

  try {
    const { watchedSeconds = 0, totalSeconds = 0 } = JSON.parse(saved) || {};
    return { watchedSeconds, totalSeconds };
  } catch (e) {
    console.error('watch meta parse error', e);
    return { watchedSeconds: 0, totalSeconds: 0 };
  }
};

const getWatchProgress = (contentsId) => {
  const { watchedSeconds, totalSeconds } = getWatchMeta(contentsId);
  if (!totalSeconds || totalSeconds <= 0) return 0;

  const ratio = (watchedSeconds / totalSeconds) * 100;
  return Math.min(100, Math.round(ratio)); // 0~100%
};


const isStudyCompleted = (contentsId) => {
  const { watchedSeconds, totalSeconds } = getWatchMeta(contentsId);

  if (!totalSeconds || totalSeconds <= 0) return false;

  // 끝나기 10초 전까지 봤으면 완료로 처리
  return watchedSeconds >= Math.max(0, totalSeconds - 10);
};




  return (
    <div className="container mx-auto max-w-6xl">
      
      <div className="mb-8">
        <div className="relative mb-8 pt-7 text-center">
          <img src={saturn} alt="토성 아이콘" aria-hidden="true"
            className="absolute left-1/2 -translate-x-1/2 -top-[0.5px] h-auto max-w-[34px] drop-shadow"/>
          <h1 className="text-4xl font-[DungeonFighterOnlineBeatBeat] text-[#8C85A5] mb-2">마이페이지</h1>
        </div>
        
        {/* 사용자 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5 ">
        {/* 1번: 프로필 카드 */}
        <div className="bg-white/60 rounded-[16px] shadow-md border border-transparent px-8 py-12 flex items-center gap-6
          hover:shadow-[0_8px_16px_0_rgba(0,0,0,0.16)] transition-shadow duration-300">
          <div className="flex-shrink-0">
            <div className="w-35 h-35 rounded-full bg-white flex items-center justify-center shadow-[0_4px_8px_rgba(0,0,0,0.12)] border border-transparent">
              <img src={userIcon} alt="프로필 아이콘" className="w-28 h-28 object-cover"/>
            </div>
          </div>

            {/* 텍스트 영역 */}
          <div className="flex-1">
            {/* <p className="text-sm text-[#9b93b2] mb-1">오늘의 지구 수호자</p> */}
            <h2 className="text-xl font-[DungeonFighterOnlineBeatBeat] text-[#333333] -mt-1">
              {user.name || user.userName || '사용자'} 님
            </h2>
            {/* <p className="text-sm text-gray-600 mt-1">{user.email}</p> */}
            <p className="mt-3 font-[DungeonFighterOnlineBeatBeat] text-xl text-[#6C798A] mt-8">
              “{randomPraise}”
            </p>
          </div>
        </div>
          
         {/* 2번: 학습 스티커 */}
        <div className="bg-white/60 rounded-[16px] shadow-md border border-transparent px-8 py-4
         hover:shadow-[0_8px_16px_0_rgba(0,0,0,0.16)] transition-shadow duration-300">
          <h3 className="text-xl font-[DungeonFighterOnlineBeatBeat] text-[#6C798A] mt-3">
            나의 학습 레벨 스티커
          </h3>

          {/* Statistics Section (3개 박스) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-6">

            <div className="p-4 rounded-lg border border-transparent text-center">
            <img src={level1} alt="레벨1아이콘" className="w-36 h-36 object-contain -mb-5" />
              <p className="text-2xl font-[DungeonFighterOnlineBeatBeat] text-[#6C798A]">x {totalPractice}</p>
            </div>

            <div className="p-4 rounded-lg border border-transparent text-center">
              <img src={level2} alt="레벨2아이콘" className="w-36 h-36 object-contain -mb-5" />
              <p className="text-2xl font-[DungeonFighterOnlineBeatBeat] text-[#6C798A]">x {avgScore}</p>
            </div>

            <div className="p-4 rounded-lg border border-transparent text-center">
              <img src={level3} alt="레벨3아이콘" className="w-36 h-36 object-contain -mb-5" />
              <p className="text-2xl font-[DungeonFighterOnlineBeatBeat] text-[#6C798A]">x {languageCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

      

      

      {/* Feedback History Section */}
      <div className="bg-white/60 rounded-[16px] shadow-md border-transparent
       hover:shadow-[0_-6px_16px_0_rgba(0,0,0,0.16)] transition-shadow duration-300">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-[DungeonFighterOnlineBeatBeat] text-[#6C798A] px-[6px] ">최근 학습한 동화</h2>
          {/* <p className="text-gray-600 mt-1">오늘도 멋지게 우주 여행 중이에요 🚀</p> */}
        </div>


         {/* 간단 통계 3개
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#E3F2FF] flex items-center justify-center mb-2">
                <span className="text-2xl">📚</span>
              </div>
              <p className="text-xs text-[#7b88a0]">총 연습</p>
              <p className="text-lg font-bold text-[#3c6fd8]">
                {totalPractice}
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#E9F7EF] flex items-center justify-center mb-2">
                <span className="text-2xl">⭐</span>
              </div>
              <p className="text-xs text-[#7b88a0]">평균 점수</p>
              <p className="text-lg font-bold text-[#2e8b57]">{avgScore}</p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#F3E9FF] flex items-center justify-center mb-2">
                <span className="text-2xl">🌐</span>
              </div>
              <p className="text-xs text-[#7b88a0]">학습 언어</p>
              <p className="text-lg font-bold text-[#7b3fb9]">
                {languageCount}
              </p>
            </div>
          </div> */}
          




<div className="p-8">
  {userFeedbackHistory.length === 0 ? (
    // 연습 기록 없을 때 그대로 사용
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <svg
          className="w-16 h-16 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        아직 연습 기록이 없습니다
      </h3>
      <p className="text-gray-500 mb-4">
        동화 재생 페이지에서 발음을 연습해보세요!
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        동화 보러가기
      </button>
    </div>
  ) : (
    <div className="space-y-4 relative cursor-pointer font-[DNFBitBitv2]">
      {uniqueFeedbackHistory
        .map((feedback, index) => {
          // const title = feedback.contentsTitle || "콩쥐 팥쥐";


          // 1) contentsId 로 원래 동화 정보 가져오기
          const content = feedback.contentsId
          ? getContentById(feedback.contentsId)
          : null;

          // 2) 썸네일 URL (있는 필드에 맞게 조정)
          const thumbnailUrl =
          content?.thumbUrl ||                      // 🔹 Home에서 쓰는 필드 추가
          content?.thumbnailUrl ||
          content?.thumbnail ||
          (content?.thumbnailPath
            ? `${API_BASE_URL}${content.thumbnailPath}`
            : null);

              
          // 2) 제목은 콘텐츠에서 우선 가져오고, 없으면 백업 텍스트 사용
          const title =
          content?.title ||            // 예: contentsStore 안의 title
          content?.name ||             // 혹시 name 으로 되어 있을 수도 있음
          feedback.contentsTitle ||    // 피드백에 제목이 있으면 사용
          `동화 #${feedback.contentsId}`; // 그래도 없으면 아이디로 표시
                    

          // const desc =
          //   feedback.targetSentence ||
          //   "학습한 동화의 핵심 문장, 발음이 여기에 표시됩니다.";


          // 3) 설명도 콘텐츠에 있으면 그걸 먼저 사용
          const desc =
          content?.description ||
          feedback.targetSentence ||
          "학습한 동화의 핵심 문장, 발음이 여기에 표시됩니다.";



          const dateText = feedback.createdAt
            ? new Date(feedback.createdAt).toLocaleDateString()
            : "";


          // 🔹 시청 진행도 / 마지막 시청 시점
          const { watchedSeconds } = getWatchMeta(feedback.contentsId);
          const watchProgress = getWatchProgress(feedback.contentsId);
          const completed = isStudyCompleted(feedback.contentsId);


          // 🔹 Player에서 쓰는 것과 같은 영상 URL
          const videoUrl = content?.contentsId
            ? `${API_BASE_URL}/api/media/${content.contentsId}`
            : null;

          const progress =
            completed
              ? 100
              : typeof watchProgress === "number" && watchProgress > 0
                ? watchProgress
                : typeof feedback.score === "number"
                  ? Math.min(100, feedback.score)
                  : 0;                            // 둘 다 없으면 0
        

                  



          return (
            <div
              key={feedback.id || index}
              onClick={() => goToPlayer(feedback.contentsId)}
              className="relative bg-[#F4F7FF] rounded-[16px] shadow-sm border border-white
                         hover:shadow-[0_8px_16px_0_rgba(0,0,0,0.12)] transition-shadow duration-300 group cursor-pointer"
              role="button"
            >

              
              <div className="flex items-center gap-4">

                

                
                {/* 🔹 왼쪽: 유튜브처럼 영상 미리보기 영역 */}
          <div
            className="relative w-[260px] aspect-[16/9] rounded-[16px] flex-shrink-0 overflow-hidden shadow-md"
            onMouseEnter={(e) => {
              const video = e.currentTarget.querySelector('video');
              if (!video) return;

              // hover 할 때는 내가 보던 지점으로 점프 후 재생
              if (watchedSeconds > 0 && video.readyState >= 1) {
                video.currentTime = watchedSeconds;
              }

              // 재생은 무조건 시도
              video.play().catch(() => {
                // 자동재생 막혀도 에러만 무시
              });
            }}
            onMouseLeave={(e) => {
              const video = e.currentTarget.querySelector('video');
              if (!video) return;

              // hover 끝나면 멈추고, 썸네일처럼 정지 화면 유지
                video.pause();
              // 다시 보던 지점으로 프레임 유지하고 싶으면 주석 해제
              // if (watchedSeconds > 0 && video.readyState >= 1) {
              //   video.currentTime = watchedSeconds;
              // }
            }}
          >
            {thumbnailUrl && (
              <img
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            )}

            {videoUrl && (
              <video
                src={videoUrl}
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                muted
                playsInline
                preload="metadata"
              />
            )}

            {/* 어두운 오버레이 + '이어서 보기' 버튼 (기존 유지) */}
          {!completed && (
            <div
              className="absolute inset-0 bg-black/35
                         opacity-0 group-hover:opacity-100
                         transition-opacity duration-300"
            />
          )}

          {!completed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/player?contentId=${feedback.contentsId}`);
              }}
              className="absolute inset-0 flex items-center justify-center
                         opacity-0 group-hover:opacity-100
                         transition-opacity duration-300 hover:scale-105"
            >
              <img
                src={continueReading}
                alt="이어서 보기"
                className="w-55 h-auto"
              />
            </button>
          )}
          </div>

                

                {/* 가운데 텍스트 영역 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xl font-[DNFBitBitv2] text-[#333333] truncate">
                      {title}
                    </h3>
                    <span className="text-xs  text-[#8A99B2] ml-2 flex-shrink-0">
                      {dateText}
                    </span>
                  </div>

                  <p className="text-xs text-[#7B88A0] line-clamp-2">{desc}</p>


                  {/* 하단 진행 바 */}
                  <div className="mt-3 h-7 rounded-full bg-[#E9ECEF] overflow-hidden">{/* #E3EDFF   #E9ECEF */}
                    <div
                      className="h-full rounded-full bg-[#FEEBB1] transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>




                  {/* 태그들 (언어, 점수) */}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                    {/* <span className="px-2 py-0.5 rounded-full bg-[#E9F7EF] text-[#2E8B57]">
                      {feedback.lang || "언어 미정"}
                    </span> */}
                    {typeof feedback.score === "number" && (
                      <span className="px-2 py-0.5 rounded-full bg-[#FFF4D6] text-[#B58500]">
                        점수 {feedback.score}점
                      </span>
                    )}
                    {/* {feedback.accuracy && (
                      <span className="px-2 py-0.5 rounded-full bg-[#E3F2FF] text-[#3C6FD8]">
                        정확도 {feedback.accuracy}%
                      </span>
                    )} */}
                  </div>
                </div>

                {/* 오른쪽 버튼/남은시간 영역 */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">

                  
                  {/* 남은 시간 데이터가 있다면 */}
                  {feedback.remainingTime && (
                    <span className="inline-flex items-center rounded-full bg-[#F3F4FF] px-3 py-1 text-[11px] text-[#7B88A0]">
                      {feedback.remainingTime} 남음
                    </span>
                  )}
                  <button
                    onClick={() =>
                      navigate(
                        `/player?contentId=${feedback.contentsId}${
                          feedback.lang ? `&lang=${encodeURIComponent(feedback.lang)}` : ''
                        }`
                      )
                    }
                    className="
                      opacity-0 group-hover:opacity-100
                      transition-all duration-300
                      hover:scale-105
                    "
                  >
                  </button>
                  
                </div>
                
                
              </div>
              {/* 🔹 학습 완료 오버레이 – 이 부분이 새로 추가되는 부분! */}
                  {completed && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-[16px] z-10">
                      <img
                        src={studyCompletedImg}
                        alt="학습 완료"
                        className="w-48 h-auto md:w-56"
                      />
                    </div>
                  )}
                    






              

              
            </div>
          );
        })}
    </div>
  )}
</div>






      </div>
      
    </div>
    
  );
  
}


export default Mypage;
