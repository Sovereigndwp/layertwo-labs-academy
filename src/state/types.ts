// ---------------------------------------------------------------------------
// Lesson state model
// ---------------------------------------------------------------------------
// This is the single source of truth for everything the learner does in the
// lesson. Components never hold their own progress state — they read from here
// and dispatch actions. That keeps the lesson a *template*: a future LayerTwo
// Labs lesson can reuse this engine with a different lessonData file.
// ---------------------------------------------------------------------------

/** Bump when the persisted shape changes incompatibly. */
export const STORAGE_VERSION = 1

export type ActivationStatus =
  | 'not proposed'
  | 'proposed'
  | 'activating'
  | 'active'

/** Run-length encoded entry for the rolling ACK window. */
export interface AckRun { acked: boolean; n: number }

/** A learner's answer to one reflection/quiz question. */
export interface QuizAnswer {
  questionId: string
  choiceId: string
}

export interface LessonState {
  /** Index of the current step (0-based) in lessonData.steps. */
  lessonStep: number

  // --- Module 1: Choose a Slot ---
  /** 1-based slot number the learner reserved, or null. A Drivechain mainchain has 256 slots. */
  selectedSlot: number | null
  /** Human name assigned to the slot. Defaults to "Testchain". */
  sidechainName: string

  // --- Module 2: Set the Sidechain Identity ---
  /** The address-byte tag the learner picked, or null. */
  addressBytes: string | null
  /** Whether the picked tag is unique (true) or collides with a taken one (false). */
  isAddressBytesUnique: boolean | null

  // --- Module 3: Pick the Official Starting Version ---
  /** Id of the release flagged authoritative, or null. */
  selectedRelease: string | null

  // --- Module 4: Miner ACK Timeline ---
  /** How many of the past blocks contain an ACK. */
  ackCount: number
  /** ACKs required to activate. Enforcer: unused slot activates at 1815 of 2016 blocks (~90%) on mainnet. */
  ackThreshold: number
  /** Run-length encoding of the trailing ≤2016 blocks; front = oldest. */
  ackWindow: AckRun[]

  // --- Module 5: Activation ---
  activationStatus: ActivationStatus

  // --- Module 6: Connect to Bitcoin ---
  /** Whether the sidechain is connected to the Bitcoin node (Bitcoin Core + Enforcer). */
  nodeConnected: boolean

  // --- Module 8: Reflection / quiz ---
  quizAnswers: QuizAnswer[]

  // --- UI ---
  glossaryOpen: boolean
  /** Term id to scroll/highlight when the glossary opens, or null. */
  glossaryFocusTerm: string | null
  /** Module 9: advanced "For Miners" preview unlocked after the quiz. */
  advancedUnlocked: boolean
}

export const TOTAL_BLOCKS = 2016
export const TOTAL_SLOTS = 256

export const initialLessonState: LessonState = {
  lessonStep: 0,
  selectedSlot: null,
  sidechainName: 'Testchain',
  addressBytes: null,
  isAddressBytesUnique: null,
  selectedRelease: null,
  ackCount: 0,
  ackThreshold: 1815, // ~90% (Enforcer: unused slot activates at 1815 of a 2016-block window)
  ackWindow: [],
  activationStatus: 'not proposed',
  nodeConnected: false,
  quizAnswers: [],
  glossaryOpen: false,
  glossaryFocusTerm: null,
  advancedUnlocked: false,
}

export type LessonAction =
  | { type: 'GO_TO_STEP'; step: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SELECT_SLOT'; slot: number }
  | { type: 'SET_SIDECHAIN_NAME'; name: string }
  | { type: 'SET_ADDRESS_BYTES'; tag: string; unique: boolean }
  | { type: 'SELECT_RELEASE'; releaseId: string }
  | { type: 'MINE_BLOCKS'; amount: number; supporting: boolean }
  | { type: 'SET_ACK_THRESHOLD'; count: number }
  | { type: 'RESET_ACKS' }
  | { type: 'SET_ACTIVATION'; status: ActivationStatus }
  | { type: 'SET_NODE_CONNECTED'; connected: boolean }
  | { type: 'ANSWER_QUIZ'; questionId: string; choiceId: string }
  | { type: 'OPEN_GLOSSARY'; termId?: string | null }
  | { type: 'CLOSE_GLOSSARY' }
  | { type: 'UNLOCK_ADVANCED' }
  | { type: 'RESET' }
