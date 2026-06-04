import {
  initialLessonState,
  TOTAL_BLOCKS,
  type LessonAction,
  type LessonState,
} from './types'
import { lessonData } from '../data/lessonData'

const LAST_STEP = lessonData.steps.length - 1

function clampStep(step: number): number {
  return Math.max(0, Math.min(LAST_STEP, step))
}

/**
 * Pure reducer for the whole lesson. Side effects (localStorage) live in the
 * provider, never here — this stays testable in isolation.
 */
export function lessonReducer(
  state: LessonState,
  action: LessonAction,
): LessonState {
  switch (action.type) {
    case 'GO_TO_STEP':
      return { ...state, lessonStep: clampStep(action.step) }

    case 'NEXT_STEP':
      return { ...state, lessonStep: clampStep(state.lessonStep + 1) }

    case 'PREV_STEP':
      return { ...state, lessonStep: clampStep(state.lessonStep - 1) }

    case 'SELECT_SLOT':
      return { ...state, selectedSlot: action.slot }

    case 'SET_SIDECHAIN_NAME':
      return { ...state, sidechainName: action.name }

    case 'SET_ADDRESS_BYTES':
      return {
        ...state,
        addressBytes: action.tag,
        isAddressBytesUnique: action.unique,
      }

    case 'SELECT_RELEASE':
      return { ...state, selectedRelease: action.releaseId }

    case 'MINE_BLOCKS': {
      const win = state.ackWindow.map((r) => ({ ...r }))
      const last = win[win.length - 1]
      if (last && last.acked === action.supporting) {
        last.n += action.amount
      } else {
        win.push({ acked: action.supporting, n: action.amount })
      }
      // Evict oldest blocks so the window holds at most TOTAL_BLOCKS.
      let total = win.reduce((s, r) => s + r.n, 0)
      while (total > TOTAL_BLOCKS && win.length > 0) {
        const over = total - TOTAL_BLOCKS
        if (win[0].n <= over) {
          total -= win[0].n
          win.shift()
        } else {
          win[0].n -= over
          total -= over
        }
      }
      const ackCount = win.reduce((s, r) => s + (r.acked ? r.n : 0), 0)
      return { ...state, ackWindow: win, ackCount }
    }

    case 'RESET_ACKS':
      return { ...state, ackWindow: [], ackCount: 0 }

    case 'SET_ACK_THRESHOLD':
      return {
        ...state,
        ackThreshold: Math.max(1008, Math.min(2016, action.count)),
      }

    case 'SET_ACTIVATION':
      return { ...state, activationStatus: action.status }

    case 'SET_NODE_CONNECTED':
      return { ...state, nodeConnected: action.connected }

    case 'ANSWER_QUIZ': {
      const others = state.quizAnswers.filter(
        (a) => a.questionId !== action.questionId,
      )
      return {
        ...state,
        quizAnswers: [
          ...others,
          { questionId: action.questionId, choiceId: action.choiceId },
        ],
      }
    }

    case 'OPEN_GLOSSARY':
      return {
        ...state,
        glossaryOpen: true,
        glossaryFocusTerm: action.termId ?? null,
      }

    case 'CLOSE_GLOSSARY':
      return { ...state, glossaryOpen: false, glossaryFocusTerm: null }

    case 'UNLOCK_ADVANCED':
      return { ...state, advancedUnlocked: true }

    case 'RESET':
      return { ...initialLessonState }

    default:
      return state
  }
}
