import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Play,
  Pause,
  Gauge,
  Mic,
  X,
  Film,
  FileText,
  Inbox,
} from 'lucide-react';
import {
  useContentsStore,
  useTranslationStore,
  useTutorStore,
  useAuthStore,
} from '../stores';
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
  const {
    scripts,
    isLoadingScripts,
    loadScripts,
    getCurrentScript,
  } = useTranslationStore();
  const { currentFeedback, feedbackHistory } = useTutorStore();
  const { user } = useAuthStore();

  const videoRef = useRef(null);
  const videoSectionRef = useRef(null);

  const [selectedScript, setSelectedScript] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // URL ?lang=en-US 또는 en 형태 모두 지원 → 기본은 ko
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    if (!initialLangParam) return 'ko';
    return initialLangParam.toLowerCase().split('-')[0];
  });
  const [pausedScriptIds, setPausedScriptIds] = useState(new Set());
  const [recordingPromptVisible, setRecordingPromptVisible] =
    useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: '영어', flag: '🇺🇸' },
    { code: 'zh', name: '중국어', flag: '🇨🇳' },
    { code: 'ja', name: '일본어', flag: '🇯🇵' },
    { code: 'vi', name: '베트남어', flag: '🇻🇳' },
    { code: 'ru', name: '러시아어', flag: '🇷🇺' },
    { code: 'th', name: '태국어', flag: '🇹🇭' },
  ];

  // 1) 컨텐츠 목록이 없으면 로드
  useEffect(() => {
    if (contentId && contents.length === 0) {
      loadContents();
    }
  }, [contentId, contents.length, loadContents]);

  // 현재 선택된 콘텐츠(쿼리 파라미터 기준)
  const baseContent = contentId
    ? getContentById(parseInt(contentId, 10))
    : null;

  // 언어별로 올바른 contentsId를 찾기 위한 헬퍼
  const effectiveContent = useMemo(() => {
    if (!baseContent) return null;

    const langCode = (selectedLanguage || '').toLowerCase();
    const rootId = baseContent.parentId || baseContent.contentsId;

    const relatedContents = contents.filter(
      (c) =>
        c &&
        (c.contentsId === rootId || c.parentId === rootId),
    );

    const exactMatch = relatedContents.find(
      (c) => (c.language || '').toLowerCase() === langCode,
    );

    // 정확히 일치하는 언어가 없으면 기본 콘텐츠 사용
    return exactMatch || baseContent;
  }, [baseContent, contents, selectedLanguage]);

  // 선택된 언어/콘텐츠 기준 스크립트 로딩
  useEffect(() => {
    if (effectiveContent && selectedLanguage) {
      loadScripts(effectiveContent.contentsId, selectedLanguage);
    }
  }, [effectiveContent, selectedLanguage, loadScripts]);

  // 초기 선택 스크립트
  useEffect(() => {
    if (scripts.length > 0 && !selectedScript) {
      setSelectedScript(scripts[0]);
    }
  }, [scripts, selectedScript]);

  const content = effectiveContent || baseContent;
  const displayScript = selectedScript || getCurrentScript();

  // 현재 콘텐츠/사용자 기준 스크립트별 최신 피드백 맵
  const scriptFeedbackMap = useMemo(() => {
    if (
      !user ||
      !content?.contentsId ||
      scripts.length === 0 ||
      !feedbackHistory
    )
      return {};

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
    const scriptKey =
      result?.scriptId ?? script?.scriptId ?? script?.id ?? null;
    setAnalysisResult({
      ...result,
      scriptId: scriptKey,
      scriptText: result?.scriptText || script?.text || '',
    });
  };

  // 피드백 변경 시 분석 결과 상태 갱신
  useEffect(() => {
    if (!currentFeedback) return;

    setAnalysisResult((prev) => {
      if (prev?.feedbackId === currentFeedback.feedbackId) {
        return prev;
      }

      const scriptTextFallback =
        currentFeedback.scriptText ||
        selectedScript?.text ||
        prev?.scriptText ||
        '';

      return {
        ...currentFeedback,
        scriptText: scriptTextFallback,
      };
    });
  }, [currentFeedback, selectedScript]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
  };

  // 재생 위치 업데이트 + localStorage 저장 + 스크립트 싱크
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    const time = video.currentTime;
    const total = video.duration || 0;

    setCurrentTime(time);
    setDuration(total);

    // 시청 위치 저장
    if (user && contentId && total > 0) {
      const storageKey = `watch_${user.id}_${contentId}`;
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          watchedSeconds: time,
          totalSeconds: total,
        }),
      );
    }

    // 자막 싱크
    const currentMs = time * 1000;
    const activeScript = scripts.find(
      (s) => currentMs >= s.startMs && currentMs < s.endMs,
    );

    if (activeScript) {
      const scriptId = activeScript.scriptId || activeScript.id;

      if (
        !selectedScript ||
        (selectedScript.scriptId || selectedScript.id) !== scriptId
      ) {
        setSelectedScript(activeScript);

        // 각 스크립트 구간에서 한 번만 멈추기
        if (!pausedScriptIds.has(scriptId)) {
          video.pause();
          setIsPlaying(false);
          setRecordingPromptVisible(true);
          setPausedScriptIds((prev) => new Set([...prev, scriptId]));

          setTimeout(() => {
            setRecordingPromptVisible(false);
          }, 10000);
        }
      }
    }
  };

  // 메타데이터 로드 후 이어보기 위치로 점프
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    const total = video.duration || 0;
    setDuration(total);

    if (!user || !contentId) return;

    const storageKey = `watch_${user.id}_${contentId}`;
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;

    try {
      const { watchedSeconds } = JSON.parse(saved);
      if (
        typeof watchedSeconds === 'number' &&
        watchedSeconds > 0 &&
        watchedSeconds < total
      ) {
        video.currentTime = watchedSeconds;
        setCurrentTime(watchedSeconds);
      }
    } catch (e) {
      console.error('resume progress parse error', e);
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changeSpeed = () => {
    const speeds = [1, 0.75, 0.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];

    setPlaybackSpeed(newSpeed);

    const video = videoRef.current;
    if (video) {
      video.playbackRate = newSpeed;
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const videoUrl = content?.contentsId
    ? `${API_BASE_URL}/api/media/${content.contentsId}`
    : null;

  const handleRecordingStart = () => {
    setRecordingPromptVisible(false);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
    const video = videoRef.current;
    if (video && video.currentTime < 1) {
      setPausedScriptIds(new Set());
    }
  };

  const handleContinueVideo = () => {
    if (videoSectionRef.current) {
      videoSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    const video = videoRef.current;
    if (video) {
      video.play();
      setIsPlaying(true);
    }
  };

  // JSX
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* 상단 영상 + 스크립트 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        {/* 왼쪽: 비디오 플레이어 */}
        <section
          ref={videoSectionRef}
          className="flex flex-col gap-3 rounded-[18px] p-4 border-2"
          style={{ background: '#e1e8ff', borderColor: '#b9c5ef' }}
        >
          <div
            className="rounded-[14px] overflow-hidden bg-black relative w-full"
            style={{ aspectRatio: '16/9' }}
          >
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

                {recordingPromptVisible && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#FFE082] to-[#FFECB3] border-3 border-[#FFD54F] text-[#F57C00] px-6 py-3 rounded-full shadow-2xl animate-bounce flex items-center gap-3 z-10">
                    <Mic className="w-6 h-6" />
                    <div>
                      <div className="font-bold text-sm">
                        이 문장을 따라 말해보세요!
                      </div>
                      <div className="text-xs opacity-80">
                        아래 녹음 버튼을 클릭하세요
                      </div>
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
              <div
                className="w-full h-full grid place-items-center"
                style={{
                  background:
                    'linear-gradient(135deg, #6657c7, #6aa0ff)',
                }}
              >
                <div className="text-center text-white">
                  <Film className="w-20 h-20 mb-4 mx-auto animate-pulse" />
                  <div className="text-lg font-bold">
                    비디오를 불러오는 중...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 컨트롤 바 */}
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-3 items-center mt-2">
            <button
              onClick={togglePlayPause}
              disabled={!videoUrl}
              aria-label={isPlaying ? 'pause' : 'play'}
              className="group relative w-14 h-14 rounded-full flex items-center justify-center disabled:opacity-50 transition-all hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              style={{
                background:
                  'linear-gradient(135deg, #FFE082 0%, #FFECB3 100%)',
                border: '3px solid #FFD54F',
              }}
            >
              <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-30 transition-opacity" />
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
                  width:
                    duration > 0
                      ? (currentTime / duration) * 100 + '%'
                      : '0%',
                  background:
                    'linear-gradient(90deg, #81D4FA, #FFE082)',
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
              {playbackSpeed === 1
                ? '보통'
                : playbackSpeed === 0.75
                ? '느리게'
                : '아주 느리게'}
            </button>
          </div>
        </section>

        {/* 오른쪽: 스크립트 목록 */}
        <aside className="flex flex-col gap-3">
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
                <div className="text-[9px] leading-tight">
                  {lang.name}
                </div>
              </button>
            ))}
          </div>

          {/* 스크립트 목록 */}
          <div
            className="bg-white rounded-[14px] border-2 p-4"
            style={{
              borderColor: '#c8d3f0',
              maxHeight: '700px',
              overflowY: 'auto',
            }}
          >
            <div className="text-sm text-gray-600 font-bold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              전체 스크립트
            </div>

            <div className="space-y-2.5">
              {isLoadingScripts ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
                  <p className="text-sm mt-3 text-gray-600">
                    스크립트 로딩 중...
                  </p>
                </div>
              ) : scripts.length > 0 ? (
                scripts.map((script, index) => {
                  const isSelected =
                    selectedScript &&
                    ((script.scriptId &&
                      selectedScript.scriptId === script.scriptId) ||
                      (script.id &&
                        selectedScript.id === script.id) ||
                      (selectedScript.orderNo === script.orderNo &&
                        selectedScript.contentsId ===
                          script.contentsId));

                  const scriptKey = script.scriptId ?? script.id;
                  const feedbackForScript =
                    scriptKey != null
                      ? scriptFeedbackMap[Number(scriptKey)]
                      : null;
                  const latestMedal =
                    feedbackForScript?.medal ||
                    (analysisResult &&
                    analysisResult.scriptId === scriptKey
                      ? analysisResult.medal
                      : null);
                  const stickerSrc = latestMedal
                    ? getStickerByMedal(latestMedal)
                    : null;

                  return (
                    <div
                      key={
                        script.scriptId ||
                        script.id ||
                        `${script.contentsId}-${script.orderNo}`
                      }
                      onClick={() => setSelectedScript(script)}
                      className={`rounded-[12px] p-3 border-2 cursor-pointer transition-all flex-shrink-0 ${
                        isSelected
                          ? 'bg-white border-[#01579B] shadow-xl'
                          : 'bg-[#E1F5FE] border-[#B3E5FC]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                            isSelected
                              ? 'bg-[#01579B] text-white'
                              : 'bg-[#B3E5FC] text-[#01579B]'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1 flex items-center justify-between gap-2">
                          <div
                            className={`text-sm leading-relaxed transition-all ${
                              isSelected
                                ? 'text-[#01579B] font-bold'
                                : 'text-[#0277BD]'
                            }`}
                          >
                            {script.text}
                          </div>
                          {stickerSrc && (
                            <img
                              src={stickerSrc}
                              alt="발음 스티커"
                              className="w-10 h-10 object-contain drop-shadow-sm"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 flex-shrink-0">
                  <Inbox className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <div className="text-xs text-gray-500">
                    스크립트를 불러올 수 없습니다.
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* 하단: 음성 녹음 배너 */}
      <div className="h-[180px]">
        <VoiceRecordingBanner
          script={displayScript}
          contentsId={
            content?.contentsId ||
            (contentId ? parseInt(contentId, 10) : undefined)
          }
          language={selectedLanguage}
          userId={user?.id || 1}
          onAnalyzed={handleAnalysisComplete}
          onRecordingStart={handleRecordingStart}
          onContinueVideo={handleContinueVideo}
        />
      </div>
    </div>
  );
}

export default Player;
