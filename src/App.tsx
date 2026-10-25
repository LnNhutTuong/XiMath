import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ComingSoonPage from './pages/ComingSoonPage'
import HomePage from './pages/HomePage'
import WelcomePage from './pages/WelcomePage'
import { useProfile } from './profile/useProfile'

export default function App() {
  const { name } = useProfile()
  if (!name) return <WelcomePage />

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="*" element={<ComingSoonPage />} />
      </Route>
    </Routes>
  )
}
