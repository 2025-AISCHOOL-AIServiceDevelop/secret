import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SpeedButton, TagButton } from '../@design-system';
import { useContentsStore, useTranslationStore, useTutorStore, useAuthStore } from '../stores';

function Player() {
  const [searchParams] = useSearchParams();
  const contentId = searchParams.get('contentId');

  const { getContentById } = useContentsStore();
  const { scripts, isLoadingScripts, loadScripts, currentScript, getCurrentScript } = useTranslationStore();
  const { isAnalyzing, recordingState, startRecording, stopRecording, analyzePronunciation, currentFeedback } = useTutorStore();
  const { user } = useAuthStore();

  const [selectedScript, setSelectedScript] = useState(null);

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

  const handleRecordAndAnalyze = async () => {
    if (recordingState === 'idle' && user && contentId && displayScript) {
      // Start recording (in a real app, this would integrate with Web Audio API)
      startRecording();

      // Simulate recording for 3 seconds, then analyze
      setTimeout(async () => {
        stopRecording();

        // Create a dummy audio blob for demo (in real app, this would be actual recorded audio)
        const dummyAudioBlob = new Blob(['dummy audio data'], { type: 'audio/wav' });
        const dummyAudioFile = new File([dummyAudioBlob], 'recording.wav', { type: 'audio/wav' });

        try {
          await analyzePronunciation(
            dummyAudioFile,
            user.id || 1, // Use user ID from auth store
            parseInt(contentId),
            content?.language || 'en'
          );
        } catch (error) {
          console.error('Analysis failed:', error);
        }
      }, 3000);
    }
  };

  return (
    <div>
      <div className="font-black text-[#ffd857] text-[20px] mb-2">
        따라 해봐요! <span className="text-[#2c3a72] inline-block ml-2 text-[22px]">{displayScript ? `"${displayScript.text}"` : '"스크립트를 불러오는 중..."'}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        <section className="grid gap-3 rounded-[18px] p-3 border-2" style={{ background: '#e1e8ff', borderColor: '#b9c5ef' }}>
          <div className="h-[360px] rounded-[14px] grid place-items-center" style={{ background: 'linear-gradient(135deg, #6657c7, #6aa0ff)' }}>
            <div className="w-12 h-9 rounded bg-[#2b2b2b] shadow-inner" style={{ boxShadow: 'inset 0 8px 0 0 #dedede' }} />
          </div>
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 items-center">
            <button aria-label="play" className="w-9 h-9 rounded-full border-2" style={{ background: '#ffe182', borderColor: '#c9a94b' }} />
            <div className="h-2.5 rounded-full overflow-hidden border-2" style={{ background: '#f4f7ff', borderColor: '#c8d3f0' }}>
              <span className="block h-full" style={{ width: '40%', background: 'linear-gradient(90deg, #a9a3ff, #82b2ff)' }} />
            </div>
            <div className="text-[#6d7a9f] text-xs">02:45 / 08:30</div>
            <SpeedButton>느리게</SpeedButton>
          </div>
        </section>
        <aside className="grid gap-3 rounded-[18px] p-3 border-2" style={{ background: '#eef3ff', borderColor: '#c7d3f4' }}>
          <div className="font-black text-[#7d8db6]">따라서 말해봐요!</div>

          {/* Recording and Analysis Section */}
          <div className="grid gap-2">
            <button
              onClick={handleRecordAndAnalyze}
              disabled={isAnalyzing || recordingState === 'recording' || !user}
              className={`px-4 py-2 rounded-lg font-bold text-white ${
                recordingState === 'recording'
                  ? 'bg-red-500 animate-pulse'
                  : isAnalyzing
                  ? 'bg-yellow-500'
                  : !user
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {recordingState === 'recording' ? '녹음 중...' :
               isAnalyzing ? '분석 중...' :
               !user ? '로그인 필요' : '녹음 시작'}
            </button>

            {currentFeedback && (
              <div className="bg-white p-3 rounded-lg border">
                <h4 className="font-bold text-sm mb-2">발음 분석 결과</h4>
                <p className="text-xs text-gray-600">
                  점수: {currentFeedback.score || 'N/A'} / 정확도: {currentFeedback.accuracy || 'N/A'}
                </p>
                {currentFeedback.feedback && (
                  <p className="text-xs mt-2">{currentFeedback.feedback}</p>
                )}
              </div>
            )}
          </div>

          {/* Scripts List */}
          <div className="grid gap-2 max-h-[200px] card-scroll pr-1">
            {isLoadingScripts ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-xs mt-2">스크립트 로딩 중...</p>
              </div>
            ) : scripts.length > 0 ? (
              scripts.map((script) => (
                <div
                  key={script.id || script.orderNo}
                  onClick={() => setSelectedScript(script)}
                  className={`flex items-center justify-between gap-2 rounded-[12px] p-2 border-2 cursor-pointer transition-colors ${
                    selectedScript?.id === script.id || selectedScript?.orderNo === script.orderNo
                      ? 'bg-blue-100 border-blue-300'
                      : 'bg-white border-[#cfd9f4] hover:bg-gray-50'
                  }`}
                >
                  <div className="text-[#5c6d93] text-[13px] flex-1 truncate">{script.text}</div>
                  <SpeedButton>듣기</SpeedButton>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                스크립트를 불러올 수 없습니다.
              </div>
            )}
          </div>

          {/* Language Tags */}
          <div className="flex flex-wrap gap-2">
            {content?.language && <TagButton>{content.language.toUpperCase()}</TagButton>}
            <TagButton>영어</TagButton>
            <TagButton>한국어</TagButton>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Player


