import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2, AlertCircle, X } from 'lucide-react';
import { PlayButton } from '../@design-system';
import { useContentsStore } from '../stores';
import mascotImg from '../assets/mascot.png';
import saturn from '../assets/saturn.png';

function Home() {
  const [searchInput, setSearchInput] = useState('');
  const { contents, isLoading, error, hasSearched, searchContents, clearError, loadContents } = useContentsStore();

  const koreanContents = contents.filter(content => content.language === 'ko');

  useEffect(() => {
    loadContents();
  }, [loadContents]);

  useEffect(() => {
    if (!searchInput.trim()) {
      loadContents();
    }
  }, [searchInput, loadContents]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      searchContents(searchInput.trim());
    }
  };

  return (
    <div className="container mx-auto">
    <div className="relative mb-8 pt-7 text-center">
      {/* 토성 아이콘 */}
      <img
        src={saturn}
        alt="토성 아이콘"
        aria-hidden="true"
        className="absolute left-1/2 -translate-x-1/2 -top-[0.5px] h-auto max-w-[34px] drop-shadow"
      />

      {/* 메인 제목 */}
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
            className="w-full bg-white border-2 border-[#a9b9d3] rounded-full px-4 py-3 text-sm pr-12"
            placeholder="동화를 검색해보세요"
            aria-label="동화 검색"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:shadow-lg transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                검색중...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                검색
              </>
            )}
          </button>
        </form>
      </div>

      {/* 에러 */}
      {error && (
        <div className="text-center mb-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button onClick={clearError} className="ml-2 hover:bg-red-200 p-1 rounded transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 콘텐츠 + 오른쪽 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        
        {/* === 동화 목록 === */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <article key={i} className="rounded-[18px] overflow-hidden border-2 border-[#d7c6c6] animate-pulse">
                <div className="h-[180px] bg-gray-200" />
                <div className="px-3 py-3 bg-[#f1f6ff]">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </article>
            ))
          ) : contents.length > 0 ? (
            koreanContents.map((content) => (
              <article
                className="rounded-[18px] overflow-hidden border-2 border-[#d7c6c6]"
                key={content.contentsId}
              >

                <Link to={`/player?contentId=${content.contentsId}`}>

                <div
                  className="relative h-[300px] bg-no-repeat bg-center bg-cover cursor-pointer hover:opacity-100 transition"
                  style={{
                    backgroundColor: '#f4efe7',
                    backgroundImage: content.thumbUrl
                      ? `url(${content.thumbUrl})`
                      : "url('/vite.svg')"
                  }}
                >

                  {/* 🔥 업그레이드된 영상 길이 배지 */}
                  {content.durationSec && (
                    <span
                      className="
                        absolute bottom-3 right-3
                        bg-black/30
                        text-white text-sm font-semibold
                        px-3 py-1.5 
                        rounded-md
                        backdrop-blur-sm
                      "
                    >
                      {Math.floor(content.durationSec / 60)}:
                      {String(content.durationSec % 60).padStart(2, '0')}
                    </span>

                  )}


                </div>

              </Link>


                {/* 제목 + 시간 */}
                <div className="flex items-center justify-between gap-3 px-3 py-3 bg-[#f1f6ff]">
                  <div>
                    <h3 className="font-extrabold mb-1">{content.title}</h3>                    
                  </div>
                </div>

              </article>
            ))
          ) : hasSearched ? (
            <div className="col-span-full text-center py-8 text-gray-500">검색 결과가 없습니다.</div>
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">표시할 콘텐츠가 없습니다.</div>
          )}
        </section>

        {/* === 오른쪽 추천 영역 === */}
        <aside>

          {/* 추천 박스 */}
          <div
            className="sticky top-[90px] grid gap-2 rounded-[18px] p-4 border-2"
            style={{ background: '#e6eefc', borderColor: '#bfcde8' }}
          >
            <div className="font-extrabold text-[#5a6ea0]">나이별 추천동화</div>

            {contents.length > 0 && (
              <div className="h-[160px] rounded-[14px] border-2 bg-white overflow-hidden" style={{ borderColor: '#c9d6f2' }}>
                <div
                  className="w-full h-full bg-no-repeat bg-center bg-cover opacity-70"
                  style={{
                    backgroundColor: '#f4efe7',
                    backgroundImage: contents[0].thumbUrl
                      ? `url(${contents[0].thumbUrl})`
                      : "url('/vite.svg')"
                  }}
                />
                <div className="p-2 bg-white bg-opacity-90">
                  <div className="font-bold text-xs text-[#5a6ea0] truncate">{contents[0].title}</div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {['2-4세', '4-5세', '7-9세', '10세이상'].map((age) => (
                <button
                  key={age}
                  className="px-3 py-1 rounded-full text-xs border-2 bg-white text-[#5a6ea0]"
                  style={{ borderColor: '#c6ccee' }}
                >
                  {age}
                </button>
              ))}
            </div>

            <div className="flex gap-1.5 justify-center">
              <span className="inline-block w-2 h-2 rounded-full bg-[#9fb2e9]" />
              <span className="inline-block w-2 h-2 rounded-full bg-[#9fb2e9] opacity-50" />
              <span className="inline-block w-2 h-2 rounded-full bg-[#9fb2e9] opacity-50" />
            </div>
          </div>

          {/* 마스코트 + 말풍선 */}
          <div className="sticky top-[360px] mt-6 flex flex-col items-center">

            <div className="relative bg-white rounded-2xl px-4 py-3 shadow-md text-sm text-gray-700 border border-[#d3dff7] w-[240px]">
              🌍 전래동화를 다양한 언어로 배워보세요!
              <span className="absolute -bottom-2 left-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white"></span>
            </div>

            <img 
              src={mascotImg} 
              alt="Mascot" 
              className="w-32 mt-3 drop-shadow-lg animate-bounce-slow"
            />

          </div>

        </aside>
      </div>
    </div>
  );
}

export default Home;
