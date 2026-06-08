# Lesson Brief

How to commission a new lesson. Most of the standard is already enforced by the
codebase + process, so a new lesson only needs the **5 specifics** in section 2.

To kick one off, hand me a filled-in section 2 — or, for a lesson already queued
below, just say "Build lesson #N."

---

## 1. What's automatic (do NOT need to re-state)

These apply to every lesson and are enforced by CLAUDE.md, the CI gates, and the
two audit subagents:

- **First principles lead; analogy is a labeled, skippable helper** — see
  `docs/authoring/epistemic-depth.md`.
- **Every interactive must clear the depth bar:** WHAT (real procedure) · HOW
  (mechanism responds) · WHY (probe a boundary until it breaks → rationale
  discovered) · HOW-WE-KNOW (spec/source + a falsifier). Flip-cards/toys fail.
- **Every factual claim is a `VerifiableClaim`** — sourced, dated, and
  **verified against primary sources (the Enforcer code / protocol specs), not
  blog posts.** Numbers you can't confirm ship `needs-recheck`, not asserted.
- **One analogy world per lesson** (reuse the course "roads"/transport world
  unless deliberately starting a new one); declare it in `analogy`. See
  `docs/authoring/analogy-audit.md`.
- **Guardrails:** Drivechain is a *proposed* soft fork, not live on mainnet;
  other layers are real with varying maturity — say so honestly. No hype, no
  tribal language. Surface real tradeoffs and debates.
- **Accessibility is part of done** (keyboard, focus, no color-only state,
  `aria-live`, no tiny text) and scroll resets to top on step change.
- **Process:** built subagent-driven; runs through the spec, code-quality,
  **analogy-audit**, and **epistemic-depth audit** gates before merge;
  `npm run build` runs `verify:claims` + `verify:analogy`; each lesson is its
  own PR; deploys automatically from `main`.

## 2. The 5 specifics to provide per lesson

1. **Topic & goal** — one line: what the learner should be able to reason about
   by the end.
2. **Source to repurpose** — path/URL of existing material to reauthor into a
   `LessonData` (don't copy markup).
3. **Authoritative sources to verify against** — the code/specs/docs each claim
   must be checked against.
4. **Root analogy mapping** — the world + each technical term → one element of
   that world (reuse roads/transport where it genuinely clarifies).
5. **The interactives** — the 1–3 interactions, each described so it can clear
   WHAT/HOW/WHY/HOW-WE-KNOW (name the boundary the learner probes + the
   falsifier).

Then: register the new `LessonData` in `src/data/registry.ts` (homepage + routing
pick it up automatically), and grow `LessonHome` into a course map once 2+
lessons exist.

---

## 3. Course status

| # | Lesson | id | State |
|---|--------|----|----|
| 1 | Create a Sidechain Without Breaking Bitcoin | `create-a-sidechain` | ✅ Built |
| 2 | Where Drivechain Sits Among Bitcoin's Layers | `where-drivechain-sits` | ✅ Built ([PR #5](https://github.com/Sovereigndwp/layertwo-labs-academy/pull/5)) |
| 3 | How a Drivechain Withdrawal Works | `drivechain-withdrawal` | 📝 Queued (Arc A) |
| 4 | Blind Merged Mining | `blind-merged-mining` | 📝 Queued (Arc A) |
| 5 | The Drivechain Debate, Steelmanned | `drivechain-debate` | 📝 Queued (Arc A) |

The queue below is **Arc A — deepen Drivechain**. To build one, say **"Build lesson #N"**
(runs the `build-lesson` workflow — see `docs/authoring/automation.md`).

---

## 4. Queued: Lesson #3 — "How a Drivechain Withdrawal Works (and Why It's Slow)"

1. **Topic & goal:** Understand how coins move *off* a sidechain back to Bitcoin
   under BIP300 — the withdrawal *bundle*, the long miner-ACK vote (a 26,300-block
   window, 13,150-ACK success threshold), why it is *deliberately* slow, and
   exactly what a hostile hashrate majority **could** (censor, redirect) and
   **could not** (forge a deposit, spend your keys) do. Closes the loop on the
   majority-hashrate tradeoff that lessons #1 and #2 keep surfacing.
2. **Source to repurpose:** No 1:1 demo — reauthor from the BIP300 spec's
   withdrawal section; **reuse the lesson #1 `AckTimeline` machinery** (rolling
   vote window) as the interactive base.
