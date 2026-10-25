import { useContext } from 'react'
import { LearningContext } from './learningContext'

export function useLearning() {
  const context = useContext(LearningContext)
  if (!context) throw new Error('useLearning phải được dùng bên trong LearningProvider.')
  return context
}
