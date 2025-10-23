function Player() {
  return (
    <div>
      <div className="font-black text-[#ffd857] text-[20px] mb-2">
        따라 해봐요! <span className="text-[#2c3a72] inline-block ml-2 text-[22px]">“A new village has emerged against the ancient enemy.”</span>
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
            <button className="rounded-[10px] px-3 py-2 text-sm font-bold border-2 bg-white" style={{ borderColor: '#c9d2f1', color: '#4a5b82' }}>느리게</button>
          </div>
        </section>
        <aside className="grid gap-3 rounded-[18px] p-3 border-2" style={{ background: '#eef3ff', borderColor: '#c7d3f4' }}>
          <div className="font-black text-[#7d8db6]">따라서 말해봐요!</div>
          <div className="grid gap-2 max-h-[320px] overflow-auto pr-1 scrollbar-soft">
            {[1,2,3,4].map((n)=> (
              <div className="flex items-center justify-between gap-2 rounded-[12px] p-2 border-2 bg-white" style={{ borderColor: '#cfd9f4' }} key={n}>
                <div className="text-[#5c6d93] text-[13px]">첫째 장면의 한 줄에서 작은 단어들이 섞여 있습니다.</div>
                <button className="rounded-[10px] px-3 py-2 text-sm font-bold border-2 bg-white" style={{ borderColor: '#c9d2f1', color: '#4a5b82' }}>듣기</button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {['한국어','영어','중국어','일본어','스페인어','한국어','한국어'].map((t,idx)=> (
              <span className="px-3 py-1 rounded-full text-xs border-2 bg-white text-[#5a6ea0]" style={{ borderColor: '#c6ccee' }} key={t+idx}>{t}</span>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Player


