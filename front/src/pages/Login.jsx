function Login() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-center">
      <div className="min-h-[380px] rounded-[18px] p-10 grid place-items-center text-center border-2" style={{ background: '#bdd0f2', borderColor: '#9fb2d9' }}>
        <div className="w-[180px] h-[180px] rounded-full" style={{ background: 'radial-gradient(circle at 30% 30%, #ffffff, #b7c6ea 60%, #9ab0e0)', boxShadow: 'inset 0 10px 0 0 rgba(159,178,217,.4)' }} />
        <div className="mt-5 font-black text-[36px] text-[#e9e3ff]" style={{ textShadow: '0 2px 0 #6f58b1' }}>두근두근 지구말</div>
        <div className="text-[#586b93]">어린이를 위한 다국어 학습 플랫폼</div>
      </div>
      <div className="rounded-[18px] p-6 grid gap-3 border-2" style={{ background: '#e1ecff', borderColor: '#b7c5e9' }}>
        <div className="flex gap-3">
          <button className="flex-1 rounded-full px-3 py-2 font-extrabold border-2" style={{ background: '#f8f4e9', borderColor: '#bfb3a1' }}>로그인</button>
          <button className="flex-1 rounded-full px-3 py-2 font-extrabold border-2 bg-white" style={{ borderColor: '#bfb3a1' }}>회원가입</button>
        </div>
        <button className="rounded-[12px] px-4 py-3 font-extrabold border-2" style={{ background: '#fff3a8', borderColor: '#d2c277' }}>카카오 계정으로 로그인</button>
        <button className="rounded-[12px] px-4 py-3 font-extrabold border-2 bg-white" style={{ borderColor: '#d2c277' }}>Google 계정으로 로그인</button>
        <div className="w-[120px] h-[120px] justify-self-center mt-2 rounded-[16px] border-2 border-dashed bg-[#f0f0f0] bg-[url('/vite.svg')] bg-no-repeat bg-center bg-[length:60px_60px]" />
      </div>
    </div>
  )
}

export default Login


