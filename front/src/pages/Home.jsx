
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlayButton } from '../@design-system';
import { useContentsStore } from '../stores';

function Home() {
  const [searchInput, setSearchInput] = useState('');
  const { contents, searchQuery, isLoading, error, hasSearched, searchContents, clearError, clearSearch, } = useContentsStore();

  // 페이지 진입할 때 초기화 (홈 로고 클릭 시에도 반응)
  useEffect(() => {
    clearSearch();
    setSearchInput('');
  }, []);

  // 검색어 비워지면 자동으로 기본 리스트로 복귀
  useEffect(() => {
    if (!searchInput.trim()) {
      clearSearch();
    }
  }, [searchInput]);

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
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs hover:bg-blue-600"
            disabled={isLoading}
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
          {/* Show search results if available, otherwise show default content */}
          {hasSearched && contents.length > 0 ? (
            contents.map((content) => (
              <article className="rounded-[18px] overflow-hidden border-2 border-[#d7c6c6]" key={content.contentsId}>
                <div
                  className="h-[180px] bg-no-repeat bg-center bg-cover opacity-70"
                  style={{
                    backgroundColor: '#f4efe7',
                    backgroundImage: content.thumbUrl ? `url(${content.thumbUrl})` : "url('/vite.svg')"
                  }}
                />
                <div className="flex items-center justify-between gap-3 px-3 py-3" style={{ background: '#f1f6ff' }}>
                  <div>
                    <div className="font-extrabold mb-1">{content.title}</div>
                    <div className="text-muted text-xs">
                      {content.language && `언어: ${content.language.toUpperCase()}`}
                      {content.durationSec && ` • ${Math.floor(content.durationSec / 60)}분`}
                    </div>
                  </div>
                  <PlayButton to={`/player?contentId=${content.contentsId}`}>재생</PlayButton>
                </div>
              </article>
            ))
          ) : hasSearched && contents.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">검색 결과가 없습니다.</p>
            </div>
          ) : (
            // Default content when no search has been performed
            [1, 2, 3, 4].map((i) => (
              <article className="rounded-[18px] overflow-hidden border-2 border-[#d7c6c6]" key={i}>
                <div className="h-[180px] bg-[url('/vite.svg')] bg-no-repeat bg-center bg-[length:60px_60px] opacity-70" style={{ backgroundColor: '#f4efe7' }} />
                <div className="flex items-center justify-between gap-3 px-3 py-3" style={{ background: '#f1f6ff' }}>
                  <div>
                    <div className="font-extrabold mb-1">콩쥐 팥쥐</div>
                    <div className="text-muted text-xs">작은 장치와 잔잔한 재미, 한국의 이야기입니다.</div>
                  </div>
                  <PlayButton to="/player">재생</PlayButton>
                </div>
              </article>
            ))
          )}
        </section>

        <aside>
          <div className="sticky top-[90px] grid gap-2 rounded-[18px] p-4 border-2" style={{ background: '#e6eefc', borderColor: '#bfcde8' }}>
            <div className="font-extrabold text-[#5a6ea0]">나이별 추천동화</div>
            <div className="h-[160px] rounded-[14px] border-2 bg-white bg-[url('/vite.svg')] bg-no-repeat bg-center bg-[length:60px_60px]" style={{ borderColor: '#c9d6f2' }} />
            <div className="flex flex-wrap gap-2">
              {['2-4세', '4-5세', '7-9세', '10세이상'].map((t) => (
                <span className="px-3 py-1 rounded-full text-xs border-2 bg-white text-[#5a6ea0]" style={{ borderColor: '#c6ccee' }} key={t}>{t}</span>
              ))}
            </div>
            <div className="flex gap-1.5 justify-center">
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#9fb2e9' }} />
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#9fb2e9' }} />
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#9fb2e9' }} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Home


