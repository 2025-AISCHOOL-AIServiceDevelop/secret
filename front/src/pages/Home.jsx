
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlayButton } from '../@design-system';
import { useContentsStore } from '../stores';

function Home() {
  const [searchInput, setSearchInput] = useState('');
  const { contents, isLoading, error, hasSearched, searchContents, clearError, loadContents } = useContentsStore();

  const koreanContents = contents.filter(content => content.language === 'ko');


  // 페이지 진입할 때 콘텐츠 로드
  useEffect(() => {
    loadContents();
  }, [loadContents]);

  // 검색어 비워지면 자동으로 모든 콘텐츠로 복귀
  useEffect(() => {
    if (!searchInput.trim()) {
      loadContents();
    }
  }, [searchInput, loadContents]);

  // Handle search input
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      searchContents(searchInput.trim());
    }
  };

 

  return (
    <div className="container mx-auto">
      <h2 className="text-center font-extrabold tracking-tight">전래동화 시리즈</h2>
      <div className="flex justify-center mt-3 mb-5">
        <form onSubmit={handleSearch} className="w-[min(720px,90%)] relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-white border-2 border-[#a9b9d3] rounded-full px-4 py-3 text-sm pr-12"
            placeholder="동화를 검색해보세요"
            aria-label="동화 검색"
            role="searchbox"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
            aria-label={isLoading ? '검색 중' : '검색'}
          >
            {isLoading ? '검색중...' : '검색'}
          </button>
        </form>
      </div>

      {/* Error message */}
      {error && (
        <div className="text-center mb-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button onClick={clearError} className="ml-2 underline">닫기</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {isLoading ? (
            // Loading state
            Array.from({ length: 4 }).map((_, i) => (
              <article className="rounded-[18px] overflow-hidden border-2 border-[#d7c6c6] animate-pulse" key={i}>
                <div className="h-[180px] bg-gray-200" />
                <div className="flex items-center justify-between gap-3 px-3 py-3" style={{ background: '#f1f6ff' }}>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="w-16 h-8 bg-gray-200 rounded-full"></div>
                </div>
              </article>
            ))
          ) : contents.length > 0 ? (
            // Show contents
            koreanContents.map((content) => (
              <article
                className="rounded-[18px] overflow-hidden border-2 border-[#d7c6c6]"
                key={content.contentsId}
                role="article"
                aria-label={`${content.title} 동화`}
              >
                <div
                  className="h-[180px] bg-no-repeat bg-center bg-cover opacity-70"
                  style={{
                    backgroundColor: '#f4efe7',
                    backgroundImage: content.thumbUrl ? `url(${content.thumbUrl})` : "url('/vite.svg')"
                  }}
                  role="img"
                  aria-label={`${content.title} 썸네일`}
                />
                <div className="flex items-center justify-between gap-3 px-3 py-3" style={{ background: '#f1f6ff' }}>
                  <div>
                    <h3 className="font-extrabold mb-1">{content.title}</h3>
                    <div className="text-muted text-xs" aria-label="콘텐츠 정보">
                      {content.durationSec && `${Math.floor(content.durationSec / 60)}분`}
                    </div>
                  </div>
                  <PlayButton to={`/player?contentId=${content.contentsId}`} aria-label={`${content.title} 재생`}>재생</PlayButton>
                </div>
              </article>
            ))
          ) : hasSearched ? (
            // No search results
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">검색 결과가 없습니다.</p>
            </div>
          ) : (
            // No content available
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">표시할 콘텐츠가 없습니다.</p>
            </div>
          )}
        </section>

        <aside>
          <div className="sticky top-[90px] grid gap-2 rounded-[18px] p-4 border-2" style={{ background: '#e6eefc', borderColor: '#bfcde8' }}>
            <div className="font-extrabold text-[#5a6ea0]">나이별 추천동화</div>

            {/* Featured content preview */}
            {contents.length > 0 && (
              <div className="h-[160px] rounded-[14px] border-2 bg-white overflow-hidden" style={{ borderColor: '#c9d6f2' }}>
                <div
                  className="w-full h-full bg-no-repeat bg-center bg-cover opacity-70"
                  style={{
                    backgroundColor: '#f4efe7',
                    backgroundImage: contents[0].thumbUrl ? `url(${contents[0].thumbUrl})` : "url('/vite.svg')"
                  }}
                />
                <div className="p-2 bg-white bg-opacity-90">
                  <div className="font-bold text-xs text-[#5a6ea0] truncate">{contents[0].title}</div>
                  <div className="text-xs text-gray-600">
                    {contents[0].language && `언어: ${contents[0].language.toUpperCase()}`}
                  </div>
                </div>
              </div>
            )}

            {/* Age filter buttons */}
            <div className="flex flex-wrap gap-2">
              {['2-4세', '4-5세', '7-9세', '10세이상'].map((age) => (
                <button
                  key={age}
                  className="px-3 py-1 rounded-full text-xs border-2 bg-white text-[#5a6ea0] hover:bg-[#f0f4ff] transition-colors"
                  style={{ borderColor: '#c6ccee' }}
                  onClick={() => {
                    // TODO: 나이별 필터링 기능 구현
                    console.log(`${age} 콘텐츠 필터링`);
                  }}
                >
                  {age}
                </button>
              ))}
            </div>

            {/* Indicator dots */}
            <div className="flex gap-1.5 justify-center">
              <span className="inline-block w-2 h-2 rounded-full bg-[#9fb2e9]" />
              <span className="inline-block w-2 h-2 rounded-full bg-[#9fb2e9] opacity-50" />
              <span className="inline-block w-2 h-2 rounded-full bg-[#9fb2e9] opacity-50" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Home


