import { Outlet } from 'react-router-dom'
import './App.css'
import { Header, Footer } from './@design-system'

function App() {
  return (
    <div className="min-h-dvh grid grid-rows-[auto_1fr_auto]">
      <Header />

      <main className="w-full max-w-screen-2xl mx-auto p-5">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default App
