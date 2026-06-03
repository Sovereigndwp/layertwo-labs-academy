import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react'
import { lessonReducer } from './lessonReducer'
import { initialLessonState, type LessonAction, type LessonState } from './types'

const STORAGE_KEY = 'l2l:create-a-sidechain:v1'

interface LessonContextValue {
  state: LessonState
  dispatch: React.Dispatch<LessonAction>
}

const LessonContext = createContext<LessonContextValue | null>(null)

function loadInitial(): LessonState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialLessonState
    const saved = JSON.parse(raw) as Partial<LessonState>
    // Merge so new fields added later still get sane defaults.
    return { ...initialLessonState, ...saved }
  } catch {
    return initialLessonState
  }
}

export function LessonProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    lessonReducer,
    initialLessonState,
    loadInitial,
  )

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage may be unavailable (private mode); progress just won't persist.
    }
  }, [state])

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
