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
import saturn from '../assets/saturn.png';

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
  const { currentFeedback, feedbackHistory, mypageFeedbackHistory, fetchLatestFeedback } = useTutorStore();
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
  const [loadedFeedbackScripts, setLoadedFeedbackScripts] = useState(new Set()); // 백엔드에서 점수를 불러온 스크립트 ID
  const [recentScoredScriptId, setRecentScoredScriptId] = useState(null); // 방금 점수가 나온 스크립트 ID (짜잔 효과용)

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
  const combinedFeedbackHistory = useMemo(() => {
    const merged = [];
    if (Array.isArray(feedbackHistory)) {
      merged.push(...feedbackHistory);
    }
    if (Array.isArray(mypageFeedbackHistory)) {
      merged.push(...mypageFeedbackHistory);
    }
    return merged;
  }, [feedbackHistory, mypageFeedbackHistory]);

  const scriptFeedbackMap = useMemo(() => {
    if (!user?.userId || !content?.contentsId || scripts.length === 0 || combinedFeedbackHistory.length === 0) {
      return {};
    }

    const map = {};
    combinedFeedbackHistory.forEach((fb) => {
      if (
        fb &&
        fb.userId === user.userId &&
        fb.contentsId === content.contentsId &&
        fb.scriptId != null &&
        map[fb.scriptId] == null
      ) {
        map[fb.scriptId] = fb;
      }
    });
    return map;
  }, [user, content, scripts, combinedFeedbackHistory]);

  const knownFeedbackScriptIds = useMemo(() => {
    if (!user?.userId || !content?.contentsId || combinedFeedbackHistory.length === 0) {
      return new Set();
    }

    return combinedFeedbackHistory.reduce((set, fb) => {
      if (
        fb &&
        fb.userId === user.userId &&
        fb.contentsId === content.contentsId &&
        fb.scriptId != null
      ) {
        set.add(Number(fb.scriptId));
      }
      return set;
    }, new Set());
  }, [user, content, combinedFeedbackHistory]);

  // 페이지 진입 시 / 스크립트 로딩 후, 백엔드에 저장된 최신 점수를 불러오기
  useEffect(() => {
    if (!user?.userId || !content?.contentsId || scripts.length === 0 || !fetchLatestFeedback) return;
    if (knownFeedbackScriptIds.size === 0) return;

    scripts.forEach((script) => {
      const rawScriptId = script?.scriptId ?? script?.id;
      const scriptId = rawScriptId != null ? Number(rawScriptId) : null;
      if (!scriptId) return;
      if (!knownFeedbackScriptIds.has(scriptId)) return;
      if (loadedFeedbackScripts.has(scriptId)) return;

      fetchLatestFeedback(user.userId, content.contentsId, scriptId)
        .catch((err) => {
          const serverMessage = err?.response?.data?.message || err?.message;
          if (serverMessage && serverMessage.includes('피드백이 존재하지 않습니다')) {
            console.debug('No feedback yet for script', scriptId);
          } else {
            console.error('Failed to fetch latest feedback for script', scriptId, err);
          }
        })
        .finally(() => {
          setLoadedFeedbackScripts((prev) => {
            const next = new Set(prev);
            next.add(scriptId);
            return next;
          });
        });
    });
  }, [user, content, scripts, fetchLatestFeedback, loadedFeedbackScripts, knownFeedbackScriptIds]);

  // 선택된 스크립트에 대해서는 항상 최신 점수를 동기화 (로컬 히스토리가 없더라도)
  useEffect(() => {
    if (!user?.userId || !content?.contentsId || !selectedScript || !fetchLatestFeedback) return;

    const rawScriptId = selectedScript?.scriptId ?? selectedScript?.id;
    const scriptId = rawScriptId != null ? Number(rawScriptId) : null;
    if (!scriptId) return;
    if (scriptFeedbackMap[scriptId]) return;
    if (loadedFeedbackScripts.has(scriptId)) return;

    fetchLatestFeedback(user.userId, content.contentsId, scriptId)
      .catch((err) => {
        const serverMessage = err?.response?.data?.message || err?.message;
        if (serverMessage && serverMessage.includes('피드백이 존재하지 않습니다')) {
          console.debug('No feedback yet for script', scriptId);
        } else {
          console.error('Failed to fetch latest feedback for script', scriptId, err);
        }
      })
      .finally(() => {
        setLoadedFeedbackScripts((prev) => {
          const next = new Set(prev);
          next.add(scriptId);
          return next;
        });
      });
  }, [user, content, selectedScript, fetchLatestFeedback, scriptFeedbackMap, loadedFeedbackScripts]);

  const handleScriptCardClick = (script) => {
    setSelectedScript(script);

    const startMs = script?.startMs ?? script?.startTimeMs ?? null;
    if (videoRef.current && startMs != null) {
      videoRef.current.currentTime = startMs / 1000;
    }
  };

  const handleAnalysisComplete = (result, script) => {
    const scriptKey = result?.scriptId ?? script?.scriptId ?? script?.id ?? null;
    setAnalysisResult({
      ...result,
      scriptId: scriptKey,
      scriptText: result?.scriptText || script?.text || '',
    });

    if (scriptKey != null) {
      // 방금 점수가 나온 스크립트에만 짜잔 등장 애니메이션 적용
      setRecentScoredScriptId(scriptKey);
      setTimeout(() => {
        setRecentScoredScriptId((prev) => (prev === scriptKey ? null : prev));
      }, 1200);
    }
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
  
  // 녹음 시작 시 프롬프트 숨기기 및 영상 정지
  const handleRecordingStart = () => {
    setRecordingPromptVisible(false);
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
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
    <div className="player-page flex flex-col gap-4">

       {/* 🔥 학습 페이지 헤더(토성 + 제목) */}
    <div className="relative mb-8 pt-7 text-center">
      <img
        src={saturn}
        alt="토성 아이콘"
        className="absolute left-1/2 -translate-x-1/2 -top-[0.5px] max-w-[34px]"
      />
      <h3 className="text-4xl font-[DungeonFighterOnlineBeatBeat] text-[#8C85A5] mb-2">
        학습 페이지
      </h3>
    </div>
    
      {/* 상단 영상 + 스크립트 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        {/* 왼쪽: 비디오 플레이어 */}
        <section ref={videoSectionRef} className="flex flex-col gap-3 rounded-[18px] p-4 border-2" style={{ background: '#e1e8ff', borderColor: '#b9c5ef' }}>
           <div className="text-center text-3xl font-[DungeonFighterOnlineBeatBeat] text-[#8C85A5] mb-2">
              {content?.title || content?.name || '영상 제목'}
            </div>
          
          <div className="rounded-[14px] overflow-hidden bg-black relative w-full" style={{ aspectRatio: '16/9' }}>
            {videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={togglePlayPause}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={handleVideoPlay}
                  onPause={() => setIsPlaying(false)}
                  crossOrigin="anonymous"
                />
                
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
            <div className="text-2xl text-gray-600 font-bold mb-3 flex items-center gap-2">
              <FileText className="w-8 h-8" />
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
                    const feedbackText = displayFeedback?.feedbackText || displayFeedback?.overallComment || '';
                    const cardId = scriptKey ?? `${script.contentsId}-${script.orderNo}`;
                    const isFlipped = flippedScriptId === cardId;
                    const isRecentlyScored = scriptKey != null && recentScoredScriptId === scriptKey;
                    
                    return (
                      <div
                        key={script.scriptId || script.id || `${script.contentsId}-${script.orderNo}`}
                        ref={el => {
                          if (el && scriptKey != null) {
                            scriptItemRefs.current[scriptKey] = el;
                          }
                        }}
                        onClick={() => handleScriptCardClick(script)}
                        className="flip-card cursor-pointer flex-shrink-0 group"
                      >
                        <div className={`flip-card-inner ${isFlipped ? 'is-flipped' : ''}`}>
                          {/* 앞면: 스크립트 + 스티커 */}
                          <div
                            className={`flip-card-front rounded-[14px] min-h-[170px] border-2 p-4 relative flex items-start gap-3 transition-all ${
                          isSelected
                            ? 'bg-white border-[#01579B] shadow-xl'
                            : 'bg-[#E1F5FE] border-[#B3E5FC]'
                        } ${isRecentlyScored ? 'sticker-pop-enter' : ''}`}
                      >
                            <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-base font-bold ${
                            isSelected
                              ? 'bg-[#01579B] text-white'
                              : 'bg-[#B3E5FC] text-[#01579B]'
                          }`}>
                            {index + 1}
                          </div>
                            <div className="flex-1 flex items-start justify-between gap-3">
                              <div className={`text-lg md:text-xl leading-relaxed script-text-default-font ${
                              isSelected
                                ? 'text-[#01579B] font-bold'
                                : 'text-[#0277BD]'
                            }`}>
                              {script.text}
                            </div>
                            {stickerSrc && (
                              <div
                                className="w-38 h-38 sticker-orbit-wrapper"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFlippedScriptId(prev => (prev === cardId ? null : cardId));
                                }}
                              >
                                <div className="sticker-orbit-glow" />
                                <img
                                  src={stickerSrc}
                                  alt="발음 스티커"
                                  className="planet-sticker"
                                />
                                <div className="sticker-star sticker-star-1" />
                                <div className="sticker-star sticker-star-2" />
                                <div className="sticker-star sticker-star-3" />
                              </div>
                            )}
                            </div>
                          </div>

                          {/* 뒷면: 점수 & 평가 */}
                          <div
                            className={`flip-card-back rounded-[14px] min-h-[140px] border-2 p-4 bg-white flex flex-col justify-center gap-2 border-[#01579B] shadow-lg ${
                              isRecentlyScored ? 'score-pop-enter' : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFlippedScriptId((prev) => (prev === cardId ? null : prev));
                            }}
                          >
                            {totalScore != null ? (
                              <>
                                <div className="flex items-center justify-between gap-3">
                                  <div className="text-2xl font-bold text-[#01579B]">
                                    나의 점수
                                  </div>
                                  <div className="text-2xl font-extrabold text-[#F57C00]">
                                    {totalScore}
                                  </div>
                                </div>
                                {/* 총 점수와 평가 문장만 표시 */}
                                {feedbackText && (
                                  <div className="mt-3 px-3 py-2 rounded-lg bg-[#FFFDE7] border border-[#FFD54F] text-[16px] text-[#F57C00] leading-relaxed line-clamp-3">
                                    {feedbackText}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-2xl text-center text-[#0277BD] leading-relaxed">
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
          userId={user?.userId ?? null}
          onAnalyzed={handleAnalysisComplete}
          onRecordingStart={handleRecordingStart}
          onContinueVideo={handleContinueVideo}
        />
      </div>

    </div>
  )
}

export default Player


