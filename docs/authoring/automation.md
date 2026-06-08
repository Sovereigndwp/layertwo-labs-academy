# Automating lesson builds (the `build-lesson` workflow)

The whole lesson pipeline is codified as a multi-agent workflow at
`.claude/workflows/build-lesson.js`. It runs the exact sequence used to hand-build
lesson #2, autonomously, for any **queued** lesson.

## What it does (per lesson)

```
Verify  → research agents check every claim against PRIMARY sources only
Author  → one agent writes the LessonData (+ a new interactive component if the
          brief needs one) and registers it, following CLAUDE.md + the lesson #2 template
Gate    → npm run build (tsc + verify:claims + verify:analogy) + npm test, with a
          fix-loop (up to 3 attempts)
Review  → three auditors in parallel: analogy-audit · epistemic-depth · WCAG-AA a11y
Fix     → applies every non-minor finding, then re-gates
Ship    → branches, commits, pushes, opens a PR — and STOPS (never merges)
```

It returns the PR URL, the claim count (and how many shipped `needs-recheck`), and
the three review verdicts.

## How to run it

The lesson must be queued in `docs/authoring/lesson-brief.md` (§4+ holds the
Arc-A queue). Then either:

- Say **"Build lesson #N"** — the assistant runs the workflow with `args:{n:N}`.
- Or invoke directly: `Workflow({ name: 'build-lesson', args: { n: 3 } })`.

Watch live progress with `/workflows`.

> **Opt-in:** workflows spawn many agents and spend real tokens, so the assistant
> only fires this when you ask (the "Build lesson #N" trigger counts). Adding
> `ultracode` to a request makes orchestration the default.

## The two human checkpoints (by design)

Autonomy is bounded where judgment actually matters:

1. **Brief-in.** The 5-specifics brief is the editorial seed — the agents build
   *from* it, they don't invent the lesson. Write/curate the brief in
   `lesson-brief.md` before triggering.
2. **PR-merge.** The workflow opens a PR and stops. You review the diff (and the
   live preview from the branch) and merge — which is what deploys the lesson and
   updates the homepage menu. The workflow never merges for you.

## Honest limits

- **New interactives are the hard part.** A lesson that reuses existing
  `StepKind` renderers automates nearly end-to-end. One that needs a *novel*
  "deep, not flip-cards" interaction (like lesson #2's `LayerMap`) has the agents
  draft the component — but that's where a human glance at the PR pays off most.
- **`needs-recheck` is a feature.** Volatile or unsettled facts ship flagged, not
  asserted; the build *warns*, doesn't fail. Re-verify before relying on them.
- **The gate fix-loop is bounded** (3 attempts). If it can't go green, it ships a
  DRAFT PR and says so rather than forcing a pass.
- **Run it from the repo.** The script uses the absolute repo path
  (`/Users/dalia/projects/layertwo-labs-academy`); adjust if the repo moves.
