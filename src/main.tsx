import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { ProfileProvider } from './profile/ProfileProvider'
import { LearningProvider } from './services/LearningProvider'
import { Toaster } from './components/ui/Toaster'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProfileProvider>
      <LearningProvider>
        <BrowserRouter>
          <App />
          <Toaster />
        </BrowserRouter>
      </LearningProvider>
    </ProfileProvider>
  </StrictMode>,
)
