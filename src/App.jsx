import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/home/home'
import Chat from './pages/chats/chat'
import Nabvar from './components/nabvar/nabvar'
import Footer from './components/footer/footer'
import Header from './components/header/header'
import JobPostingForm from './pages/forms/JobPostingForm'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Nabvar />
      {/* Rutas */}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/chat' element={<Chat />} />
        <Route path='/job-form' element={<JobPostingForm />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
