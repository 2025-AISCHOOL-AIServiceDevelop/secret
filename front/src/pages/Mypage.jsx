import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useTutorStore } from '../stores';
import saturn from '../assets/saturn.png';
import userIcon from "../assets/user-icon.png";
import level1 from "../assets/level1.png";
import level2 from "../assets/level2.png";
import level3 from "../assets/level3.png";
import continueReading from "../assets/continue-reading.png";




function Mypage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getUserFeedbackHistory } = useTutorStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);






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
        <div className="bg-white/60 rounded-[20px] shadow-md border border-transparent px-8 py-12 flex items-center gap-6
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
            <p className="mt-3 font-[DungeonFighterOnlineBeatBeat] text-xl text-[#8C85A5] mt-8">
              “배움으로 지구가 더 빛나고 있어요!”
            </p>
          </div>
        </div>
          
         {/* 2번: 학습 요약 / 스티커 카드 */}
        <div className="bg-white/60 rounded-[20px] shadow-md border border-transparent px-8 py-4
         hover:shadow-[0_8px_16px_0_rgba(0,0,0,0.16)] transition-shadow duration-300">
          <h3 className="text-xl font-[DungeonFighterOnlineBeatBeat] text-[#8C85A5] mt-3">
            나의 학습 레벨 스티커
          </h3>

          {/* Statistics Section (3개 박스) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-6">

            <div className="p-4 rounded-lg border border-transparent text-center">
            <img src={level1} alt="레벨1아이콘" className="w-36 h-36 object-contain -mb-5" />
              <p className="text-2xl font-[DungeonFighterOnlineBeatBeat] text-[#8C85A5]">x {totalPractice}</p>
            </div>

            <div className="p-4 rounded-lg border border-transparent text-center">
              <img src={level2} alt="레벨2아이콘" className="w-36 h-36 object-contain -mb-5" />
              <p className="text-2xl font-[DungeonFighterOnlineBeatBeat] text-[#8C85A5]">x {avgScore}</p>
            </div>

            <div className="p-4 rounded-lg border border-transparent text-center">
              <img src={level3} alt="레벨3아이콘" className="w-36 h-36 object-contain -mb-5" />
              <p className="text-2xl font-[DungeonFighterOnlineBeatBeat] text-[#8C85A5]">x {languageCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

      

      

      {/* Feedback History Section */}
      <div className="bg-white rounded-[20px] shadow-md border-transparent
       hover:shadow-[0_-6px_16px_0_rgba(0,0,0,0.16)] transition-shadow duration-300">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">최근 학습한 동화</h2>
          <p className="text-gray-600 mt-1">오늘도 멋지게 우주 여행 중이에요 🚀</p>
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
    <div className="space-y-4 relative cursor-pointer">
      {userFeedbackHistory
        // .slice(0, 5) // 최근 5개만 보여주고 싶으면 유지, 전부 보여줄 거면 제거
        .map((feedback, index) => {
          const title = feedback.contentsTitle || "콩쥐 팥쥐";
          const desc =
            feedback.targetSentence ||
            "학습한 동화의 핵심 문장, 발음이 여기에 표시됩니다.";
          const dateText = feedback.createdAt
            ? new Date(feedback.createdAt).toLocaleDateString()
            : "";
          const progress =
            typeof feedback.score === "number"
              ? Math.min(100, feedback.score)
              : 60; // 점수 없으면 임시 60%

          return (
            <div
              key={feedback.id || index}
              className="bg-[#F4F7FF] rounded-[20px] px-6 py-4 shadow-sm border border-white
                         hover:shadow-[0_8px_16px_0_rgba(0,0,0,0.12)] transition-shadow duration-300 group"
            >
              <div className="flex items-center gap-4">
                {/* 왼쪽 썸네일 영역 */}
                <div
                  className="w-30 h-30 rounded-[18px]
                             bg-gradient-to-br from-[#FFE0CF] via-[#F9E5FF] to-[#E0EEFF]
                             flex items-center justify-center shadow-md flex-shrink-0"
                >
                  <span className="text-3xl">📖</span>
                </div>

                {/* 가운데 텍스트 영역 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-2xl font-[DungeonFighterOnlineBeatBeat] text-[#333333] truncate">
                      {title}
                    </h3>
                    <span className="text-xs text-[#8A99B2] ml-2 flex-shrink-0">
                      {dateText}
                    </span>
                  </div>
                  <p className="text-xs text-[#7B88A0] line-clamp-2">
                    {desc}
                  </p>

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
                      navigate(`/player?contentId=${feedback.contentsId}`)
                    }
                    className="
                      opacity-0 group-hover:opacity-100
                      transition-all duration-300
                      hover:scale-105
                    "
                  >
                    <img
                      src={continueReading}
                      alt="이어서 보기"
                      className="w-28 h-auto"
                    />
                  </button>
                </div>
              </div>

              {/* 하단 진행 바 */}
              <div className="mt-4 h-2 rounded-full bg-[#E3EDFF] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#6B7CFF] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
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
