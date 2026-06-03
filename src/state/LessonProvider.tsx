import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react'
import { lessonReducer } from './lessonReducer'
import { initialLessonState, STORAGE_VERSION, type LessonAction, type LessonState } from './types'

interface LessonContextValue {
  state: LessonState
  dispatch: React.Dispatch<LessonAction>
}

const LessonContext = createContext<LessonContextValue | null>(null)

export function LessonProvider({
  lessonId,
  children,
}: {
  lessonId: string
  children: ReactNode
}) {
  const storageKey = `l2l:lesson:${lessonId}:v${STORAGE_VERSION}`

  const [state, dispatch] = useReducer(lessonReducer, initialLessonState, () => {
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
    <LessonContext.Provider value={{ state, dispatch }}>
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
