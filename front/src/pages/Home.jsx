
import { Link } from 'react-router-dom'

function Home() {
  return (
    <div>
      <h2 className="text-center font-extrabold tracking-tight">전래동화 시리즈</h2>
      <div className="flex justify-center mt-3 mb-5">
        <input className="w-[min(720px,90%)] bg-white border-2 border-[#a9b9d3] rounded-full px-4 py-3 text-sm" placeholder="동화를 검색해보세요" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <section className="grid gap-3">
          {[1, 2, 3, 4].map((i) => (
            <article className="rounded-[18px] overflow-hidden border-2 border-[#d7c6c6]" key={i}>
              <div className="h-[180px] bg-[url('/vite.svg')] bg-no-repeat bg-center bg-[length:60px_60px] opacity-70" style={{ backgroundColor: '#f4efe7' }} />
              <div className="flex items-center justify-between gap-3 px-3 py-3" style={{ background: '#f1f6ff' }}>
                <div>
                  <div className="font-extrabold mb-1">콩쥐 팥쥐</div>
                  <div className="text-muted text-xs">작은 장치와 잔잔한 재미, 한국의 이야기입니다.</div>
                </div>
                <Link to="/player" className="no-underline rounded-full px-4 py-2 font-extrabold border-2" style={{ background: '#ffe57a', borderColor: '#e0c354', color: '#3a3a3a' }}>재생</Link>
              </div>
            </article>
          ))}
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


