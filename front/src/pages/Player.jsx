import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SpeedButton, TagButton } from '../@design-system';
import { useContentsStore, useTranslationStore, useTutorStore, useAuthStore } from '../stores';
import VoiceRecordingBanner from '../components/VoiceRecordingBanner';
import TranslationModal from '../components/TranslationModal';

function Player() {
  const [searchParams] = useSearchParams();
  const contentId = searchParams.get('contentId');

  const { getContentById } = useContentsStore();
  const { scripts, isLoadingScripts, loadScripts, getCurrentScript } = useTranslationStore();
  const { currentFeedback } = useTutorStore();
  const { user } = useAuthStore();

  const videoRef = useRef(null);
  const [selectedScript, setSelectedScript] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState('ko'); // 기본 한국어
  const [isTranslationModalOpen, setIsTranslationModalOpen] = useState(false);

  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: '영어', flag: '🇺🇸' },
    { code: 'zh', name: '중국어', flag: '🇨🇳' },
    { code: 'ja', name: '일본어', flag: '🇯🇵' },
    { code: 'vi', name: '베트남어', flag: '🇻🇳' },
    { code: 'th', name: '태국어', flag: '🇹🇭' },
    { code: 'ru', name: '러시아어', flag: '🇷🇺' }
  ];

  // Load content and scripts on mount
  useEffect(() => {
    if (contentId) {
      loadScripts(parseInt(contentId));
    }
  }, [contentId, loadScripts]);

  // Set initial selected script
  useEffect(() => {
    if (scripts.length > 0 && !selectedScript) {
      setSelectedScript(scripts[0]);
    }
  }, [scripts, selectedScript]);

  const content = contentId ? getContentById(parseInt(contentId)) : null;
  const displayScript = selectedScript || getCurrentScript();

  const handleAnalysisComplete = (result, script) => {
    console.log('Analysis completed:', result, 'for script:', script);
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      
      // 자막 싱크: 현재 시간에 해당하는 스크립트 자동 선택
      const currentMs = time * 1000;
      const activeScript = scripts.find(s => 
        currentMs >= s.startMs && currentMs < s.endMs
      );
      
      if (activeScript && (!selectedScript || selectedScript.scriptId !== activeScript.scriptId)) {
        setSelectedScript(activeScript);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changeSpeed = () => {
    const speeds = [1, 0.75, 0.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];
    setPlaybackSpeed(newSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const videoUrl = content?.contentsId 
    ? `http://localhost:8082/api/media/${content.contentsId}` 
    : null;

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-3 overflow-hidden">
      {/* 상단 영상 + 스크립트 목록 (65% 높이) */}
      <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-3 h-[65%]">
        {/* 왼쪽: 비디오 플레이어 */}
        <section className="flex flex-col gap-2 rounded-[18px] p-3 border-2 h-full" style={{ background: '#e1e8ff', borderColor: '#b9c5ef' }}>
          <div className="flex-1 rounded-[14px] overflow-hidden bg-black relative min-h-0">
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : (
              <div className="w-full h-full grid place-items-center" style={{ background: 'linear-gradient(135deg, #6657c7, #6aa0ff)' }}>
                <div className="text-center text-white">
                  <div className="text-5xl mb-3">🎬</div>
                  <div className="text-lg font-bold">비디오를 불러오는 중...</div>
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 items-center">
            <button 
              onClick={togglePlayPause}
              disabled={!videoUrl}
              aria-label={isPlaying ? "pause" : "play"} 
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center disabled:opacity-50 text-lg font-bold" 
              style={{ background: '#ffe182', borderColor: '#c9a94b' }}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <div 
              className="h-3 rounded-full overflow-hidden border-2 cursor-pointer" 
              style={{ background: '#f4f7ff', borderColor: '#c8d3f0' }}
              onClick={handleSeek}
            >
              <span 
                className="block h-full transition-all" 
                style={{ 
                  width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`, 
                  background: 'linear-gradient(90deg, #a9a3ff, #82b2ff)' 
                }} 
              />
            </div>
            <div className="text-[#6d7a9f] text-sm font-medium">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            <SpeedButton onClick={changeSpeed}>
              {playbackSpeed === 1 ? '보통' : playbackSpeed === 0.75 ? '느리게' : '아주 느리게'}
            </SpeedButton>
          </div>
        </section>

        {/* 오른쪽: 스크립트 목록 */}
        <aside className="flex flex-col gap-2 h-full overflow-hidden">
          {/* 번역 요청 버튼 */}
          <button
            onClick={() => setIsTranslationModalOpen(true)}
            className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2 flex-shrink-0"
          >
            <span className="text-lg">🌍</span>
            다른 언어로 번역 요청
          </button>

          {/* 언어 선택 버튼 */}
          <div className="grid grid-cols-7 gap-1 flex-shrink-0">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`px-1 py-1 rounded text-[9px] font-bold transition-all ${
                  selectedLanguage === lang.code
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                }`}
              >
                <div className="text-xs">{lang.flag}</div>
                <div className="text-[8px] leading-tight">{lang.name}</div>
              </button>
            ))}
          </div>

          {/* 현재 선택된 스크립트 하이라이트 */}
          {displayScript && (
            <div className="p-3 rounded-[14px] border-2 shadow-md flex-shrink-0" style={{ 
              background: 'linear-gradient(135deg, #fff5e1, #ffe8f0)', 
              borderColor: '#ffc107' 
            }}>
              <div className="text-xs text-gray-600 font-bold mb-1 flex items-center gap-1">
                <span>⭐</span> 선택된 문장
              </div>
              <div className="text-sm font-bold text-gray-800 line-clamp-2">{displayScript.text}</div>
            </div>
          )}

          {/* 스크립트 목록 */}
          <div className="bg-white rounded-[14px] border-2 p-2 flex-1 flex flex-col min-h-0" style={{ borderColor: '#c8d3f0' }}>
            <div className="text-xs text-gray-600 font-bold mb-2 flex-shrink-0">전체 스크립트</div>
            <div className="grid gap-2 overflow-y-auto pr-1 card-scroll flex-1">
              {isLoadingScripts ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-sm mt-3 text-gray-600">스크립트 로딩 중...</p>
                </div>
              ) : scripts.length > 0 ? (
                scripts.map((script, index) => (
                  <div
                    key={script.id || script.orderNo}
                    onClick={() => setSelectedScript(script)}
                    className={`group rounded-[10px] p-2 border-2 cursor-pointer transition-all flex-shrink-0 ${
                      selectedScript?.id === script.id || selectedScript?.orderNo === script.orderNo
                        ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-blue-400 shadow-md'
                        : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        selectedScript?.id === script.id || selectedScript?.orderNo === script.orderNo
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-300 text-gray-600 group-hover:bg-blue-400 group-hover:text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 text-[#5c6d93] text-xs leading-relaxed">
                        {script.text}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 flex-shrink-0">
                  <div className="text-3xl mb-1">📭</div>
                  <div className="text-xs text-gray-500">스크립트를 불러올 수 없습니다.</div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* 하단: 음성 녹음 전용 배너 (35% 높이) */}
      <div className="h-[35%]">
        <VoiceRecordingBanner
          script={displayScript}
          contentsId={parseInt(contentId)}
          language={selectedLanguage}
          userId={user?.id || 1}
          onAnalyzed={handleAnalysisComplete}
        />
      </div>

      {/* 번역 요청 모달 */}
      <TranslationModal
        isOpen={isTranslationModalOpen}
        onClose={() => setIsTranslationModalOpen(false)}
        content={content}
      />
    </div>
  )
}

export default Player


