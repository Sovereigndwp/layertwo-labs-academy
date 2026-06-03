// ---------------------------------------------------------------------------
// lessonData — ALL learner-facing copy for this lesson lives here.
// ---------------------------------------------------------------------------
import type { VerifiableClaim } from '../state/claims'
// Components are dumb renderers driven by this file. To build a *new* LayerTwo
// Labs lesson, copy this file, swap the content, and reuse the same engine and
// components. Keep the factual guardrails (see `factBadge`) intact: Drivechain
// is a PROPOSED Bitcoin soft fork (BIP300/BIP301). DriveNet/Testchain are
// LayerTwo Labs testing software — not live on Bitcoin mainnet.
// ---------------------------------------------------------------------------

/** Which interactive component renders for a given step. */
export type StepKind =
  | 'hook'
  | 'principles'
  | 'slot'
  | 'identity'
  | 'release'
  | 'acks'
  | 'activation'
  | 'connect'
  | 'quiz'
  | 'advanced'

/**
 * Every screen teaches ONE idea and carries the same five beats:
 * headline, explain, action, feedback (handled in-component), why.
 */
export interface LessonStep {
  id: string
  kind: StepKind
  /** Short label shown in the ProgressRail. */
  navLabel: string
  /** One-sentence headline. */
  headline: string
  /** One plain-language explanation (no jargon without a Term/tooltip). */
  explain: string
  /** Microcopy for the learner action. */
  actionHint: string
  /** "Why this matters" line. */
  why: string
  /** Optional extra paragraphs for first-principles screens. */
  body?: string[]
}

export interface GlossaryTerm {
  id: string
  term: string
  short: string
  example?: string
}

export interface AddressByteTag {
  id: string
  /** The short unique tag, e.g. "0x44 0x52". */
  label: string
  /** True if this tag already belongs to another sidechain. */
  taken: boolean
  takenBy?: string
}

export interface SoftwareRelease {
  id: string
  version: string
  date: string
  note: string
  /** The intended "right" answer for teaching feedback (the newest stable one). */
  recommended: boolean
}

export interface QuizChoice {
  id: string
  label: string
  correct: boolean
  feedback: string
}

export interface QuizQuestion {
  id: string
  prompt: string
  choices: QuizChoice[]
}

export interface SourceNote {
  label: string
  detail: string
}

export interface LessonData {
  id: string
  summary: string
  audience: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  estMinutes: number
  prerequisites: string[]
  claims: VerifiableClaim[]
  slug: string
  title: string
  promise: string
  factBadge: { short: string; full: string }
  steps: LessonStep[]
  addressByteTags: AddressByteTag[]
  releases: SoftwareRelease[]
  quiz: QuizQuestion[]
  glossary: GlossaryTerm[]
  advanced: {
    title: string
    intro: string
    points: { term: string; blurb: string }[]
    reassurance: string
  }
  sources: SourceNote[]
}

