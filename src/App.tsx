import { LessonProvider } from './state/LessonProvider'
import { LessonShell } from './components/LessonShell'

export default function App() {
  return (
    <LessonProvider lessonId="create-a-sidechain">
      <LessonShell />
    </LessonProvider>
  )
}