3. **Verify against:** BIP300 mediawiki (bundle params: 26,300 / 13,150 —
   confirmed present) and `bip300301_enforcer` (the withdrawal-bundle enforcement
   code; cite the file). Numbers from the spec/code only; flag anything
   unconfirmed `needs-recheck`.
4. **Root analogy (roads → vehicles):** a withdrawal = letting passengers *off*
   the minibus (sidechain) back onto the main highway (Bitcoin) — but the highway
   authority (miners) must keep re-approving that off-ramp for months before
   anyone may get off. Use transport only where it clarifies.
5. **Interactives (deep, not flip-cards):**
   - **Withdrawal-bundle vote:** accumulate ACKs across the 26,300-block window
     and watch a bundle *succeed* or *expire*; probe the **hostile hashrate** until
     the withdrawal is blocked. Falsifier: a full node rejects any bundle that pays
     out without 13,150 ACKs.
   - **"What can a hostile majority actually do?":** the learner sorts outcomes
     into **censor** (block your withdrawal) / **redirect** (the theft attack) /
     **cannot** (forge a deposit, spend your keys) — surfacing the *precise*
     security boundary, not vague fear.

   Prerequisite: `create-a-sidechain` (recommend `where-drivechain-sits` too).

## 5. Queued: Lesson #4 — "Blind Merged Mining (How Miners Secure a Sidechain Without Running It)"

1. **Topic & goal:** Understand how Bitcoin miners can secure and earn fees from a
   sidechain *without* running its software or validating its blocks — what
   "blind" means, how the commitment + fee binding works (BIP301), and the
   centralization questions critics raise.
2. **Source to repurpose:** your `interactive-demos/mining-simulator` and
   `mining-economics-demo` (mining-flow visuals); reauthor the BMM mechanism from
   BIP301.
3. **Verify against:** BIP301 mediawiki (blind-merged-mining mechanism) and
   `bip300301_enforcer` (the BMM implementation; cite the file). Mechanism facts
   from the spec; the "centralization" framing is honest analysis, not asserted
   as a protocol fact.
4. **Root analogy (roads → vehicles):** the chartered bus (sidechain) pays the
   highway authority (miners) to stamp its departure *blindly* — the authority
   collects the toll (fees) without needing to know the route.
5. **Interactives (deep, not flip-cards):**
   - **Be the miner:** include a sidechain's blind commitment and claim its fee
     *without* seeing or validating the sidechain block. Probe: *what does the
     miner actually verify?* (nothing about the sidechain's internal validity).
     Falsifier: if a miner could be tricked into ratifying an invalid sidechain
     state, "blind" would be broken — show the commitment binds.
   - **Centralization probe:** does BMM force miners to run sidechain software?
     (No.) Contrast the fear with the mechanism, honestly.

   Prerequisite: `create-a-sidechain`.

## 6. Queued: Lesson #5 — "The Drivechain Debate, Steelmanned" (capstone)

1. **Topic & goal:** Reason about *whether* Bitcoin should adopt Drivechain by
   fairly stating the strongest case **for** (opt-in, no new token, contains
   experimentation, miners already order blocks) and **against** (miner-majority
   withdrawal risk, centralization pressure, the theft window, soft-fork
   contention) — and form your own view without tribalism. **Mechanism = fact;
   the "should we?" = reasoned opinion, both sides steelmanned.**
2. **Source to repurpose:** synthesis of lessons #1–#4 + the public debate corpus
   (no single demo).
3. **Verify against:** primary writings on **both** sides — drivechain.info /
   Paul Sztorc (for); Peter Todd's Drivechain analysis (against) — plus
   BIP300/301 for the mechanism facts. Tag opinions as opinions; tag the evidence
   that would change each side's mind.
4. **Root analogy:** minimal — this is a judgment lesson. Use transport sparingly
   ("should the highway add these off-ramps at all?").
5. **Interactives (deep, not flip-cards):**
   - **Steelman builder:** shown a claim, the learner must pick the *strongest*
     counter (not a strawman) — tiered reflection, the course's signature move.
   - **"Where do you stand — and why":** the learner weights the tradeoffs
     (custody · centralization · opt-in · reversibility) on sliders and sees which
     side their *own* weights imply, with the honest note that reasonable people
     weight them differently. Each side's claim is tagged with its falsifier
     (what evidence would change it).

   Prerequisite: all of `create-a-sidechain`, `where-drivechain-sits`,
   `drivechain-withdrawal`, `blind-merged-mining`.
