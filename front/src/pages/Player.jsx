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
import level1 from '../assets/level1.png';
import level2 from '../assets/level2.png';
import level3 from '../assets/level3.png';

const getStickerByMedal = (medal) => {
  if (!medal) return null;
  const upper = String(medal).toUpperCase();
  if (upper === 'GOLD') return level3;
  if (upper === 'SILVER') return level2;
  if (upper === 'BRONZE') return level1;
  return null;
};

function Player() {
  const [searchParams] = useSearchParams();
  const contentId = searchParams.get('contentId');
  const initialLangParam = searchParams.get('lang');

  const { getContentById, loadContents, contents } = useContentsStore();
  const { scripts, isLoadingScripts, loadScripts, getCurrentScript } = useTranslationStore();
  const { currentFeedback, feedbackHistory } = useTutorStore();
  const { user } = useAuthStore();

  const videoRef = useRef(null);
  const videoSectionRef = useRef(null);
  const scriptListRef = useRef(null);          // 스크립트 리스트 컨테이너
  const scriptItemRefs = useRef({});           // 각 스크립트 카드 DOM 참조
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
  const [flippedScriptId, setFlippedScriptId] = useState(null); // 뒤집힌 스크립트 카드 추적

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

  // 플레이어 페이지 진입 시 헤더가 보이지 않도록 영상 섹션이 화면 상단에 오도록 스크롤
  useEffect(() => {
    if (videoSectionRef.current) {
      videoSectionRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }, []);

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

  // 현재 콘텐츠/사용자 기준 스크립트별 최신 피드백 맵 (프론트 로컬 히스토리에서 계산)
  const scriptFeedbackMap = useMemo(() => {
    if (!user || !content?.contentsId || scripts.length === 0 || !feedbackHistory) return {};

    const map = {};
    // feedbackHistory는 최신 순으로 쌓이므로, 처음 들어오는 값이 최신
    feedbackHistory.forEach((fb) => {
      if (
        fb &&
        fb.userId === user.id &&
        fb.contentsId === content.contentsId &&
        fb.scriptId != null &&
        map[fb.scriptId] == null
      ) {
        map[fb.scriptId] = fb;
      }
    });
    return map;
  }, [user, content, scripts, feedbackHistory]);

  const handleAnalysisComplete = (result, script) => {
    const scriptKey = result?.scriptId ?? script?.scriptId ?? script?.id ?? null;
    setAnalysisResult({
      ...result,
      scriptId: scriptKey,
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

          // 영상은 멈추지 않고 계속 재생되도록 유지하되,
          // 필요하면 프롬프트만 띄우고 스크롤을 통해 현재 스크립트를 보여줌
          if (!pausedScriptIds.has(scriptId)) {
            setRecordingPromptVisible(true);
            setPausedScriptIds(prev => new Set([...prev, scriptId]));

            // 10초 후 자동으로 프롬프트 숨기기
            setTimeout(() => {
              setRecordingPromptVisible(false);
            }, 10000);
          }

          // 스크립트 리스트가 자동으로 스크롤되면서 현재 스크립트가 계속 보이도록 처리
          const container = scriptListRef.current;
          const target = scriptItemRefs.current[scriptId];
          if (container && target) {
            const containerRect = container.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            const offset =
              targetRect.top -
              containerRect.top -
              containerRect.height / 2 +
              targetRect.height / 2;
            container.scrollTop += offset;
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
    <div className="player-page flex flex-col gap-4 p-4">
      {/* 상단 영상 + 스크립트 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
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
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#FFE082] to-[#FFECB3] border-3 border-[#FFD54F] text-[#F57C00] px-7 py-3.5 rounded-full shadow-2xl animate-bounce flex items-center gap-3 z-10">
                    <Mic className="w-6 h-6" />
                    <div>
                      <div className="font-bold text-base">이 문장을 따라 말해보세요!</div>
                      <div className="text-sm opacity-80">아래 녹음 버튼을 클릭하세요</div>
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
                  <div className="text-xl font-bold">비디오를 불러오는 중...</div>
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
            <div className="text-[#6d7a9f] text-lg font-medium whitespace-nowrap">
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
        <aside className="flex flex-col gap-3 h-full">
          {/* 영상 제목 */}
          <div className="text-[22px] font-bold text-[#01579B]">
            {content?.title || content?.name || '영상 제목'}
          </div>

          {/* 언어 선택 버튼 */}
          <div className="grid grid-cols-7 gap-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`px-0.5 py-0.5 rounded-xl text-[14px] transition-all hover-sm ${
                  selectedLanguage === lang.code
                    ? 'bg-[#81D4FA] text-[#01579B] shadow-md border-2 border-[#4FC3F7]'
                    : 'bg-[#E1F5FE] text-[#0277BD] border-2 border-[#B3E5FC]'
                }`}
              >
                <div className="text-lg mb-0.5">{lang.flag}</div>
                <div className="text-[14px] leading-tight">{lang.name}</div>
              </button>
            ))}
          </div>

          {/* 스크립트 목록 */}
          <div
            ref={scriptListRef}
            className="bg-white rounded-[14px] border-2 p-5"
            style={{ borderColor: '#c8d3f0', maxHeight: '450px', overflowY: 'auto' }}
          >
            <div className="text-base text-gray-600 font-bold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              전체 스크립트
            </div>
            <div className="space-y-2.5">
                {isLoadingScripts ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-base mt-3 text-gray-600">스크립트 로딩 중...</p>
                  </div>
                ) : scripts.length > 0 ? (
                  scripts.map((script, index) => {
                    const isSelected = selectedScript && (
                      (script.scriptId && selectedScript.scriptId === script.scriptId) ||
                      (script.id && selectedScript.id === script.id) ||
                      (selectedScript.orderNo === script.orderNo && selectedScript.contentsId === script.contentsId)
                    );
                    const scriptKey = script.scriptId ?? script.id;
                    const feedbackForScript = scriptKey != null ? scriptFeedbackMap[Number(scriptKey)] : null;
                    const latestMedal =
                      feedbackForScript?.medal ||
                      (analysisResult && analysisResult.scriptId === scriptKey ? analysisResult.medal : null);
                    const stickerSrc = latestMedal ? getStickerByMedal(latestMedal) : null;
                    const displayFeedback = feedbackForScript || (analysisResult && analysisResult.scriptId === scriptKey ? analysisResult : null);
                    const totalScore = displayFeedback?.finalScore ?? displayFeedback?.score ?? null;
                    const accuracy = displayFeedback?.accuracy ?? null;
                    const fluency = displayFeedback?.fluency ?? null;
                    const completeness = displayFeedback?.completeness ?? null;
                    const feedbackText = displayFeedback?.feedbackText || displayFeedback?.overallComment || '';
                    const cardId = scriptKey ?? `${script.contentsId}-${script.orderNo}`;
                    const isFlipped = flippedScriptId === cardId;
                    
                    return (
                      <div
                        key={script.scriptId || script.id || `${script.contentsId}-${script.orderNo}`}
                        ref={el => {
                          if (el && scriptKey != null) {
                            scriptItemRefs.current[scriptKey] = el;
                          }
                        }}
                        onClick={() => {
                          setSelectedScript(script);
                          setFlippedScriptId(prev => (prev === cardId ? null : cardId));
                        }}
                        className="flip-card cursor-pointer flex-shrink-0 group"
                      >
                        <div className={`flip-card-inner ${isFlipped ? 'is-flipped' : ''}`}>
                          {/* 앞면: 스크립트 + 스티커 */}
                          <div
                            className={`flip-card-front rounded-[14px] min-h-[170px] border-2 p-4 relative flex items-start gap-3 transition-all ${
                          isSelected
                            ? 'bg-white border-[#01579B] shadow-xl'
                            : 'bg-[#E1F5FE] border-[#B3E5FC]'
                        }`}
                      >
                            {/* 말풍선 - 점수를 봐볼까? (카드 중앙에 자연스럽게 표시) */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <div className="px-3 py-1 rounded-full bg-white/95 border border-[#B3E5FC] text-[11px] text-[#01579B] shadow-sm">
                                점수를 봐볼까?
                              </div>
                            </div>

                            <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-base font-bold ${
                            isSelected
                              ? 'bg-[#01579B] text-white'
                              : 'bg-[#B3E5FC] text-[#01579B]'
                          }`}>
                            {index + 1}
                          </div>
                            <div className="flex-1 flex items-start justify-between gap-3">
                              <div className={`text-base leading-relaxed script-text-default-font ${
                              isSelected
                                ? 'text-[#01579B] font-bold'
                                : 'text-[#0277BD]'
                            }`}>
                              {script.text}
                            </div>
                            {stickerSrc && (
                              <img
                                src={stickerSrc}
                                alt="발음 스티커"
                                  className="w-38 h-38 object-contain drop-shadow-sm"
                                />
                              )}
                            </div>
                          </div>

                          {/* 뒷면: 점수 & 평가 */}
                          <div className="flip-card-back rounded-[14px] min-h-[140px] border-2 p-4 bg-white flex flex-col justify-center gap-2 border-[#01579B] shadow-lg">
                            {totalScore != null ? (
                              <>
                                <div className="flex items-center justify-between gap-3">
                                  <div className="text-sm font-bold text-[#01579B]">
                                    나의 점수
                                  </div>
                                  <div className="text-2xl font-extrabold text-[#F57C00]">
                                    {totalScore}
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-[11px] text-[#0277BD]">
                                  <div className="px-2 py-1 rounded-lg bg-[#E1F5FE]">
                                    정확도 {accuracy ?? '-'}
                                  </div>
                                  <div className="px-2 py-1 rounded-lg bg-[#F3E5F5]">
                                    유창성 {fluency ?? '-'}
                                  </div>
                                  <div className="px-2 py-1 rounded-lg bg-[#FFF9E6]">
                                    완성도 {completeness ?? '-'}
                                  </div>
                                </div>
                                {feedbackText && (
                                  <div className="mt-1 px-2.5 py-1.5 rounded-lg bg-[#FFFDE7] border border-[#FFD54F] text-[11px] text-[#F57C00] leading-relaxed line-clamp-2">
                                    {feedbackText}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-sm text-center text-[#0277BD] leading-relaxed">
                                아직 점수가 없어요.
                                <br />
                                아래에서 먼저 녹음해 볼까요?
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 flex-shrink-0">
                    <Inbox className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <div className="text-sm text-gray-500">스크립트를 불러올 수 없습니다.</div>
                  </div>
                )}
            </div>
          </div>
        </aside>
      </div>

      {/* 하단: 음성 녹음 전용 배너 */}
      <div className="h-[180px]">
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


