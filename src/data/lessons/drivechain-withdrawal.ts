// ---------------------------------------------------------------------------
// Lesson #3 — "How a Drivechain Withdrawal Works (and Why It's Slow)"
// ---------------------------------------------------------------------------
// All learner-facing copy lives here. Reuses the same engine as lessons #1/#2
// (LessonShell routes step.kind → component). The `acks` AckTimeline is shared
// but fully PARAMETERIZED via step.acks (AcksConfig): this lesson drives it in
// its 'withdrawal' variant — 26,300-block window, 13,150-ACK threshold, a
// countdown clock, a hostile-hashrate control and an approve/expire outcome,
// plus its own falsifier (M6 payout / src/bip300.rs) and off-ramp analogy
// helper. None of lesson #1's slot-activation wording renders here. The two
// `quiz` reflection screens render DIFFERENT question subsets via each step's
// `quizQuestionIds`, so neither repeats the other.
//
// Factual guardrail (same as the course): Drivechain is a PROPOSED Bitcoin soft
// fork (BIP300/BIP301), not live on mainnet. The 26,300-block window and
// 13,150-ACK threshold are SPEC (mainnet) parameters from BIP300; the Enforcer
// reference code carries TEST constants at the pinned commit, so the
// enforcer-constants claim ships `needs-recheck` (same mainnet-vs-test pattern
// as lesson #1's activation threshold).
// ---------------------------------------------------------------------------
import type { LessonData } from '../lessonData'

const TODAY = '2026-06-08'

