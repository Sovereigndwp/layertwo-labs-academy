import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react'
import { lessonReducer } from './lessonReducer'
import { initialLessonState, STORAGE_VERSION, type LessonAction, type LessonState } from './types'
import { lessonsById } from '../data/registry'
import type { LessonData } from '../data/lessonData'

interface LessonContextValue {
  state: LessonState
  dispatch: React.Dispatch<LessonAction>
  /** The active lesson's content. The engine is lesson-agnostic; every renderer
   *  reads its copy/data from here rather than a hardcoded import. */
  lesson: LessonData
}

const LessonContext = createContext<LessonContextValue | null>(null)

export function LessonProvider({
  lessonId,
  children,
}: {
  lessonId: string
  children: ReactNode
}) {
  const lesson = lessonsById[lessonId]
  if (!lesson) throw new Error(`Unknown lessonId: ${lessonId}`)

  const storageKey = `l2l:lesson:${lessonId}:v${STORAGE_VERSION}`

  // Clamp step transitions to *this* lesson's length (lessons differ in size).
  const stepCount = lesson.steps.length
  const reducer = useCallback(
    (s: LessonState, a: LessonAction) => lessonReducer(s, a, stepCount),
    [stepCount],
  )

  const [state, dispatch] = useReducer(reducer, initialLessonState, () => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return initialLessonState
      const saved = JSON.parse(raw) as Partial<LessonState>
      return { ...initialLessonState, ...saved }
    } catch {
      return initialLessonState
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state))
    } catch {
      // storage unavailable (private mode) — progress just won't persist
    }
  }, [state, storageKey])

  return (
    <LessonContext.Provider value={{ state, dispatch, lesson }}>
      {children}
    </LessonContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLesson(): LessonContextValue {
  const ctx = useContext(LessonContext)
  if (!ctx) throw new Error('useLesson must be used inside <LessonProvider>')
  return ctx
}
