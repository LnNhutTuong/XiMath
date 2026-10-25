import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ArithmeticPracticePage from './pages/ArithmeticPracticePage'
import ComingSoonPage from './pages/ComingSoonPage'
import HomePage from './pages/HomePage'
import MultiplicationTablesPage from './pages/MultiplicationTablesPage'
import WelcomePage from './pages/WelcomePage'
import { useProfile } from './profile/useProfile'

export default function App() {
  const { name } = useProfile()
  if (!name) return <WelcomePage />

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="addition" element={<ArithmeticPracticePage kind="addition" />} />
        <Route path="subtraction" element={<ArithmeticPracticePage kind="subtraction" />} />
        <Route path="multiplication" element={<ArithmeticPracticePage kind="multiplication" />} />
        <Route path="tables" element={<MultiplicationTablesPage />} />
        <Route path="*" element={<ComingSoonPage />} />
      </Route>
    </Routes>
  )
}
