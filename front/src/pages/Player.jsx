import { SpeedButton, TagButton } from '../@design-system'

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
            <SpeedButton>느리게</SpeedButton>
          </div>
        </section>
        <aside className="grid gap-3 rounded-[18px] p-3 border-2" style={{ background: '#eef3ff', borderColor: '#c7d3f4' }}>
          <div className="font-black text-[#7d8db6]">따라서 말해봐요!</div>
          <div className="grid gap-2 max-h-[320px] card-scroll pr-1">
            {[
              "첫째 장면의 한 줄에서 작은 단어들이 섞여 있습니다.",
              "둘째 장면에서는 영웅이 등장해서 모험을 시작합니다.",
              "셋째 장면에서 친구들을 만나 새로운 동료가 생깁니다.",
              "넷째 장면은 위험한 상황에서 벗어나는 긴박한 순간입니다.",
              "다섯째 장면에서 마법의 물건을 발견하게 됩니다.",
              "여섯째 장면은 모두가 함께 모여 축하하는 장면입니다.",
              "일곱째 장면에서 새로운 도전이 기다리고 있습니다.",
              "여덟째 장면은 친구들과 함께하는 즐거운 시간입니다."
            ].map((text, n)=> (
              <div className="flex items-center justify-between gap-2 rounded-[12px] p-2 border-2 bg-white" style={{ borderColor: '#cfd9f4' }} key={n}>
                <div className="text-[#5c6d93] text-[13px]">{text}</div>
                <SpeedButton>듣기</SpeedButton>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {['한국어','영어','중국어','일본어','스페인어','한국어','한국어'].map((t,idx)=> (
              <TagButton key={t+idx}>{t}</TagButton>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Player


