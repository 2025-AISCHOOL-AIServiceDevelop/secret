import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Play,
  Pause,
  FastForward,
  Gauge,
  Mic,
  X,
  Film,
  Star,
  FileText,
  Inbox,
  Award,
  MessageCircle
} from 'lucide-react';
import { useContentsStore, useTranslationStore, useTutorStore, useAuthStore } from '../stores';
import VoiceRecordingBanner from '../components/VoiceRecordingBanner';
import { API_BASE_URL } from '../services/api';

function Player() {
  const [searchParams] = useSearchParams();
  const contentId = searchParams.get('contentId');
  const initialLangParam = searchParams.get('lang');

  const { getContentById, loadContents, contents } = useContentsStore();
  const { scripts, isLoadingScripts, loadScripts, getCurrentScript } = useTranslationStore();
  const { currentFeedback } = useTutorStore();
  const { user } = useAuthStore();

  const videoRef = useRef(null);
  const videoSectionRef = useRef(null);
  const [selectedScript, setSelectedScript] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    if (!initialLangParam) return 'ko';
    // URL ?lang=en-US 또는 en 형태 모두 지원 → 짧은 코드만 사용
    return initialLangParam.toLowerCase().split('-')[0];
  }); // 기본 한국어 (또는 URL 파라미터 기반)
  const [pausedScriptIds, setPausedScriptIds] = useState(new Set()); // 이미 중지된 스크립트 추적
  const [recordingPromptVisible, setRecordingPromptVisible] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: '영어', flag: '🇺🇸' },
    { code: 'zh', name: '중국어', flag: '🇨🇳' },
    { code: 'ja', name: '일본어', flag: '🇯🇵' },
    { code: 'vi', name: '베트남어', flag: '🇻🇳' },
    { code: 'ru', name: '러시아어', flag: '🇷🇺' },
    { code: 'th', name: '태국어', flag: '🇹🇭' }
  ];

  // Load contents if not already loaded (직접 접근 시)
  useEffect(() => {
    if (contentId && contents.length === 0) {
      loadContents();
    }
  }, [contentId, contents.length, loadContents]);

  // 현재 선택된 콘텐츠(쿼리 파라미터 기준)
  const baseContent = contentId ? getContentById(parseInt(contentId)) : null;

  // 언어별로 올바른 contentsId를 찾기 위한 헬퍼
  const effectiveContent = useMemo(() => {
    if (!baseContent) return null;

    const langCode = (selectedLanguage || '').toLowerCase();
    const rootId = baseContent.parentId || baseContent.contentsId;

    const relatedContents = contents.filter(
      (c) =>
        c &&
        (c.contentsId === rootId || c.parentId === rootId)
    );

    const exactMatch = relatedContents.find(
      (c) => (c.language || '').toLowerCase() === langCode
    );

    // 정확히 일치하는 언어가 없으면 기본 콘텐츠 사용
    return exactMatch || baseContent;
  }, [baseContent, contents, selectedLanguage]);

  // 선택된 언어/콘텐츠 기준으로 스크립트 로딩
  useEffect(() => {
    if (effectiveContent && selectedLanguage) {
      loadScripts(effectiveContent.contentsId, selectedLanguage);
    }
  }, [effectiveContent, selectedLanguage, loadScripts]);

  // Set initial selected script
  useEffect(() => {
    if (scripts.length > 0 && !selectedScript) {
      setSelectedScript(scripts[0]);
    }
  }, [scripts, selectedScript]);

  const content = effectiveContent || baseContent;
  const displayScript = selectedScript || getCurrentScript();

  const handleAnalysisComplete = (result, script) => {
    setAnalysisResult({
      ...result,
      scriptText: result?.scriptText || script?.text || '',
    });
  };

  useEffect(() => {
    if (!currentFeedback) return;

    setAnalysisResult(prev => {
      if (prev?.feedbackId === currentFeedback.feedbackId) {
        return prev;
      }

      const scriptTextFallback = currentFeedback.scriptText || selectedScript?.text || prev?.scriptText || '';
      return {
        ...currentFeedback,
        scriptText: scriptTextFallback,
      };
    });
  }, [currentFeedback, selectedScript]);

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
      
      if (activeScript) {
        const scriptId = activeScript.scriptId || activeScript.id;
        
        // 스크립트가 변경되었을 때만 업데이트
        if (!selectedScript || (selectedScript.scriptId || selectedScript.id) !== scriptId) {
          setSelectedScript(activeScript);
          
          // 타임스탬프 시점에서 영상 중지 및 녹음 유도 (각 스크립트당 한 번만)
          if (!pausedScriptIds.has(scriptId)) {
            videoRef.current.pause();
            setIsPlaying(false);
            setRecordingPromptVisible(true);
            setPausedScriptIds(prev => new Set([...prev, scriptId]));
            
            // 10초 후 자동으로 프롬프트 숨기기
            setTimeout(() => {
              setRecordingPromptVisible(false);
            }, 10000);
          }
        }
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
    ? `${API_BASE_URL}/api/media/${content.contentsId}` 
    : null;
  
  // 녹음 시작 시 프롬프트 숨기기 및 영상 재개
  const handleRecordingStart = () => {
    setRecordingPromptVisible(false);
  };
  
  // 영상 재생 시작 시 중지 기록 초기화 (재시청 대비)
  const handleVideoPlay = () => {
    setIsPlaying(true);
    // 사용자가 처음부터 다시 볼 때를 대비해 현재 시간이 0에 가까우면 초기화
    if (videoRef.current && videoRef.current.currentTime < 1) {
      setPausedScriptIds(new Set());
    }
  };

  // 영상 이어보기 (분석 결과 후)
  const handleContinueVideo = () => {
    // 영상 섹션으로 스크롤
    if (videoSectionRef.current) {
      videoSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // 영상 재생
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* 상단 영상 + 스크립트 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        {/* 왼쪽: 비디오 플레이어 */}
        <section ref={videoSectionRef} className="flex flex-col gap-3 rounded-[18px] p-4 border-2" style={{ background: '#e1e8ff', borderColor: '#b9c5ef' }}>
          <div className="rounded-[14px] overflow-hidden bg-black relative w-full" style={{ aspectRatio: '16/9' }}>
            {videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={handleVideoPlay}
                  onPause={() => setIsPlaying(false)}
                  crossOrigin="anonymous"
                />
                
                {/* 녹음 유도 배너 */}
                {recordingPromptVisible && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#FFE082] to-[#FFECB3] border-3 border-[#FFD54F] text-[#F57C00] px-6 py-3 rounded-full shadow-2xl animate-bounce flex items-center gap-3 z-10">
                    <Mic className="w-6 h-6" />
                    <div>
                      <div className="font-bold text-sm">이 문장을 따라 말해보세요!</div>
                      <div className="text-xs opacity-80">아래 녹음 버튼을 클릭하세요</div>
                    </div>
                    <button 
                      onClick={() => setRecordingPromptVisible(false)}
                      className="ml-2 hover:opacity-70 transition-opacity"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full grid place-items-center" style={{ background: 'linear-gradient(135deg, #6657c7, #6aa0ff)' }}>
                <div className="text-center text-white">
                  <Film className="w-20 h-20 mb-4 mx-auto animate-pulse" />
                  <div className="text-lg font-bold">비디오를 불러오는 중...</div>
                </div>
              </div>
            )}
          </div>
          
          {/* 컨트롤 바 */}
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-3 items-center mt-2">
            <button 
              onClick={togglePlayPause}
              disabled={!videoUrl}
              aria-label={isPlaying ? "pause" : "play"} 
              className="group relative w-14 h-14 rounded-full flex items-center justify-center disabled:opacity-50 transition-all hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl disabled:cursor-not-allowed" 
              style={{ 
                background: 'linear-gradient(135deg, #FFE082 0%, #FFECB3 100%)',
                border: '3px solid #FFD54F'
              }}
            >
              <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-30 transition-opacity"></div>
              {isPlaying ? (
                <Pause className="w-7 h-7 text-[#F57C00] fill-[#F57C00]" />
              ) : (
                <Play className="w-7 h-7 text-[#F57C00] fill-[#F57C00] ml-1" />
              )}
            </button>
            <div 
              className="h-4 rounded-full overflow-hidden border-2 cursor-pointer hover:h-5 transition-all" 
              style={{ background: '#F0F8FF', borderColor: '#B3E5FC' }}
              onClick={handleSeek}
            >
              <span 
                className="block h-full transition-all" 
                style={{ 
                  width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`, 
                  background: 'linear-gradient(90deg, #81D4FA, #FFE082)' 
                }} 
              />
            </div>
            <div className="text-[#6d7a9f] text-base font-medium whitespace-nowrap">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            <button
              onClick={changeSpeed}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#FFE082] to-[#FFECB3] border-2 border-[#FFD54F] text-[#F57C00] font-bold text-sm shadow-md hover:shadow-sm transform hover:scale-105 transition-all"
            >
              <Gauge className="w-4 h-4" />
              {playbackSpeed === 1 ? '보통' : playbackSpeed === 0.75 ? '느리게' : '아주 느리게'}
            </button>
          </div>
        </section>

        {/* 오른쪽: 스크립트 목록 */}
        <aside className="flex flex-col gap-3">
          {/* 언어 선택 버튼 */}
          <div className="grid grid-cols-7 gap-1.5">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`px-2 py-2 rounded-lg text-[10px] font-bold transition-all hover-sm ${
                  selectedLanguage === lang.code
                    ? 'bg-[#81D4FA] text-[#01579B] shadow-md border-2 border-[#4FC3F7]'
                    : 'bg-[#E1F5FE] text-[#0277BD] border-2 border-[#B3E5FC]'
                }`}
              >
                <div className="text-base mb-1">{lang.flag}</div>
                <div className="text-[9px] leading-tight">{lang.name}</div>
              </button>
            ))}
          </div>

          {/* 스크립트 목록 */}
          <div className="bg-white rounded-[14px] border-2 p-4" style={{ borderColor: '#c8d3f0', maxHeight: '530px', overflowY: 'auto' }}>
            <div className="text-sm text-gray-600 font-bold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              전체 스크립트
            </div>
            <div className="space-y-2.5">
                {isLoadingScripts ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-sm mt-3 text-gray-600">스크립트 로딩 중...</p>
                  </div>
                ) : scripts.length > 0 ? (
                  scripts.map((script, index) => {
                    const isSelected = selectedScript && (
                      (script.scriptId && selectedScript.scriptId === script.scriptId) ||
                      (script.id && selectedScript.id === script.id) ||
                      (selectedScript.orderNo === script.orderNo && selectedScript.contentsId === script.contentsId)
                    );
                    
                    return (
                      <div
                        key={script.scriptId || script.id || `${script.contentsId}-${script.orderNo}`}
                        onClick={() => setSelectedScript(script)}
                        className={`rounded-[12px] p-3 border-2 cursor-pointer transition-all flex-shrink-0 ${
                          isSelected
                            ? 'bg-white border-[#01579B] shadow-xl'
                            : 'bg-[#E1F5FE] border-[#B3E5FC]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                            isSelected
                              ? 'bg-[#01579B] text-white'
                              : 'bg-[#B3E5FC] text-[#01579B]'
                          }`}>
                            {index + 1}
                          </div>
                          <div className={`flex-1 text-sm leading-relaxed transition-all ${
                            isSelected
                              ? 'text-[#01579B] font-bold'
                              : 'text-[#0277BD]'
                          }`}>
                            {script.text}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 flex-shrink-0">
                    <Inbox className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <div className="text-xs text-gray-500">스크립트를 불러올 수 없습니다.</div>
                  </div>
                )}
            </div>
          </div>
        </aside>
      </div>

      {/* 하단: 음성 녹음 전용 배너 */}
      <div className="h-[220px]">
        <VoiceRecordingBanner
          script={displayScript}
          contentsId={content?.contentsId || (contentId ? parseInt(contentId) : undefined)}
          language={selectedLanguage}
          userId={user?.id || 1}
          onAnalyzed={handleAnalysisComplete}
          onRecordingStart={handleRecordingStart}
          onContinueVideo={handleContinueVideo}
        />
      </div>

    </div>
  )
}

export default Player


