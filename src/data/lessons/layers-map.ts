// ---------------------------------------------------------------------------
// Lesson #2 — "Where Drivechain Sits Among Bitcoin's Layers"
// ---------------------------------------------------------------------------
// All learner-facing copy + the layer-map data live here. Reuses the same
// engine as lesson #1 (LessonShell routes step.kind → component). The only new
// renderer is `LayerMap` (kind === 'layers').
//
// Factual guardrail (same as the course): Drivechain is a PROPOSED Bitcoin soft
// fork (BIP300/301), not live on mainnet. The OTHER layers here (Lightning,
// Liquid, Ark, BitVM/rollups) are real and running, but differ widely in
// maturity and trust assumptions — said honestly, with primary sources. The
// "Layer 1–5" stacking is editorial taxonomy, NOT a protocol fact.
// ---------------------------------------------------------------------------
import type { LessonData } from '../lessonData'

const TODAY = '2026-06-07'

export const layersMapLesson: LessonData = {
  id: 'where-drivechain-sits',
  summary:
    "How Drivechain compares to Bitcoin's other layers — Lightning, Liquid, Ark, rollups — by the one question that matters: who, if anyone, can stop you exiting back to Bitcoin.",
  audience: 'beginner',
  tags: ['layer2', 'drivechain', 'lightning', 'liquid', 'ark', 'sidechains'],
  estMinutes: 10,
  prerequisites: ['create-a-sidechain'],

  claims: [
    {
      id: 'lightning-self-custody',
      text: 'Lightning payments run over two-party channels secured by Bitcoin scripts; either party can unilaterally close the channel and settle on Bitcoin’s main chain, so the funds stay self-custodial.',
      tier: 'DEV',
      sources: [
        { label: 'BOLT #5 — On-chain handling', url: 'https://github.com/lightning/bolts/blob/master/05-onchain.md' },
        { label: 'BOLT #2 — Channel management', url: 'https://github.com/lightning/bolts/blob/master/02-peer-protocol.md' },
      ],
      verifiedOn: TODAY,
      status: 'verified',
    },
    {
      id: 'lightning-routing',
      text: 'Multi-hop Lightning payments are forwarded in onion-encrypted packets (BOLT #4); an intermediate node that tampers with one breaks the cryptographic chain and the payment fails rather than letting funds be stolen.',
      tier: 'DEV',
      sources: [
        { label: 'BOLT #4 — Onion routing', url: 'https://github.com/lightning/bolts/blob/master/04-onion-routing.md' },
      ],
      verifiedOn: TODAY,
      status: 'verified',
    },
    {
      id: 'lightning-watchtower',
      text: 'To catch a counterparty who broadcasts an old, revoked channel state, a Lightning user must stay online — or delegate to a watchtower — to publish the penalty transaction within the timelock window.',
      tier: 'INST',
      sources: [
        { label: 'BOLT #5 — Revoked transaction close', url: 'https://github.com/lightning/bolts/blob/master/05-onchain.md' },
        { label: 'Lightning Labs — Watchtowers', url: 'https://docs.lightning.engineering/the-lightning-network/payment-channels/watchtowers' },
      ],
      verifiedOn: TODAY,
      status: 'verified',
    },
    {
      id: 'liquid-federation',
      text: 'Liquid is a federated sidechain: a set of functionaries jointly secure the Bitcoin peg with a multisig, so moving coins in and out depends on that federation, not on you alone.',
      tier: 'INST',
      sources: [
        { label: 'Liquid — Technical overview', url: 'https://docs.liquid.net/docs/technical-overview' },
        { label: 'Blockstream — Liquid Federation multisig', url: 'https://help.blockstream.com/hc/en-us/articles/900002386446-How-does-the-Liquid-Federation-s-multisig-work' },
      ],
      verifiedOn: TODAY,
      status: 'verified',
    },
    {
      id: 'liquid-multisig',
      text: 'Bitcoin on Liquid is currently held in an 11-of-15 functionary multisig; the maximum number of keys is configurable under Liquid’s Dynamic Federations, so 15 is the current setting rather than a fixed constant.',
      tier: 'INST',
      sources: [
        { label: 'Blockstream — Liquid Federation multisig', url: 'https://help.blockstream.com/hc/en-us/articles/900002386446-How-does-the-Liquid-Federation-s-multisig-work' },
      ],
      verifiedOn: TODAY,
      status: 'verified',
    },
    {
      id: 'liquid-blocks-ct',
      text: 'Liquid produces a block about once a minute and uses Confidential Transactions to hide payment amounts from third parties.',
      tier: 'PROJ',
      sources: [
        { label: 'Liquid — Technical overview', url: 'https://docs.liquid.net/docs/technical-overview' },
        { label: 'Elements — Confidential Transactions', url: 'https://elementsproject.org/features/confidential-transactions' },
      ],
      verifiedOn: TODAY,
      status: 'verified',
    },
    {
      id: 'ark-exit',
      text: 'Ark lets users transact off-chain through a coordinating service provider that batches shared outputs; a user can unilaterally exit to Bitcoin even if the provider stops responding, but the provider can refuse to serve them in future rounds.',
      tier: 'PROJ',
      sources: [
        { label: 'Ark — Introduction (second.tech)', url: 'https://second.tech/docs/learn/intro' },
        { label: 'Ark protocol spec (PDF)', url: 'https://docs.arklabs.xyz/ark.pdf' },
      ],
      verifiedOn: TODAY,
      // Ark's docs are mid-rebrand (arkdev → arklabs → arkadeos) and the protocol
      // is still evolving — re-verify the canonical URL + wording before relying on it.
      status: 'needs-recheck',
    },
    {
      id: 'bitvm-fraud-proofs',
      text: 'BitVM-style rollups commit their results back to Bitcoin and rely on fraud proofs; the work is early — the reference implementation is explicitly marked not for production use.',
      tier: 'DEV',
      sources: [
        { label: 'BitVM — Overview', url: 'https://bitvm.org/' },
        { label: 'BitVM reference implementation', url: 'https://github.com/BitVM/BitVM' },
      ],
      verifiedOn: TODAY,
      // Fast-moving research area — re-verify status before relying on it.
      status: 'needs-recheck',
    },
    {
      id: 'drivechain-proposed',
      text: 'Drivechain is a proposed Bitcoin soft fork (BIP300 + BIP301) and is not live on Bitcoin mainnet.',
      tier: 'PROJ',
      sources: [
        { label: 'Drivechain.info', url: 'https://www.drivechain.info' },
        { label: 'bip300301_enforcer (LayerTwo Labs)', url: 'https://github.com/LayerTwo-Labs/bip300301_enforcer' },
      ],
      verifiedOn: TODAY,
      status: 'verified',
    },
    {
      id: 'drivechain-withdrawal',
      text: 'In BIP300, a sidechain-withdrawal bundle runs a miner vote over a 26,300-block window and succeeds at 13,150 ACKs. Because approval rests on a sustained miner majority, a hostile majority could in principle block or redirect a withdrawal — the central, debated tradeoff.',
      tier: 'DEV',
      sources: [
        { label: 'BIP300 spec', url: 'https://github.com/bitcoin/bips/blob/master/bip-0300.mediawiki' },
        { label: 'bip300301_enforcer (LayerTwo Labs)', url: 'https://github.com/LayerTwo-Labs/bip300301_enforcer' },
      ],
      verifiedOn: TODAY,
      status: 'verified',
    },
  ],

  analogy: {
    world: 'roads',
    blurb:
      'Bitcoin is the one highway everyone shares. Each layer is a different way to travel it — trading something for speed, scale, or privacy.',
    mappings: [
      // One road (Bitcoin); every layer is a different VEHICLE on it.
      { term: 'Bitcoin', element: 'the one highway everyone shares — slow, but the final word' },
      { term: 'Lightning', element: 'your own fast car for frequent small trips' },
      { term: 'Liquid', element: 'a private coach run by a named consortium — you ride, they hold the keys' },
      { term: 'sidechain', element: 'a chartered minibus on the numbered route you opened in lesson 1' },
      { term: 'Ark', element: 'a shared shuttle that batches riders to save space' },
      { term: 'rollup', element: 'a chartered bus that posts its route back to the highway' },
    ],
  },

  layers: [
    {
      id: 'bitcoin',
      name: 'Bitcoin (base chain)',
      metaphor: 'The main highway everyone shares — slow, but the final word on where value is.',
      trustModel: 'Trustless — you + Bitcoin',
      maturity: 'live',
      tradeoff:
        'Final and censorship-resistant, but slow (~10-minute blocks) and limited in how many trips it can carry.',
      whoCanStopExit:
        'No one. You hold the keys. A hostile majority could delay or reorder recent blocks, but cannot spend your coins.',
      hostileOutcome: 'holds',
      trust: 5,
      finality: 5,
      claimIds: [],
    },
    {
      id: 'lightning',
      name: 'Lightning',
      metaphor: 'Your own fast car for frequent small trips — you keep the car and the keys.',
      trustModel: 'Self-custody',
      maturity: 'live',
      tradeoff:
        'Instant, sub-cent payments — but you give up “set and forget”: you need channel liquidity and must stay online (or use a watchtower).',
      whoCanStopExit:
        'No one can seize your coins. Your channel partner can force an on-chain close; if you are offline with no watchtower they could try to publish an old state, which a watchtower defeats.',
      hostileOutcome: 'holds',
      trust: 15,
      finality: 20,
      claimIds: ['lightning-self-custody', 'lightning-routing', 'lightning-watchtower'],
    },
    {
      id: 'liquid',
      name: 'Liquid',
      metaphor: 'A private coach run by a named consortium — you ride, but they hold the keys to the doors.',
      trustModel: 'Federation (named functionaries)',
      maturity: 'live',
      tradeoff:
        'About 1-minute blocks and hidden amounts — in exchange for trusting a fixed federation to hold the peg.',
      whoCanStopExit:
        'The federation. Moving coins back to Bitcoin needs the functionaries’ multisig (currently 11 of 15); if enough of them refuse, your peg-out is blocked.',
      hostileOutcome: 'fails',
      trust: 75,
      finality: 55,
      claimIds: ['liquid-federation', 'liquid-multisig', 'liquid-blocks-ct'],
    },
    {
      id: 'ark',
      name: 'Ark',
      metaphor: 'A shared shuttle that batches many riders into one trip to save space.',
      trustModel: 'Provider-coordinated, self-exit',
      maturity: 'emerging',
      tradeoff:
        'Cheap, pooled payments without channels — but you depend on a provider to run rounds, and must exit before a timeout if it goes quiet.',
      whoCanStopExit:
        'No one can seize your coins: you can unilaterally exit to Bitcoin even if the provider disappears. The provider can only refuse to serve you in future rounds.',
      hostileOutcome: 'degrades',
      trust: 45,
      finality: 40,
      claimIds: ['ark-exit'],
    },
    {
      id: 'drivechain',
      name: 'Drivechain sidechain',
      metaphor: 'A chartered minibus on the numbered route you opened in lesson 1.',
      trustModel: 'Miner-majority (proposed)',
      maturity: 'proposed',
      tradeoff:
        'Lets Bitcoin try almost any new feature on a side road — but withdrawals rest on a months-long miner vote, a hashrate-majority trust assumption.',
      whoCanStopExit:
        'A miner majority. A withdrawal bundle needs 13,150 of a 26,300-block vote; a sustained hostile majority could, in principle, block or redirect it. That is exactly why Drivechain is debated.',
      hostileOutcome: 'fails',
      trust: 80,
      finality: 85,
      claimIds: ['drivechain-proposed', 'drivechain-withdrawal'],
    },
    {
      id: 'rollups',
      name: 'Rollups / BitVM',
      metaphor: 'A chartered bus that posts its planned route back to the highway so anyone can check it.',
      trustModel: 'Operator + fraud proofs (early)',
      maturity: 'emerging',
      tradeoff:
        'Strong programmability anchored to Bitcoin by fraud proofs — but the designs are early and not production-ready.',
      whoCanStopExit:
        'It depends on the design and a fraud-proof window: an operator can stall, and these systems are early — the reference code is marked not for production.',
      hostileOutcome: 'degrades',
      trust: 55,
      finality: 60,
      claimIds: ['bitvm-fraud-proofs'],
    },
  ],

  slug: 'where-drivechain-sits-among-bitcoins-layers',
  title: 'Where Drivechain Sits Among Bitcoin’s Layers',
  promise:
    'By the end, you will be able to place Drivechain next to Lightning, Liquid, Ark, and rollups — and say, for each, what you give up and who (if anyone) can stop you exiting back to Bitcoin.',
  factBadge: {
    short: 'Drivechain proposed · others live, varying maturity',
    full:
      'Drivechain is a proposed Bitcoin soft fork (BIP300 / BIP301) and is not active on Bitcoin mainnet. The other layers here — Lightning, Liquid, Ark, and rollups/BitVM — are real and running, but differ widely in maturity and trust. “Layer 1–5” is an editorial way to stack them by trust assumptions, not an official protocol fact.',
  },

  steps: [
    {
      id: 'hook',
      kind: 'hook',
      navLabel: 'One road, many trips',
      headline: 'You built a side road. Now look at the whole map.',
      explain:
        'In lesson 1 you opened one side road off Bitcoin. But a sidechain is just one way to travel the main highway. There are several — and each makes a different bargain with you.',
      actionHint: 'Read the idea, then continue.',
      why: 'No single road serves every trip. Knowing the options is how you judge where Drivechain actually fits.',
      nextLabel: 'The three questions',
    },
    {
      id: 'principles',
      kind: 'principles',
      navLabel: 'Three honest questions',
      headline: 'Judge every layer by three questions.',
      explain:
        'Forget the marketing. A layer is only as good as its honest answers to these three. You will use them on every card next.',
      actionHint: 'Skim the three questions, then continue.',
      why: 'Speed and fees are easy to compare. These three — custody, exit, finality — are where the real tradeoffs hide.',
      body: [
        'Why layers at all: Bitcoin’s base chain is final and trustless — but slow, and it can only carry so many transactions. That one constraint is the reason every other layer exists.',
        'Custody: on some layers you alone hold the keys. On others you trust a company, a federation, or miners to let you out.',
        'Exit: the real test of a layer is who — if anyone — can stop you moving your coins back to Bitcoin.',
        'Finality: how quickly, and how surely, a payment becomes “done” differs sharply from one layer to the next.',
      ],
      nextLabel: 'Compare the layers',
    },
    {
      id: 'layer-map',
      kind: 'layers',
      navLabel: 'Compare the layers',
      headline: 'Probe each layer’s real trust tradeoff.',
      explain:
        'Open each layer to see its bargain: what it buys you, what you give up, and the one question that separates them — who can stop you exiting back to Bitcoin? Then flip the switch and assume the operator turns hostile.',
      actionHint:
        'Open at least three layers, then toggle “assume the operator turns hostile” to see whose exit holds and whose fails.',
      why: 'When you force the hostile case, the layers split cleanly: self-custody (Bitcoin, Lightning) holds; a federation (Liquid) or a miner majority (Drivechain) can fail. That split is the whole point.',
    },
    {
      id: 'drivechain-fit',
      kind: 'layers',
      navLabel: 'Where Drivechain sits',
      headline: 'Place Drivechain — and see why it’s debated.',
      explain:
        'Each layer sits somewhere on two axes: how much you must trust someone else, and how contingent your final settlement is. Place the layers, then push the one slider that defines the Drivechain debate.',
      actionHint:
        'Reveal the map, then drag the “hostile hashrate” slider past 50% to see what happens to a Drivechain withdrawal.',
      why: 'Drivechain lands in the high-trust, contingent-finality corner: its withdrawals depend on a miner majority. Past 50% hostile hashrate, that assumption breaks — the exact tradeoff you met in lesson 1.',
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
    },
    {
      id: 'advanced',
      kind: 'advanced',
      navLabel: 'Beyond the map',
      headline: 'The map keeps going — for later.',
      explain:
        'These six layers are enough to place Drivechain honestly. Several more sit on the same spectrum; they live behind here for when you are ready.',
      actionHint: 'Preview the other approaches.',
      why: 'Knowing what you are choosing not to study yet is part of learning.',
    },
  ],

  // Lesson #2 does not use the slot / identity / release interactives.
  addressByteTags: [],
  releases: [],

  quiz: [
    {
      id: 'q-self-custody',
      prompt: 'Which layers keep your coins self-custodial even if the operator turns hostile?',
      choices: [
        {
          id: 'q1a',
          label: 'Bitcoin and Lightning',
          correct: true,
          feedback:
            'Right. On both, you hold the keys — no operator or federation can seize your coins. On Lightning you do have to stay online (or use a watchtower) to defend an old-state close.',
        },
        {
          id: 'q1b',
          label: 'Liquid and Drivechain',
          correct: false,
          feedback:
            'These are the opposite case: Liquid needs the federation to let you peg out, and a Drivechain withdrawal needs a miner majority. A hostile operator can block either.',
        },
        {
          id: 'q1c',
          label: 'All of them — they’re all on Bitcoin',
          correct: false,
          feedback:
            'Anchoring to Bitcoin is not the same as self-custody. Who can stop your exit differs sharply per layer — that’s the whole comparison.',
        },
      ],
    },
    {
      id: 'q-drivechain-exit',
      prompt: 'Who approves a Drivechain withdrawal back to Bitcoin?',
      choices: [
        {
          id: 'q2a',
          label: 'A miner majority, over a long voting window',
          correct: true,
          feedback:
            'Correct. A withdrawal bundle needs 13,150 of a 26,300-block miner vote. That reliance on a hashrate majority is exactly why Drivechain is debated.',
        },
        {
          id: 'q2b',
          label: 'A company that runs the sidechain',
          correct: false,
          feedback:
            'There is no company gate in the proposal — that’s closer to a federation like Liquid. Drivechain withdrawals are decided by miners, collectively.',
        },
        {
          id: 'q2c',
          label: 'No one — it’s instant and automatic',
          correct: false,
          feedback:
            'Withdrawals are deliberately slow and voted-on. That delay is a feature (time to notice), but it means miners hold the power.',
        },
      ],
    },
    {
      id: 'q-liquid',
      prompt: 'What does Liquid trade for ~1-minute blocks and hidden amounts?',
      choices: [
        {
          id: 'q3a',
          label: 'Trust in a named federation that holds the peg',
          correct: true,
          feedback:
            'Right. A fixed set of functionaries secures the peg (currently an 11-of-15 multisig). You gain speed and privacy; you give up self-custody of the peg.',
        },
        {
          id: 'q3b',
          label: 'Nothing — it’s just a faster Bitcoin',
          correct: false,
          feedback:
            'There’s no free lunch. Liquid’s speed and confidentiality come from trusting the federation rather than only Bitcoin.',
        },
        {
          id: 'q3c',
          label: 'The ability to ever return to Bitcoin',
          correct: false,
          feedback:
            'You can peg back to Bitcoin — but only with the federation’s cooperation. The trade is trust, not a one-way door.',
        },
      ],
    },
    {
      id: 'q-taxonomy',
      prompt: 'Is calling Drivechain “Layer 5” an official Bitcoin classification?',
      choices: [
        {
          id: 'q4a',
          label: 'No — it’s an editorial way to stack the layers',
          correct: true,
          feedback:
            'Correct. The “Layer 1–5” numbering is a teaching device for sorting layers by trust assumptions, not a protocol fact. Drivechain itself is a proposed soft fork, not live.',
        },
        {
          id: 'q4b',
          label: 'Yes — Bitcoin defines five official layers',
          correct: false,
          feedback:
            'Bitcoin defines no such numbered hierarchy. The layer numbers are an editorial map, useful but not authoritative.',
        },
        {
          id: 'q4c',
          label: 'Yes — once BIP300 activates it becomes Layer 5',
          correct: false,
          feedback:
            'Activation would make Drivechain real, but it still wouldn’t create an official “Layer 5” — the numbering is editorial either way.',
        },
      ],
    },
  ],

  glossary: [
    {
      id: 'trust-model',
      term: 'Trust model',
      short: 'Who you have to rely on for a layer to behave — yourself only, a company, a federation, or miners.',
      example: 'Lightning’s trust model is self-custody; Liquid’s is a federation.',
    },
    {
      id: 'self-custody',
      term: 'Self-custody',
      short: 'You alone hold the keys, so no one else can seize or freeze your coins.',
      example: 'On Bitcoin and Lightning you keep self-custody.',
    },
    {
      id: 'federation',
      term: 'Federation',
      short: 'A fixed, named group that jointly controls something via multisig — here, a sidechain’s peg.',
      example: 'Liquid’s functionaries are a federation securing the Bitcoin peg.',
    },
    {
      id: 'peg-out',
      term: 'Peg-out',
      short: 'Moving coins from a sidechain back to Bitcoin’s main chain.',
      example: 'A Liquid peg-out needs the federation’s multisig.',
    },
    {
      id: 'htlc',
      term: 'HTLC',
      short: 'Hash Time-Locked Contract — the Bitcoin script that lets a Lightning payment hop across nodes without trusting them.',
    },
    {
      id: 'watchtower',
      term: 'Watchtower',
      short: 'A service that watches the chain for you and publishes the penalty transaction if a Lightning partner cheats while you’re offline.',
    },
    {
      id: 'ark-asp',
      term: 'Ark provider',
      short: 'The service that coordinates Ark rounds and batches users’ outputs. It can refuse service, but cannot seize funds — you can always exit.',
    },
    {
      id: 'withdrawal-vote',
      term: 'Withdrawal vote',
      short: 'In Drivechain (BIP300), the long miner vote that approves moving coins from a sidechain back to Bitcoin.',
      example: 'A bundle needs 13,150 ACKs across a 26,300-block window.',
    },
    {
      id: 'finality',
      term: 'Finality',
      short: 'How surely and how irreversibly a payment is “done”. Stronger on Bitcoin’s base chain; more contingent on layers that depend on others.',
    },
    {
      id: 'confidential-transactions',
      term: 'Confidential Transactions',
      short: 'A technique (used by Liquid) that hides the amounts in a transaction from third parties while still letting the network verify it.',
    },
    {
      id: 'fraud-proof',
      term: 'Fraud proof',
      short: 'A way to anchor an off-chain system to Bitcoin: if someone posts a false result, anyone can prove it on-chain and the cheat is rejected.',
      example: 'BitVM-style rollups rely on fraud proofs.',
    },
    {
      id: 'drivechain',
      term: 'Drivechain',
      short: 'A proposed Bitcoin soft fork (BIP300/BIP301) that would let Bitcoin support miner-secured sidechains without new coins.',
      example: 'It is a proposal, not a live mainnet feature.',
    },
    {
      id: 'sidechain',
      term: 'Sidechain',
      short: 'A separate chain that uses Bitcoin as its anchor, so coins can move out to it and back.',
    },
  ],

  advanced: {
    title: 'Beyond the six (other layers on the same spectrum)',
    intro:
      'These six layers are enough to place Drivechain honestly. Several more sit on the same custody-and-exit spectrum — named here, not taught, for when you want to go further.',
    points: [
      {
        term: 'Fedimint / Chaumian eCash',
        blurb:
          'Community “mints” where guardians hold custody but cannot link your payments. Strong privacy; custody trust sits with the guardians.',
      },
      {
        term: 'RGB / Taproot Assets',
        blurb:
          'Client-side validation for issuing tokens and assets on Bitcoin without bloating the chain.',
      },
      {
        term: 'Mercury / statechains',
        blurb:
          'Transfer ownership of a whole UTXO off-chain, instantly, via a coordinating server you can still exit from.',
      },
      {
        term: 'Spacechains',
        blurb:
          'Another blind-merged-mining sidechain idea, with different security and governance tradeoffs from Drivechain.',
      },
      {
        term: 'BitVM',
        blurb:
          'Fraud-proof computation that could anchor rollups to Bitcoin — early-stage, not production-ready.',
      },
    ],
    reassurance:
      'You do not need any of these to judge where Drivechain sits. Come back when a specific one matters to you.',
  },

  sources: [
    {
      label: 'Source repurposed',
      detail:
        'Bitcoin Sovereign Academy — “Bitcoin Layers Map” interactive (reauthored, not copied). Its “Layer 1–5” numbering is editorial.',
    },
    {
      label: 'Primary sources',
      detail:
        'Lightning BOLTs (github.com/lightning/bolts); Blockstream Liquid docs; Ark protocol docs; BitVM; BIP300 + bip300301_enforcer. Every claim above links its own source.',
    },
    {
      label: 'Accuracy note',
      detail:
        'Drivechain is a proposed Bitcoin soft fork and is not active on mainnet. Other layers are real with varying maturity. Volatile network stats (channel counts, capacities) are deliberately omitted; numbers shown are protocol parameters from primary sources.',
    },
  ],
}
