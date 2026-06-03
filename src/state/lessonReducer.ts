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

function clampAck(count: number): number {
  return Math.max(0, Math.min(TOTAL_BLOCKS, count))
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

    case 'SET_ACK_COUNT':
      return { ...state, ackCount: clampAck(action.count) }

    case 'MINE_BLOCKS':
      return { ...state, ackCount: clampAck(state.ackCount + action.amount) }

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