export const lessonData: LessonData = {
  id: 'create-a-sidechain',
  summary:
    'How a new Drivechain sidechain gets proposed, recognized by miners, activated, and connected back to Bitcoin.',
  audience: 'beginner',
  tags: ['drivechain', 'bip300', 'bip301', 'sidechains', 'layer2'],
  estMinutes: 12,
  prerequisites: [],
  claims: [],
  slug: 'create-a-sidechain-without-breaking-bitcoin',
  title: 'Create a Sidechain Without Breaking Bitcoin',
  promise:
    'By the end, you will understand how a new Drivechain sidechain gets proposed, recognized by miners, activated over time, and connected back to Bitcoin — without forcing anything onto people who do not use it.',
  factBadge: {
    short: 'Proposed upgrade · testing software',
    full: 'Drivechain is a proposed Bitcoin soft fork (BIP300 / BIP301). It is not active on Bitcoin mainnet. DriveNet and Testchain are LayerTwo Labs software for learning and testing. This lesson is a simulation, not a live network.',
  },

  steps: [
    {
      id: 'hook',
      kind: 'hook',
      navLabel: 'The big idea',
      headline: 'Bitcoin is the main road. A sidechain is a road built next to it.',
      explain:
        'Imagine Bitcoin as one busy main road that everyone trusts. A sidechain is a separate road connected to it, for people who want to try something different. Drivechain is a proposed way to let people build those new roads without forcing every Bitcoin user to drive on them.',
      actionHint: 'Read the analogy, then continue.',
      why: 'New ideas can be tried on a side road. If a side road fails, the main road keeps working.',
    },
    {
      id: 'principles',
      kind: 'principles',
      navLabel: 'First principles',
      headline: 'A few plain ideas before you build anything.',
      explain:
        'You do not need to know how Bitcoin works inside to follow this. Here are the only ideas you need.',
      actionHint: 'Skim the cards, then continue.',
      why: 'These four ideas make every step after this one obvious.',
      body: [
        'A sidechain is a separate chain that uses Bitcoin as its anchor. Coins can move out to it and back.',
        'A slot is an empty parking space for one sidechain. DriveNet sets aside 256 of them.',
        'There are 256 slots so the number of sidechains stays small and reviewable — not unlimited noise.',
        'Most people will never make one. But anyone deserves to understand how it would happen.',
      ],
    },
    {
      id: 'slot',
      kind: 'slot',
      navLabel: 'Choose a slot',
      headline: 'Pick an empty slot for your sidechain.',
      explain:
        'DriveNet has 256 numbered slots, most of them blank. We will reserve slot 1 for a sidechain called Testchain. The slot is just a labeled parking space.',
      actionHint: 'Click slot 1 to reserve it.',
      why: 'A slot does not create a sidechain by itself. It only reserves a place where real sidechain software can be recognized.',
    },
    {
      id: 'identity',
      kind: 'identity',
      navLabel: 'Set the identity',
      headline: 'Give the sidechain a unique identity tag.',
      explain:
        'Every deposit to a sidechain is tagged with a few "address bytes" so the network knows which sidechain it is for. The bytes are arbitrary, but they must be unique.',
      actionHint: 'Choose an identity tag. One is already taken — see what happens.',
      why: 'If two sidechains share the same tag, deposits become ambiguous and people could lose track of where their coins went.',
    },
    {
      id: 'release',
      kind: 'release',
      navLabel: 'Pick the version',
      headline: 'Mark one software release as the official starting point.',
      explain:
        'The proposal points at a specific software release and says "this is the authoritative definition of the sidechain." This is about agreement, not control.',
      actionHint: 'Choose which release should be the official starting version.',
      why: 'It does not freeze the sidechain forever. It just gives everyone a clear starting definition, so future arguments about "what this sidechain really is" are easier to avoid.',
    },
    {
      id: 'acks',
      kind: 'acks',
      navLabel: 'Miner ACKs',
      headline: 'Miners signal support one block at a time.',
      explain:
        'A proposal is not accepted by a vote on one day. Miners include one ACK — one signal of recognition — per block. The future target is 1916 of the past 2016 blocks, about 95%.',
      actionHint: 'Mine blocks to add ACKs and watch the percentage rise.',
      why: 'Activation is slow on purpose. Repeated signals over time give the whole network a chance to notice and react before anything changes.',
    },
    {
      id: 'activation',
      kind: 'activation',
      navLabel: 'Activate',
      headline: 'Enough signals, and the slot flips to active.',
      explain:
        'Once the ACK threshold is reached, the slot changes from "proposed" to "active." Something changed — and something important did not.',
      actionHint: 'Activate the slot, then read what changed.',
      why: 'Activation means the network recognizes the slot. It does not magically run the software for you — that part is still up to people.',
    },
    {
      id: 'connect',
      kind: 'connect',
      navLabel: 'Connect to Bitcoin',
      headline: 'The sidechain still needs a Bitcoin full node.',
      explain:
        'To actually run Testchain, you point it at a Bitcoin full node — here, DriveNet. This is similar to how a Lightning node needs a Bitcoin node to talk to.',
      actionHint: 'Connect Testchain to DriveNet.',
      why: 'A sidechain does not float in space. Bitcoin stays its reference point for what is real.',
    },
    {
      id: 'quiz',
      kind: 'quiz',
      navLabel: 'Reflect',
      headline: 'Check your understanding.',
      explain:
        'No score, no pressure. Pick the answer that matches what you just learned, and read the feedback either way.',
      actionHint: 'Answer each reflection question.',
      why: 'Saying the idea back in your own head is how it sticks.',
    },
    {
      id: 'advanced',
      kind: 'advanced',
      navLabel: 'What comes next',
      headline: 'There is a deeper layer — for later.',
      explain:
        'You have the whole beginner picture now. The parts you can safely skip for today live behind here.',
      actionHint: 'Preview the advanced topics.',
      why: 'Knowing what you are choosing not to learn yet is part of learning.',
    },
  ],

  addressByteTags: [
    { id: 'tag-a', label: '0x54 0x43', taken: false },
    {
      id: 'tag-b',
      label: '0x44 0x52',
      taken: true,
      takenBy: 'an existing sidechain (DriveNet template)',
    },
    { id: 'tag-c', label: '0x7A 0x31', taken: false },
  ],

  releases: [
    {
      id: 'rel-old',
      version: 'testchain 2.10.00',
      date: 'older build',
      note: 'An early build. Stable, but missing later fixes. Pointing here would lock the definition to old behavior.',
      recommended: false,
    },
    {
      id: 'rel-stable',
      version: 'testchain 3.00.00',
      date: 'latest stable',
      note: 'The current stable release used in this example. A clear, current starting definition everyone can check.',
      recommended: true,
    },
    {
      id: 'rel-experimental',
      version: 'testchain 3.01.00-rc',
      date: 'release candidate',
      note: 'A preview build still being tested. Marking an untested build authoritative invites disputes if it changes.',
      recommended: false,
    },
  ],

  quiz: [
    {
      id: 'q-confusion',
      prompt: 'What part of the process protects against confusion?',
      choices: [
        {
          id: 'q1a',
          label: 'The unique identity tag (address bytes)',
          correct: true,
          feedback:
            'Right. Unique address bytes keep each sidechain’s deposits separate, so coins do not get attributed to the wrong chain.',
        },
        {
          id: 'q1b',
          label: 'Having exactly 256 slots',
          correct: false,
          feedback:
            'Slots keep the set small and reviewable, but the thing that prevents deposit confusion is the unique identity tag.',
        },
        {
          id: 'q1c',
          label: 'The Bitcoin full node connection',
          correct: false,
          feedback:
            'The node connection keeps the sidechain anchored to Bitcoin, but uniqueness of the identity tag is what prevents mix-ups.',
        },
      ],
    },
    {
      id: 'q-slow',
      prompt: 'What makes activation slow?',
      choices: [
        {
          id: 'q2a',
          label: 'Miners ACK one block at a time toward a high threshold',
          correct: true,
          feedback:
            'Exactly. Reaching ~95% of the past 2016 blocks takes many blocks, which gives everyone time to notice.',
        },
        {
          id: 'q2b',
          label: 'Downloading the sidechain software',
          correct: false,
          feedback:
            'Software download is quick. The slow part is the repeated miner signaling over many blocks.',
        },
        {
          id: 'q2c',
          label: 'Choosing which slot to use',
          correct: false,
          feedback:
            'Picking a slot is instant. The deliberate delay comes from the block-by-block ACK process.',
        },
      ],
    },
    {
      id: 'q-anchor',
      prompt: 'What connects the sidechain back to Bitcoin?',
      choices: [
        {
          id: 'q3a',
          label: 'A connection to a Bitcoin full node (DriveNet)',
          correct: true,
          feedback:
            'Correct. Like a Lightning node, a Drivechain sidechain needs a Bitcoin full node as its reference point.',
        },
        {
          id: 'q3b',
          label: 'The authoritative software release flag',
          correct: false,
          feedback:
            'The release flag defines what the sidechain *is*. The live link to Bitcoin is the full node connection.',
        },
        {
          id: 'q3c',
          label: 'The slot number',
          correct: false,
          feedback:
            'The slot reserves a place. The actual link to Bitcoin is the full node connection.',
        },
      ],
    },
    {
      id: 'q-unique',
      prompt: 'What could go wrong if sidechain identity was not unique?',
      choices: [
        {
          id: 'q4a',
          label: 'Deposits meant for one sidechain could be confused with another',
          correct: true,
          feedback:
            'Right. Shared identity bytes make it ambiguous which chain a deposit belongs to — a recipe for lost or misrouted coins.',
        },
        {
          id: 'q4b',
          label: 'Bitcoin would stop producing blocks',
          correct: false,
          feedback:
            'Bitcoin keeps running regardless. The real risk is ambiguous deposits between sidechains.',
        },
        {
          id: 'q4c',
          label: 'Nothing — names are just labels',
          correct: false,
          feedback:
            'These bytes are not just labels; the software uses them to route deposits. Collisions cause real confusion.',
        },
      ],
    },
  ],

  glossary: [
    {
      id: 'sidechain',
      term: 'Sidechain',
      short:
        'A separate chain that uses Bitcoin as its anchor. Coins can move out to it and back.',
      example: 'Testchain is the example sidechain in this lesson.',
    },
    {
      id: 'drivechain',
      term: 'Drivechain',
      short:
        'A proposed Bitcoin soft fork (BIP300/BIP301) that would let Bitcoin support sidechains without new coins.',
      example: 'It is a proposal, not a live mainnet feature.',
    },
    {
      id: 'drivenet',
      term: 'DriveNet',
      short:
        'LayerTwo Labs software that acts as the Bitcoin full node a sidechain connects to in this testing setup.',
    },
    {
      id: 'slot',
      term: 'Slot',
      short:
        'One of 256 numbered spaces in DriveNet. A reserved place for a single sidechain — not the sidechain itself.',
      example: 'We reserved slot 1 for Testchain.',
    },
    {
      id: 'full-node',
      term: 'Full node',
      short:
        'Software that downloads and checks Bitcoin’s rules for itself instead of trusting someone else.',
    },
    {
      id: 'miner',
      term: 'Miner',
      short:
        'A participant that adds new blocks to Bitcoin. In Drivechain, miners also signal ACKs for sidechain proposals.',
    },
    {
      id: 'ack',
      term: 'ACK',
      short:
        'A miner’s signal that recognizes a sidechain proposal. One ACK can be included per block.',
      example: 'The future target is 1916 of the past 2016 blocks (~95%).',
    },
    {
      id: 'address-bytes',
      term: 'Address bytes',
      short:
        'A short, unique tag attached to deposits so the network knows which sidechain they belong to.',
      example: 'They are arbitrary but must be unique across sidechains.',
    },
    {
      id: 'soft-fork',
      term: 'Soft fork',
      short:
        'A backward-compatible Bitcoin rule change. Drivechain is proposed as one — covered in advanced lessons.',
    },
    {
      id: 'deposit',
      term: 'Deposit',
      short:
        'Moving bitcoin from the main chain onto a sidechain. The address bytes tell the network which sidechain.',
    },
  ],

  advanced: {
    title: 'For Miners (advanced path)',
    intro:
      'This beginner lesson stops here on purpose. The topics below are real and important, but you do not need them to understand the big picture — and most users never run them.',
    points: [
      {
        term: 'Blind merged mining',
        blurb:
          'A way for Bitcoin miners to also secure a sidechain without running its software. Powerful, but a separate deep topic.',
      },
      {
        term: 'BIP300 — hashrate escrow',
        blurb:
          'The proposed rules for how sidechain withdrawals are approved over time by miners.',
      },
      {
        term: 'BIP301 — blind merged mining',
        blurb:
          'The proposed mechanism that lets miners include sidechain blocks blindly.',
      },
      {
        term: 'Withdrawals',
        blurb:
          'Moving coins back from a sidechain to the main chain — the harder, more carefully designed direction.',
      },
    ],
    reassurance:
      'If you saw warnings about blind merged mining while exploring the software, you can safely ignore them as a beginner. They belong to the miner path.',
  },

  sources: [
    {
      label: 'Source article',
      detail: '“Creating a Sidechain”, Paul Sztorc (LayerTwo Labs).',
    },
    {
      label: 'Related concepts',
      detail:
        'Drivechain, DriveNet, Testchain, BIP300, BIP301, miner ACKs, sidechain slots, blind merged mining.',
    },
    {
      label: 'Accuracy note',
      detail:
        'Drivechain is a proposed Bitcoin soft fork and is not active on Bitcoin mainnet. DriveNet and Testchain are testing software. This lesson is an educational simulation.',
    },
  ],
}
