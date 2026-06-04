# First Principles & Epistemic Depth

The standard every lesson and interactive must meet. Analogies are scaffolding; **first principles are the substance**, and interactives must teach *what to do, how it works, and why we trust it* — not be toys.

## Core commitments

1. **Lead with the mechanism, not the metaphor.** A screen opens with the actual thing and the *constraint that forces it to work that way*. The analogy comes after, clearly labeled as a way to picture it, and is skippable (see `analogy-audit.md`).
2. **Interactives are not decorative.** A learner should *do the real reasoning*, not click the one right button to advance.
3. **Epistemics are explicit.** Every important claim says **how we know** (a source/spec) and **what would prove it false** (a falsifier). This activates the disclosure + falsification discipline from the source corpus, not just a citation.
4. **Depth is tiered.** Offer a quick gut-check, a deeper "explain why", and a "challenge it" — so a learner chooses their depth without losing rigor.

## Screen anatomy

Every teaching screen, in order:

1. **First principle** — the mechanism + the constraint that necessitates it. The lead. No analogy. *(What is actually true, and why must it be so?)*
2. **Analogy helper** — optional, labeled ("Picture it:"), subordinate, skippable.
3. **Epistemic interactive** — the learner manipulates the *real* variables, tests boundaries, sees consequences.
4. **How we know / what would break it** — the justification, the source, and a falsifier.
5. **Tiered reflection** — gut-check → explain-why → challenge.

## The interactive depth bar

An interactive must let the learner do **all four**. Hitting only the first is the definition of shallow → redesign it.

- **WHAT** — perform the actual procedure (the real steps, in order).
- **HOW** — see the mechanism respond to what they did (not a scripted animation).
- **WHY** — change a variable / push a boundary and watch it *break*, so the design rationale is *discovered*, not asserted.
- **HOW-WE-KNOW** — tie the behavior to a spec/evidence and a falsifier ("if X happened, this would be false; a node would reject it").

If you cannot express all four for an interactive, the concept isn't ready to be interactive yet — teach it as first-principles text + reflection instead of faking depth.

## Worked example — the ACK timeline (reference implementation)

**Shallow (before):** "Mine blocks, watch the percentage rise to 95%." Procedural only — WHAT, nothing else.

**Deep (target):**
- **First principle:** Activating a sidechain changes what miners collectively enforce. To stop a small group sneaking that in, the rule demands a *costly* signal (an ACK costs a block), *sustained* across a long *public* window (the past 2016 blocks), above a *high* threshold (~95%). Costly + sustained + public = hard to fake, easy for everyone to observe and react to.
- **WHAT:** mine blocks; each can carry one ACK; track the count over the rolling 2016-block window.
- **HOW:** the percentage is over the *past* 2016 blocks, so old ACKs roll off — spike to 100% for 10 blocks, then stop, and watch it **decay**. Support must be sustained, not spiked once.
- **WHY:** a threshold control the learner can lower to **51%** → the UI shows the attack it unlocks ("a bare-majority cartel forces a sidechain the rest reject"); raise to **100%** → "a single holdout freezes activation forever." The learner *discovers why ~95%* is the balance between safety and liveness.
- **HOW-WE-KNOW:** every full node checks this against the public block history (BIP300). **Falsifier:** if a sidechain activated without sustained ~95% ACKs, a node would reject it.
- **Tiered reflection:** "why a window, not a single vote?" → "why 95%, not 51%?" → "design a cheaper attack; why does it fail?"

This is the bar for every interactive, including lesson #2's layer map (it must teach each layer's real trust model and what it gives up and why — not flip cards).

## Expressing "how we know" + falsifier (no schema change)

We keep this as a **rubric + review** discipline (no new data fields). In practice:
- The lesson's `claims[]` already carry `sources` and `verifiedOn`. State the **falsifier in the claim text or the screen's "how we know" copy** ("…; a node would reject any sidechain that activated without it").
- The epistemic-depth audit (below) checks every important claim has a stated how-we-know + falsifier in the copy.

## The epistemic-depth audit subagent

Run on every new/repurposed lesson, alongside spec + quality + analogy review:

> **Epistemic-depth reviewer prompt.** You are reviewing one lesson for first-principles depth and epistemic rigor. You are given all of its copy and a description of each interactive. Check and report findings (`{location, issue, suggested fix}`): (1) **First-principles lead** — does each teaching screen open with the actual mechanism + the constraint that forces it, rather than an analogy? Flag any screen that leads with or substitutes an analogy for the explanation. (2) **Analogy subordinate** — is every analogy clearly a labeled, skippable helper? (3) **Interactive depth** — for each interactive, does it let the learner do WHAT (real procedure), HOW (mechanism responds), WHY (probe a variable/boundary until it breaks, revealing the rationale), and HOW-WE-KNOW (tie to spec + a falsifier)? Flag any interactive that only does WHAT (shallow). (4) **Epistemics** — does every important claim state how we know and what would falsify it? Do not rewrite — review only. Verdict: APPROVED / APPROVED-WITH-MINORS / CHANGES-REQUIRED, with the specific shallow interactives or missing falsifiers listed.

## Why this matters

A learner who only memorizes "95% of 2016 blocks" has a fact. A learner who discovered *why* a single vote or a 51% threshold fails, and what would falsify the security claim, has *understanding* — and can reason about the next protocol they meet. That transfer is the whole point.