export const drivechainWithdrawalLesson: LessonData = {
  id: 'drivechain-withdrawal',
  summary:
    "How coins move off a Drivechain sidechain back to Bitcoin under BIP300 — the withdrawal bundle, the months-long miner-ACK vote (26,300-block window, 13,150-ACK threshold), why it is deliberately slow, and exactly what a hostile hashrate majority could and could not do.",
  audience: 'beginner',
  tags: ['drivechain', 'bip300', 'withdrawal', 'sidechains', 'layer2'],
  estMinutes: 12,
  prerequisites: ['create-a-sidechain', 'where-drivechain-sits'],

  claims: [
    {
      id: 'withdrawal-bundle',
      text: "Under BIP300, sidechain coins return to Bitcoin via a 'withdrawal bundle' — many individual withdrawal-requests bundled into a single rare L1 transaction (paid out by an M6 message), identified by its blinded hash.",
      tier: 'DEV',
      sources: [
        { label: 'BIP300 spec', url: 'https://github.com/bitcoin/bips/blob/master/bip-0300.mediawiki' },
      ],
      verifiedOn: TODAY,
      status: 'verified',
    },
    {
      id: 'vote-window-26300',
      text: "In the BIP300 spec, a withdrawal bundle's vote window starts at 26,300 blocks ('Blocks Remaining' starts at 26,300 and counts down) — roughly 6 months — after which an unapproved bundle expires.",
      tier: 'DEV',
      sources: [
        { label: 'BIP300 spec', url: 'https://github.com/bitcoin/bips/blob/master/bip-0300.mediawiki' },
      ],
      verifiedOn: TODAY,
      status: 'verified',
    },
    {
      id: 'ack-threshold-13150',
      text: "In the BIP300 spec, a withdrawal bundle succeeds only when it accumulates 13,150 or more ACKs (half of the 26,300-block window); its M6 payout can then be included in a block.",
      tier: 'DEV',
      sources: [
        { label: 'BIP300 spec', url: 'https://github.com/bitcoin/bips/blob/master/bip-0300.mediawiki' },
      ],
      verifiedOn: TODAY,
      status: 'verified',
    },
    {
      id: 'ack-step-one',
      text: "From one block to the next, a bundle's ACK count may change by at most 1 (increase or decrease) — miners cast at most one ACK per block toward a given bundle.",
      tier: 'DEV',
      sources: [
        { label: 'BIP300 spec', url: 'https://github.com/bitcoin/bips/blob/master/bip-0300.mediawiki' },
      ],
      verifiedOn: TODAY,
      status: 'verified',
    },
    {
      id: 'node-rejects-unapproved',
      text: 'A Bitcoin node enforcing BIP300 rejects (treats as invalid) any M6 withdrawal payout whose bundle has not first been approved by reaching the ACK threshold — i.e. a bundle cannot pay out without crossing the threshold.',
      tier: 'DEV',
      sources: [
        { label: 'BIP300 spec', url: 'https://github.com/bitcoin/bips/blob/master/bip-0300.mediawiki' },
      ],
      verifiedOn: TODAY,
      status: 'verified',
    },
    {
      id: 'enforcer-threshold-code',
      text: 'The bip300301_enforcer reference implementation enforces the threshold rule in code: its handle_m5_m6 logic rejects an M6 whose bundle vote_count has not exceeded WITHDRAWAL_BUNDLE_INCLUSION_THRESHOLD (defined as WITHDRAWAL_BUNDLE_MAX_AGE / 2), returning the bundle as invalid.',
      tier: 'DEV',
      sources: [
        {
          label: 'bip300301_enforcer (src/bip300.rs, pinned)',
          url: 'https://github.com/LayerTwo-Labs/bip300301_enforcer/blob/13a4353c39a26d9d40180ea361b7580fd682e5b5/src/bip300.rs',
        },
      ],
      verifiedOn: TODAY,
      status: 'needs-recheck',
    },
    {
      id: 'withdrawals-deliberately-slow',
      text: 'BIP300 makes withdrawals deliberately slow: the bundle hash is ACKed by L1 miners gradually over roughly 3–6 months before payout.',
      tier: 'DEV',
      sources: [
        { label: 'BIP300 spec', url: 'https://github.com/bitcoin/bips/blob/master/bip-0300.mediawiki' },
      ],
      verifiedOn: TODAY,
      status: 'verified',
    },
    {
      id: 'hostile-can-censor',
      text: 'A hostile hashrate majority CAN censor a withdrawal — by consistently refusing to ACK (or by downvoting) a bundle, >50% hashrate can keep it from ever reaching 13,150 ACKs before it expires.',
      tier: 'DEV',
      sources: [
        { label: 'BIP300 spec', url: 'https://github.com/bitcoin/bips/blob/master/bip-0300.mediawiki' },
      ],
      verifiedOn: TODAY,
      status: 'verified',
    },
    {
      id: 'hostile-can-redirect',
      text: "A hostile hashrate majority CAN attempt theft/redirect — it can vote up a FRAUDULENT bundle that pays sidechain funds to the attacker; the spec acknowledges sidechains are 'vulnerable to one catastrophe per 13150 blocks (the invalid withdrawal),' relying on miners' economic incentive (fees) rather than cryptography to prevent it.",
      tier: 'DEV',
      sources: [
        { label: 'BIP300 spec', url: 'https://github.com/bitcoin/bips/blob/master/bip-0300.mediawiki' },
      ],
      verifiedOn: TODAY,
      status: 'verified',
    },
    {
      id: 'hostile-cannot-forge',
      text: 'A hostile hashrate majority CANNOT forge a deposit, spend a user\'s private keys, or steal coins outside the withdrawal mechanism — deposits (M5) only move value already escrowed for that sidechain, and miners hold no user keys.',
      tier: 'DEV',
      sources: [
        { label: 'BIP300 spec', url: 'https://github.com/bitcoin/bips/blob/master/bip-0300.mediawiki' },
      ],
      verifiedOn: TODAY,
      status: 'verified',
    },
    {
      id: 'drivechain-proposed',
      text: 'Drivechain (BIP300/BIP301) is a PROPOSED Bitcoin soft fork, not active on Bitcoin mainnet; the BIP300 withdrawal mechanism is specified but not deployed on mainnet.',
      tier: 'DEV',
      sources: [
        { label: 'BIP300 spec', url: 'https://github.com/bitcoin/bips/blob/master/bip-0300.mediawiki' },
      ],
      verifiedOn: TODAY,
      status: 'verified',
    },
  ],

  analogy: {
    world: 'roads',
    blurb:
      'Bitcoin is the main highway; a sidechain is the minibus on the numbered route you opened in lesson 1. A withdrawal is letting passengers off the minibus back onto the highway — and the highway authority must keep re-approving that off-ramp for months before anyone may get off.',
    mappings: [
      { term: 'Bitcoin', element: 'the main highway everyone shares — the final word on where value is' },
      { term: 'sidechain', element: 'the minibus on the numbered route you opened in lesson 1' },
      { term: 'withdrawal bundle', element: 'one shared off-ramp that lets many passengers off in a single, rare maneuver' },
      { term: 'miner ACKs', element: 'the highway authority repeatedly voting to keep the off-ramp open' },
      { term: 'vote window', element: 'the months-long period the authority has to approve the off-ramp before it is removed' },
      { term: 'hostile majority', element: 'an authority that turns against you — and the precise limits of what it can do at the off-ramp' },
    ],
  },

  slug: 'how-a-drivechain-withdrawal-works',
  title: 'How a Drivechain Withdrawal Works (and Why It’s Slow)',
  promise:
    'By the end, you will be able to explain how coins leave a Drivechain sidechain — the withdrawal bundle, the months-long miner vote, why it is deliberately slow — and say precisely what a hostile hashrate majority could (censor, redirect) and could not (forge a deposit, spend your keys) do.',
  factBadge: {
    short: 'Drivechain proposed · spec parameters, not live',
    full:
      'Drivechain is a proposed Bitcoin soft fork (BIP300 / BIP301) and is not active on Bitcoin mainnet. The 26,300-block window and 13,150-ACK threshold are parameters from the BIP300 spec (mainnet values); the Enforcer reference code carries test constants. This lesson is a simulation of the proposed mechanism, not a live network.',
  },

  steps: [
    {
      id: 'hook',
      kind: 'hook',
      navLabel: 'Getting back off',
      headline: 'Coins go onto a sidechain easily. Getting them back is the hard part.',
      explain:
        'Depositing onto a sidechain is quick. Withdrawing — moving coins back to Bitcoin — is deliberately the slow, carefully-designed direction. This lesson is the return trip: how BIP300 lets coins leave a sidechain, and why it takes months on purpose.',
      actionHint: 'Read the idea, then continue.',
      why: 'The whole Drivechain debate lives in the withdrawal direction. Understand it and you understand the tradeoff lessons 1 and 2 kept naming.',
      nextLabel: 'The withdrawal bundle',
    },
    {
      id: 'principles',
      kind: 'principles',
      navLabel: 'How a withdrawal is built',
      headline: 'A withdrawal is not one transaction — it is a bundle, voted on for months.',
      explain:
        'BIP300 does not let coins leave one-by-one on demand. It batches many withdrawal-requests into a single rare L1 transaction — a "bundle" — and only pays it out (an "M6" message) after miners approve it over a long public vote. Here is the shape before you run it.',
      actionHint: 'Skim the four ideas, then continue.',
      why: 'Each idea below is a real BIP300 parameter. Knowing them makes the vote you run next make sense — and shows why the design is slow on purpose.',
      body: [
        'Withdrawal bundle: many individual withdrawals are bundled into one rare Bitcoin transaction, identified by a single blinded hash. Miners vote on that hash, not on each user.',
        'The vote window: a bundle’s clock ("Blocks Remaining") starts at 26,300 blocks — roughly six months — and counts down. If it is not approved in time, the bundle expires and the requests must be re-submitted.',
        'The success threshold: a bundle pays out only once it has gathered 13,150 ACKs or more — exactly half the window. Until then, no payout.',
        'One step at a time: from one block to the next, a bundle’s ACK count can move by at most 1 (up or down). Miners cast at most one ACK per block toward a bundle, so support must be sustained, not spiked.',
      ],
      nextLabel: 'Run the vote',
    },
    {
      id: 'bundle-vote',
      kind: 'acks',
      navLabel: 'Run the withdrawal vote',
      headline: 'Accumulate ACKs across the window — and watch a bundle succeed or expire.',
      explain:
        'A withdrawal bundle changes nothing until miners approve it. Each block, a miner may add at most one ACK toward the bundle (or withhold/withdraw one). Mine blocks and watch the count climb toward 13,150 — or, if support is held back, watch the 26,300-block clock run out and the bundle expire. Then push the boundary: turn the hashrate hostile and see the withdrawal blocked.',
      actionHint:
        'Mine blocks with support to drive ACKs toward the threshold; then push the "hostile hashrate" past 50% and watch the count stall below 13,150 until the window expires.',
      why:
        'How we know: a Bitcoin node enforcing BIP300 rejects any M6 payout whose bundle has not reached the ACK threshold — the payout simply cannot be included. Falsifier: if a bundle ever paid out without crossing 13,150 ACKs, a full node would reject that block. That is also exactly why a sustained hostile majority can censor: hold ACKs below 13,150 and the bundle expires unpaid.',
      acks: {
        variant: 'withdrawal',
        windowBlocks: 26300,
        threshold: 13150,
        subjectNoun: 'withdrawal bundle',
        successVerb: 'approved',
        thresholdLabel: 'Approval threshold',
        nextLabel: 'Why so slow',
        howWeKnow:
          'a Bitcoin node enforcing BIP300 rejects any M6 withdrawal payout whose bundle has not reached the ACK threshold — the payout simply cannot be included in a block. In the reference Enforcer this is handle_m5_m6, which rejects an M6 whose vote_count has not exceeded WITHDRAWAL_BUNDLE_INCLUSION_THRESHOLD (WITHDRAWAL_BUNDLE_MAX_AGE / 2). The 13,150 / 26,300 here are the BIP300 spec (mainnet) values; the Enforcer reference code at the pinned commit carries smaller TEST constants — so confirm which you are reading (see src/bip300.rs). Falsifier — if a bundle ever paid out without crossing the threshold, a full node would reject that block.',
        howWeKnowTermId: 'm6',
        analogyHelper:
          'the highway authority repeatedly voting to keep the off-ramp open so passengers may get off — one vote is not enough; they must keep re-approving it, in the open, for the whole window, or the off-ramp closes and no one gets off.',
      },
    },
    {
      id: 'why-slow',
      kind: 'principles',
      navLabel: 'Why so slow',
      headline: 'The slowness is the safety feature, not a bug.',
      explain:
        'A six-month, one-ACK-per-block vote sounds painfully slow. That is the point: the bundle hash is ACKed gradually over 3–6 months precisely so that everyone — users, exchanges, other miners — has time to notice a wrong or fraudulent withdrawal and react before it pays out.',
      actionHint: 'Read why the delay is deliberate, then continue.',
      why:
        'How we know: the BIP300 spec states the hash is one "L1 miners will slowly ACK over 3-6 months," and the 13,150-of-26,300 window is the mechanism behind that slowness. Falsifier: if a withdrawal could finalize instantly, the time-to-notice that justifies the design would not exist — and a node would still reject any payout that skipped the sustained vote.',
      body: [
        'Time to notice: a slow, public vote gives the network months to spot a fraudulent bundle before its M6 can pay out.',
        'Costly and sustained: because ACKs move by at most 1 per block, support cannot be faked with a single spike — it must be held for thousands of blocks.',
        'No instant exits by design: the same delay that protects against theft is also why withdrawals are not fast. That tradeoff is intentional, not an oversight.',
      ],
      nextLabel: 'What can a hostile majority do?',
    },
    {
      id: 'hostile-sort',
      kind: 'quiz',
      navLabel: 'Hostile majority',
      headline: 'Sort what a hostile majority can and cannot do.',
      explain:
        'A hashrate majority controls the withdrawal vote — but only the withdrawal vote. For each action, decide which bucket it falls in: CENSOR (block your withdrawal), REDIRECT (the theft attack the spec admits), or CANNOT (outside what miners can touch at all). This is the precise security boundary, not vague fear.',
      actionHint: 'Answer each item, and read the feedback either way — the boundary is the lesson.',
      why:
        'How we know: each answer ties to BIP300. Miners act only inside the bundle-vote mechanism (M3–M6); they hold no user keys and cannot fabricate deposits. Falsifier for "cannot": if a majority could spend your keys or forge a deposit without the vote, BIP300’s M5/M6 design would be broken — but deposits only move value already escrowed for that sidechain.',
      // The three boundary questions ARE the sort: each maps an action to its
      // bucket — CENSOR / REDIRECT / CANNOT. The final 'quiz' step below shows a
      // different set, so the two screens never repeat the same questions.
      quizQuestionIds: ['q-censor', 'q-redirect', 'q-cannot'],
    },
    {
      id: 'quiz',
      kind: 'quiz',
      navLabel: 'Reflect',
      headline: 'Check your understanding.',
      explain:
        'No score, no pressure. Pick the answer that matches what you just explored, and read the feedback either way.',
      actionHint: 'Answer each reflection question.',
      why: 'Saying the tradeoff back in your own words is how it sticks.',
      // A distinct set from the hostile-sort screen: the "why slow" and the
      // overall-tradeoff synthesis, not the CENSOR/REDIRECT/CANNOT sort again.
      quizQuestionIds: ['q-slow', 'q-synthesis'],
    },
    {
      id: 'advanced',
      kind: 'advanced',
      navLabel: 'Going deeper',
      headline: 'The withdrawal mechanism has more corners — for later.',
      explain:
        'You now have the honest beginner picture of how coins leave a sidechain. The finer details of the message format and the theft window live behind here for when you want them.',
      actionHint: 'Preview the deeper topics.',
      why: 'Knowing what you are choosing not to study yet is part of learning.',
    },
  ],

  // Lesson #3 reuses only the `acks` and `quiz` interactives — no slot,
  // identity, release, layers, connect, or activation steps.
  addressByteTags: [],
  releases: [],

  quiz: [
    // Both reflection screens use the `quiz` renderer but show DIFFERENT
    // questions via each step's `quizQuestionIds`: the "hostile-sort" screen
    // shows the CENSOR/REDIRECT/CANNOT boundary (q-censor, q-redirect, q-cannot);
    // the final "quiz" screen shows the why-slow + synthesis set (q-slow,
    // q-synthesis). No screen repeats another's questions.
    {
      id: 'q-censor',
      prompt: 'Can a hostile hashrate majority block your withdrawal?',
      choices: [
        {
          id: 'qc-a',
          label: 'Yes — by refusing to ACK (or downvoting), it can keep the bundle below 13,150 until it expires (CENSOR)',
          correct: true,
          feedback:
            'Correct. Because ACKs move by at most 1 per block and a bundle needs 13,150 to pay out, a sustained majority can simply hold the count below the threshold until the 26,300-block window runs out. The withdrawal never finalizes.',
        },
        {
          id: 'qc-b',
          label: 'No — withdrawals are automatic once requested',
          correct: false,
          feedback:
            'Withdrawals are not automatic. They require miners to ACK a bundle over a long window, and a majority that withholds ACKs can stall it indefinitely.',
        },
        {
          id: 'qc-c',
          label: 'No — a node would force the payout through anyway',
          correct: false,
          feedback:
            'Nodes do the opposite: they reject a payout that has not been approved. They never force an unapproved bundle to pay out, so withholding ACKs successfully censors.',
        },
      ],
    },
    {
      id: 'q-redirect',
      prompt: 'Can a hostile hashrate majority try to steal sidechain funds (redirect them to itself)?',
      choices: [
        {
          id: 'qr-a',
          label: 'Yes — it can vote up a FRAUDULENT bundle; the spec admits this "invalid withdrawal" risk and relies on miners’ fee incentive, not cryptography, to prevent it (REDIRECT)',
          correct: true,
          feedback:
            'Correct, and this is the honest tradeoff — not a claim that Drivechain is "safe." BIP300 acknowledges sidechains are vulnerable to roughly one catastrophe per 13,150 blocks (the invalid withdrawal). Security here rests on an honest/incentivized majority, not on cryptography.',
        },
        {
          id: 'qr-b',
          label: 'No — fraudulent withdrawals are cryptographically impossible',
          correct: false,
          feedback:
            'They are not cryptographically prevented. The spec explicitly admits the invalid-withdrawal vector; what discourages it is miners’ economic incentive, which is an assumption, not a proof.',
        },
        {
          id: 'qr-c',
          label: 'No — only the sidechain operator can move funds',
          correct: false,
          feedback:
            'There is no privileged operator gate here. Miners collectively approve bundles, and a majority can approve a fraudulent one — that is exactly the redirect risk.',
        },
      ],
    },
    {
      id: 'q-cannot',
      prompt: 'Can a hostile hashrate majority forge a deposit or spend your private keys?',
      choices: [
        {
          id: 'qk-a',
          label: 'No — miners act only inside the bundle vote; deposits (M5) move only already-escrowed value, and miners hold no user keys (CANNOT)',
          correct: true,
          feedback:
            'Correct. This is the precise boundary: a majority can attack the withdrawal vote, but it cannot sign for you or fabricate a deposit. Falsifier — if a majority could spend your keys without the vote, BIP300’s M5/M6 design would be broken.',
        },
        {
          id: 'qk-b',
          label: 'Yes — controlling hashrate means controlling everyone’s coins',
          correct: false,
          feedback:
            'No. Hashrate controls block ordering and the withdrawal vote, not user keys. Miners cannot sign transactions on your behalf or invent deposits out of nothing.',
        },
        {
          id: 'qk-c',
          label: 'Yes — they can mint new sidechain coins at will',
          correct: false,
          feedback:
            'They cannot. Deposits only move value already escrowed for that sidechain; there is no miner power to fabricate value outside the bundle mechanism.',
        },
      ],
    },
    {
      id: 'q-slow',
      prompt: 'Why is a Drivechain withdrawal deliberately slow?',
      choices: [
        {
          id: 'qs-a',
          label: 'So the network has months to notice and react to a wrong or fraudulent bundle before it pays out',
          correct: true,
          feedback:
            'Right. The bundle hash is ACKed gradually over 3–6 months. That public delay is the safety feature: time to spot a bad withdrawal before its M6 can be included.',
        },
        {
          id: 'qs-b',
          label: 'Because Bitcoin blocks are slow to download',
          correct: false,
          feedback:
            'The delay is not about bandwidth. It comes from the sustained miner vote — 13,150 ACKs across a 26,300-block window.',
        },
        {
          id: 'qs-c',
          label: 'It is an accidental inefficiency the spec wants to remove',
          correct: false,
          feedback:
            'It is intentional. The slowness is the mechanism that gives everyone time to detect fraud; removing it would remove the protection.',
        },
      ],
    },
    {
      id: 'q-synthesis',
      prompt:
        'In one line: what is the honest summary of a Drivechain withdrawal’s security?',
      choices: [
        {
          id: 'qy-a',
          label:
            'A slow, public miner vote that an honest majority finalizes — but a hostile majority can censor or attempt to redirect, and only the slowness (time to notice) and miners’ incentives guard against theft',
          correct: true,
          feedback:
            'That is the honest picture. Security rests on a sustained, public vote plus economic incentives — not cryptography. A majority can censor (withhold ACKs) or try to redirect (vote up a fraudulent bundle); it cannot forge a deposit or spend your keys.',
        },
        {
          id: 'qy-b',
          label:
            'Cryptographically trustless — once requested, the protocol guarantees your coins return no matter what miners do',
          correct: false,
          feedback:
            'Not so. The withdrawal depends on miners ACKing the bundle. A hostile majority can stall it past expiry, so the guarantee rests on an honest/incentivized majority, not cryptography.',
        },
        {
          id: 'qy-c',
          label:
            'Instant and final, the same as an ordinary on-chain Bitcoin transaction',
          correct: false,
          feedback:
            'A withdrawal is deliberately the opposite of instant: a 13,150-of-26,300 vote over months. That delay is the safety feature, not a flaw.',
        },
      ],
    },
  ],

  glossary: [
    {
      id: 'withdrawal-bundle',
      term: 'Withdrawal bundle',
      short:
        'Many individual sidechain withdrawals batched into a single rare Bitcoin transaction, identified by one blinded hash that miners vote on.',
      example: 'Miners ACK the bundle’s hash, not each user’s request.',
    },
    {
      id: 'm6',
      term: 'M6 (payout)',
      short:
        'The BIP300 message that actually pays out an approved withdrawal bundle on Bitcoin. A node rejects an M6 whose bundle has not reached the ACK threshold.',
    },
    {
      id: 'ack',
      term: 'ACK',
      short:
        'A miner’s signal of support for a withdrawal bundle. At most one ACK per block per bundle, so a bundle’s count moves by at most 1 each block.',
      example: 'A bundle needs 13,150 ACKs to succeed.',
    },
    {
      id: 'vote-window',
      term: 'Vote window',
      short:
        'The 26,300-block (~6-month) countdown a withdrawal bundle has to gather enough ACKs. If it expires unapproved, the bundle is dropped.',
    },
    {
      id: 'ack-threshold',
      term: 'ACK threshold',
      short:
        'The 13,150 ACKs — half the 26,300-block window — a bundle must reach before its payout can be included in a block.',
    },
    {
      id: 'hostile-majority',
      term: 'Hostile hashrate majority',
      short:
        'More than 50% of mining power acting against users. It can censor or redirect a withdrawal via the vote, but cannot spend your keys or forge a deposit.',
    },
    {
      id: 'invalid-withdrawal',
      term: 'Invalid withdrawal',
      short:
        'A fraudulent bundle that pays sidechain funds to an attacker. BIP300 admits this risk and relies on miners’ fee incentive — not cryptography — to deter it.',
    },
    {
      id: 'deposit',
      term: 'Deposit (M5)',
      short:
        'Moving value onto a sidechain. It can only move value already escrowed for that sidechain, so miners cannot fabricate deposits.',
    },
    {
      id: 'drivechain',
      term: 'Drivechain',
      short:
        'A proposed Bitcoin soft fork (BIP300/BIP301) that would let Bitcoin support miner-secured sidechains. It is a proposal, not a live mainnet feature.',
    },
  ],

  advanced: {
    title: 'Inside the withdrawal mechanism (advanced path)',
    intro:
      'This beginner lesson stops here on purpose. The details below are real and important, but you do not need them to understand how — and why — coins leave a sidechain slowly.',
    points: [
      {
        term: 'M3 / M4 / M5 / M6 messages',
        blurb:
          'The four BIP300 coinbase/transaction messages that propose a bundle, ACK it, deposit, and finally pay out — the wire-level detail behind the vote.',
      },
      {
        term: 'The blinded bundle hash',
        blurb:
          'Why miners vote on a single hash rather than each withdrawal, and how that hash is committed and matched at payout time.',
      },
      {
        term: 'The theft window',
        blurb:
          'The "one catastrophe per 13,150 blocks" the spec admits, and the economic-incentive argument that is supposed to make redirect attacks irrational.',
      },
      {
        term: 'Enforcer constants vs. spec',
        blurb:
          'The reference code ships test values (small MAX_AGE/threshold); the 26,300 / 13,150 figures are the spec’s mainnet parameters — confirm which you are reading.',
      },
    ],
    reassurance:
      'You do not need any of these to reason about a withdrawal honestly. Come back when a specific detail matters to you.',
  },

  sources: [
    {
      label: 'Source repurposed',
      detail:
        'BIP300 spec — the withdrawal (M3/M4/M5/M6) section — reauthored, not copied. Reuses the lesson #1 ACK-timeline interactive for the bundle vote.',
    },
    {
      label: 'Primary sources',
      detail:
        'BIP300 mediawiki (bundle parameters 26,300 / 13,150, the +/-1-per-block ACK rule, the admitted invalid-withdrawal risk) and bip300301_enforcer (threshold-enforcement code, pinned commit). Every claim above links its own source.',
    },
    {
      label: 'Accuracy note',
      detail:
        'Drivechain is a proposed Bitcoin soft fork and is not active on mainnet. The 26,300 / 13,150 figures are BIP300 spec (mainnet) parameters; the Enforcer reference code carries test constants, so the enforcer-code claim is flagged needs-recheck. This lesson is an educational simulation.',
    },
  ],
}
