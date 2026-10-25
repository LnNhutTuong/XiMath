import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ArithmeticPracticePage from './pages/ArithmeticPracticePage'
import ComingSoonPage from './pages/ComingSoonPage'
import DailyPracticePage from './pages/DailyPracticePage'
import HomePage from './pages/HomePage'
import HistoryPage from './pages/HistoryPage'
import MultiplicationTablesPage from './pages/MultiplicationTablesPage'
import SettingsPage from './pages/SettingsPage'
import WelcomePage from './pages/WelcomePage'
import { useProfile } from './profile/useProfile'

export default function App() {
  const { name } = useProfile()
  if (!name) return <WelcomePage />

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="daily" element={<DailyPracticePage />} />
        <Route path="addition" element={<ArithmeticPracticePage kind="addition" />} />
        <Route path="subtraction" element={<ArithmeticPracticePage kind="subtraction" />} />
        <Route path="multiplication" element={<ArithmeticPracticePage kind="multiplication" />} />
        <Route path="division" element={<ArithmeticPracticePage kind="division" />} />
        <Route path="tables" element={<MultiplicationTablesPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<ComingSoonPage />} />
      </Route>
    </Routes>
  )
}
