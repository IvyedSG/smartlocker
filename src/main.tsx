import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './assets/main.css'
import App from './App.tsx'
import HistoryDashboard from './pages/HistoryDashboard.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<HistoryDashboard />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
