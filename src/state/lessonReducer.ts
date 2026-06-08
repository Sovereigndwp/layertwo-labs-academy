import {
  initialLessonState,
  TOTAL_BLOCKS,
  type LessonAction,
  type LessonState,
} from './types'

/**
 * Clamp a step index into [0, stepCount-1]. `stepCount` is supplied by the
 * provider from the *active* lesson, so the engine is lesson-agnostic (lessons
 * have different step counts). When omitted (e.g. in unit tests), only the
 * lower bound is enforced.
 */
function clampStep(step: number, stepCount?: number): number {
  const upper = stepCount === undefined ? Infinity : stepCount - 1
  return Math.max(0, Math.min(upper, step))
}

/**
 * In BIP300, activation is automatic: the instant sustained ACK support
 * crosses the threshold, every node's rules recognize the slot as active on
 * their own. Activation is also permanent — once flipped, it does not revert
 * if support later decays.
 */
function withAutoActivation(state: LessonState): LessonState {
  if (state.activationStatus !== 'active' && state.ackCount >= state.ackThreshold) {
    return { ...state, activationStatus: 'active' }
  }
  return state
}

/**
 * Pure reducer for the whole lesson. Side effects (localStorage) live in the
 * provider, never here — this stays testable in isolation.
 */
export function lessonReducer(
  state: LessonState,
  action: LessonAction,
  stepCount?: number,
): LessonState {
  switch (action.type) {
    case 'GO_TO_STEP':
      return { ...state, lessonStep: clampStep(action.step, stepCount) }

    case 'NEXT_STEP':
      return { ...state, lessonStep: clampStep(state.lessonStep + 1, stepCount) }

    case 'PREV_STEP':
      return { ...state, lessonStep: clampStep(state.lessonStep - 1, stepCount) }

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

    case 'EXPLORE_LAYER':
      return state.exploredLayers.includes(action.layerId)
        ? state
        : { ...state, exploredLayers: [...state.exploredLayers, action.layerId] }

    case 'SET_HOSTILE_PROBED':
      return state.hostileProbed ? state : { ...state, hostileProbed: true }

    case 'PLACE_DRIVECHAIN':
      return state.drivechainPlaced ? state : { ...state, drivechainPlaced: true }

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
      return withAutoActivation({ ...state, ackWindow: win, ackCount })
    }

    case 'RESET_ACKS':
      return { ...state, ackWindow: [], ackCount: 0 }

    case 'MINE_BUNDLE': {
      // Lesson #3: each mined block advances the window clock by 1 and moves the
      // bundle's ACK count by +1 (honest support) or −1 (hostile majority),
      // honoring the ±1-per-block rule. Once the window is exhausted, the bundle
      // has expired and mining no longer changes the count.
      const remaining = action.windowBlocks - state.bundleBlocksElapsed
      if (remaining <= 0) return state
      const blocks = Math.min(action.amount, remaining)
      const elapsed = state.bundleBlocksElapsed + blocks
      const delta = state.bundleHostile ? -blocks : blocks
      // ACKs cannot exceed the threshold here (the bundle would have been
      // approved at the threshold) and cannot go below zero.
      const bundleAcks = Math.max(
        0,
        Math.min(action.threshold, state.bundleAcks + delta),
      )
      return { ...state, bundleAcks, bundleBlocksElapsed: elapsed }
    }

    case 'SET_BUNDLE_HOSTILE':
      return { ...state, bundleHostile: action.hostile }

    case 'RESET_BUNDLE':
      return {
        ...state,
        bundleAcks: 0,
        bundleBlocksElapsed: 0,
        bundleHostile: false,
      }

    case 'SET_ACK_THRESHOLD': {
      const clamped = Math.max(1008, Math.min(2016, action.count))
      return withAutoActivation({ ...state, ackThreshold: clamped })
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
