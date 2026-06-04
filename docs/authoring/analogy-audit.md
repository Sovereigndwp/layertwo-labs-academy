# Analogy Audit

Analogies are **helpers**, never the explanation (see `epistemic-depth.md` — lessons lead with first principles; the analogy is optional scaffolding). This doc keeps the helper layer honest: consistent, in-world, and non-misleading.

## The rule

1. **One analogy world per lesson.** Name it explicitly in the lesson's `analogy.world` (e.g. `'roads'`).
2. **Reuse the course world** ("roads", extended into the broader transport network where it genuinely clarifies) unless you are deliberately starting a new world — and if so, say why.
3. **Every metaphor maps to exactly one element of that world.** No strays from other worlds (no "parking", "floor", "container" inside a roads lesson).
4. **The analogy is subordinate.** It supports the first-principles explanation; it never replaces the mechanism.

## Declared in data

Each lesson declares its analogy (`src/state/analogy.ts` → `LessonAnalogy`):

```ts
analogy: {
  world: 'roads',
  blurb: 'Bitcoin is the main road; a sidechain is a side road that joins it at a numbered exit.',
  mappings: [
    { term: 'slot', element: 'a reserved, numbered highway exit where a side road can connect' },
    // ...one entry per technical term the lesson personifies
  ],
}
```

## Automated gate: `npm run verify:analogy`

Wired into `npm run build`. For every lesson it scans all copy (step headline/explain/why/body + glossary) for **cross-world words** banned for that world (`WORLD_BANNED` in `src/state/analogy.ts`) and fails the build on a hit, naming the location. This is the regression guard that stops "parking-in-a-roads-lesson" from ever returning.

**Extending it:** when a new analogy world appears, add a `WORLD_BANNED[world]` entry listing the other-world words that would signal a mixed metaphor. Keep the list conservative (favor false negatives over false positives) — the agent gate below catches the subtle cases a wordlist cannot.

## Judgment gate: the analogy-audit subagent

The wordlist catches banned tokens; it cannot catch a *strained* metaphor ("an exit is like a turnstile" — wrong even though no banned word appears) or an **unmapped** metaphor. Run this subagent on every new/repurposed lesson, alongside spec + quality + epistemic-depth review:

> **Analogy-audit reviewer prompt.** You are reviewing one lesson's copy for analogy consistency. You are given the lesson's declared `analogy` (world + term→element mappings) and all of its learner-facing copy (steps, glossary, interactive labels). Check: (1) Does every metaphor used belong to the declared world? Flag any stray or mixed metaphor with its location. (2) Is every personified technical term covered by a mapping, and used consistently with it? Flag drift (a term mapped to "exit" but later described as a "gate"). (3) Is the analogy clearly *subordinate* to a first-principles explanation, never standing in for the mechanism? Flag any screen where the analogy IS the explanation. (4) Are any analogies strained or misleading (the picture implies something false about the mechanism)? Report findings as `{location, issue, suggested fix}`. Do not rewrite — review only. Verdict: APPROVED / APPROVED-WITH-MINORS / CHANGES-REQUIRED.

## Precedent

Lesson #1 originally explained a slot as "a parking space" inside a roads lesson — a mixed metaphor that confused the core idea. Fixed to "a numbered highway exit." This gate exists so that class of bug is caught mechanically (the word) and by review (the strain), every time.
