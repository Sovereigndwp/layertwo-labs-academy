# Create a Sidechain Without Breaking Bitcoin — Lesson Spec

A beginner, first-principles rebuild of Paul Sztorc's article "Creating a
Sidechain" (LayerTwo Labs). This document is the design record; the live copy
is in [`src/data/lessonData.ts`](../src/data/lessonData.ts) and the state shape
in [`src/state/types.ts`](../src/state/types.ts).

> **Accuracy guardrail (applies everywhere):** Drivechain is a *proposed*
> Bitcoin soft fork (BIP300 / BIP301). DriveNet and Testchain are LayerTwo Labs
> *testing* software. Nothing here is live on Bitcoin mainnet. This lesson is an
> educational simulation.

---

## A. The beginner lesson (prose)

**Promise:** by the end you understand how a new Drivechain sidechain gets
proposed, recognized by miners, activated over time, and connected back to
Bitcoin — without forcing anything onto people who don't use it.

1. **The big idea.** Bitcoin is one busy main road everyone trusts. A *sidechain*
   is a separate road connected to it, for people who want to try something
   different. *Drivechain* is a proposed way to let people build those side roads
   without forcing every Bitcoin user to drive on them. If a side road fails, the
   main road keeps working.
2. **First principles.** A sidechain is a separate chain anchored to Bitcoin
   (coins move out and back). A *slot* is an empty parking space for one
   sidechain; DriveNet sets aside 256 so the set stays small and reviewable.
   Most people will never make one — but anyone deserves to understand how it
   would happen.
3. **Choose a slot.** DriveNet has 256 numbered slots, mostly blank. We reserve
   slot 1 for "Testchain." Reserving a slot does **not** create or run a
   sidechain; it only reserves a place where real software can be recognized.
4. **Set the identity.** Every deposit carries a few "address bytes" so the
   network knows which sidechain it's for. The bytes are arbitrary but must be
   **unique** — if two sidechains shared a tag, deposits would be ambiguous and
   coins could be credited to the wrong chain.
5. **Pick the official version.** The proposal flags one software release as the
   authoritative definition. This isn't freezing the software forever — it gives
   everyone a clear starting definition so future "what is this really?" disputes
   are easier to avoid. (Later soft-fork versions can ship as long as withdrawals
   mirror the flagged release.)
6. **Miner ACKs.** Miners include one ACK — one signal of recognition — per
   block. The future target is 1916 of the past 2016 blocks (~95%). It's slow on
   purpose: repeated signals over time give the whole network a chance to react.
7. **Activate.** Once the threshold is reached, the slot flips from "proposed" to
   "active." **Changed:** the network now recognizes the slot. **Not changed:**
   nothing runs automatically — people still must download and run the real
   software.
8. **Connect to Bitcoin.** To run Testchain you point it at a Bitcoin full node
   (here, DriveNet), like a Lightning node needs a Bitcoin node. The sidechain
   doesn't float in space; Bitcoin stays its reference point.
9. **Reflect.** Four no-stakes questions (see D).
10. **What comes next.** The advanced "For Miners" path (blind merged mining,
    BIP300/301, withdrawals) is named but not taught here. Most users can ignore
    the blind-merged-mining warnings as beginners.

## B. Interactive storyboard

| # | Step kind | Component | Learner action | Feedback moment | Gate to advance |
|---|-----------|-----------|----------------|-----------------|-----------------|
| 1 | `hook` | `HookScreen` | read two-lane road analogy | info banner | always |
| 2 | `principles` | `PrinciplesScreen` | skim 4 numbered cards | — | always |
| 3 | `slot` | `SlotGrid` | click slot 1, name it | "Slot reserved" ok banner | a slot is selected |
| 4 | `identity` | `AddressBytesGame` | pick a tag (1 is taken) | collision (bad) vs unique (ok) | landed on a unique tag |
| 5 | `release` | `SoftwareReleaseSelector` | flag a release | stable (ok) vs risky (info) | a release is chosen |
| 6 | `acks` | `AckTimeline` | mine blocks / drag slider | live % + threshold marker | reached 1916/2016 |
| 7 | `activation` | `ActivationStateCard` | press Activate | changed vs not-changed columns | status is active |
| 8 | `connect` | `NodeConnectionMap` | click to connect nodes | "Connected" ok banner | nodeConnected |
| 9 | `quiz` | `ReflectionQuiz` | answer 4 questions | per-answer feedback | all answered |
| 10 | `advanced` | `AdvancedConceptLockbox` | unlock preview | topic list + reassurance | always |

