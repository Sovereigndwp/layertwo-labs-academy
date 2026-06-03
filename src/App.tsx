import { useState } from 'react'
import { LessonProvider } from './state/LessonProvider'
import { LessonShell } from './components/LessonShell'
import { LessonHome } from './components/LessonHome'

export default function App() {
  const [activeLesson, setActiveLesson] = useState<string | null>(null)

  if (!activeLesson) return <LessonHome onPick={setActiveLesson} />

  return (
    <LessonProvider lessonId={activeLesson}>
      <LessonShell />
    </LessonProvider>
  )
}