Cross-cutting: persistent `FactBadge`, `ProgressRail` (jump back to visited
steps, no skipping ahead), `GlossaryDrawer` (opens from any `Term` or toolbar),
`SidechainProposalForm` recap on steps 4–5, `SourcesFooter` always.

## C. Screen-by-screen UX copy

Authoritative copy is in `lessonData.ts` (`steps[]` carry `headline`, `explain`,
`actionHint`, `why`). Every screen follows the same five beats enforced by
`StepFrame`: **eyebrow · headline · one-sentence explain · learner action ·
"why this matters."** Edit copy there; do not hardcode strings in components.

## D. Quiz questions + feedback

In `lessonData.quiz`. Four reflection questions, select-one, **no score** — each
choice (right or wrong) returns teaching feedback:

1. *What protects against confusion?* → the unique address-byte identity tag.
2. *What makes activation slow?* → miners ACK one block at a time toward ~95%.
3. *What connects the sidechain back to Bitcoin?* → a Bitcoin full-node connection.
4. *What if identity wasn't unique?* → deposits between sidechains become ambiguous.

## E. Glossary

In `lessonData.glossary` (10 terms): sidechain, drivechain, DriveNet, slot, full
node, miner, ACK, address bytes, soft fork, deposit. Each has a short definition
and most have an example. Surfaced inline via `<Term id="…">` (hover/focus
tooltip) and in the slide-in `GlossaryDrawer`.

## F. Developer implementation plan

**Done (this build):** Vite + React + TS app; content/engine split; pure reducer
+ context + localStorage; all 10 steps and 12+ components; dark/orange token
system; keyboard + a11y; clean `npm run build`; verified rendering in-browser.

**Next:**
1. Add unit tests for `lessonReducer` (pure function — easy wins: clamps,
   quiz replace-by-question, activation flow).
2. Extract a tiny `Lesson` registry so multiple lessons share routing.
3. Optional telemetry hook in the provider's persistence effect (step reached,
   quiz answers) — privacy-respecting, no PII.
4. Lesson #2 (e.g., "What is a deposit?") reusing the engine.

## G. React component map

Shell/engine: `LessonShell` (+ `StepRouter`), `ProgressRail`, `StepFrame`,
`LessonProvider`/`useLesson`. Modules: `HookScreen`, `PrinciplesScreen`,
`SlotGrid`, `AddressBytesGame`, `SoftwareReleaseSelector`, `AckTimeline`,
`ActivationStateCard`, `NodeConnectionMap`, `ReflectionQuiz`,
`AdvancedConceptLockbox`. Primitives: `Term`, `Tooltip`, `FactBadge`,
`GlossaryDrawer`, `SidechainProposalForm`, `SourcesFooter`.

## H. Lesson state model

In `src/state/types.ts` (`LessonState`). Fields: `lessonStep`, `selectedSlot`,
`sidechainName` (default "Testchain"), `addressBytes`, `isAddressBytesUnique`,
`selectedRelease`, `ackCount`, `ackThreshold` (1916), `activationStatus`
(default "not proposed"), `nodeConnected`, `quizAnswers[]`, `glossaryOpen`,
`glossaryFocusTerm`, `advancedUnlocked`. Mutated only through `lessonReducer`
via `LessonAction`. Persisted to `localStorage` (`l2l:create-a-sidechain:v1`).

## I. Accessibility notes

- Every interaction is a real `<button>`, `<input type=range>`, or labeled
  control — fully keyboard operable. Node connection is **click-to-connect**, not
  drag-only.
- Visible focus rings on all interactive elements (`:focus-visible`).
- **No color-only state:** success/failure always pair an icon + text label.
- `aria-live` regions for the ACK percentage, activation status, and feedback
  banners; `role="progressbar"` on the ACK bar with min/max/now.
- Skip-to-lesson link; landmark `header`/`main`/`footer`; dialog semantics on the
  glossary drawer with Escape-to-close and focus management.
- Honors `prefers-reduced-motion`; minimum body text ≈ 0.95rem; 44px touch
  targets; mobile-first grid that reflows.

## J. Concepts deferred to advanced lessons

Named here, taught later: **blind merged mining**, **BIP300 (hashrate escrow)**,
**BIP301 (blind merged mining mechanism)**, **withdrawals** (main-chain return
path), soft-fork activation internals, and the full miner security model. These
live behind `AdvancedConceptLockbox`; beginners are told they can safely ignore
the blind-merged-mining warnings for now.

---

**Source article:** "Creating a Sidechain," Paul Sztorc (LayerTwo Labs).
**Related concepts:** Drivechain, DriveNet, Testchain, BIP300, BIP301, miner
ACKs, sidechain slots, blind merged mining.
