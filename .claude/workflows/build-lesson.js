export const meta = {
  name: 'build-lesson',
  description:
    'Build one academy lesson from its queued brief: verify claims → author the LessonData (+ component) → gate → 3 reviews → fix → open PR (human merges).',
  whenToUse:
    'When a lesson is queued in docs/authoring/lesson-brief.md and you want the full pipeline run autonomously. Trigger: "Build lesson #N" (pass args:{n:N}).',
  phases: [
    { title: 'Verify', detail: 'check every claim against PRIMARY sources' },
    { title: 'Author', detail: 'write LessonData (+ new interactive if needed) and register' },
    { title: 'Gate', detail: 'build + tests + verify:claims + verify:analogy, fix-loop' },
    { title: 'Review', detail: 'analogy-audit · epistemic-depth · WCAG-AA accessibility' },
    { title: 'Fix', detail: 'apply review findings, re-gate' },
    { title: 'Ship', detail: 'commit + open PR (does NOT merge)' },
  ],
}

// --- Config -----------------------------------------------------------------
const REPO = '/Users/dalia/projects/layertwo-labs-academy'
const n = Number(args?.n ?? args?.lesson ?? 3)
const briefSection = n + 1 // §(N+1) in lesson-brief.md (§4 = lesson #3, etc.)
const MAX_GATE_FIXES = 3

log(`Building lesson #${n} from docs/authoring/lesson-brief.md §${briefSection}`)

// --- Schemas ----------------------------------------------------------------
const CLAIMS_SCHEMA = {
  type: 'object',
  required: ['id', 'claims'],
  properties: {
    id: { type: 'string', description: "the lesson's kebab-case id from the brief" },
    claims: {
      type: 'array',
      items: {
        type: 'object',
        required: ['text', 'tier', 'url', 'status'],
        properties: {
          text: { type: 'string' },
          tier: { enum: ['DEV', 'DATA', 'INST', 'PRESS', 'PROJ', 'ANEC'] },
          url: { type: 'string', description: 'primary-source URL' },
          status: { enum: ['verified', 'needs-recheck'] },
          note: { type: 'string' },
        },
      },
    },
    newComponentNeeded: { type: 'boolean', description: 'true if no existing StepKind fits the brief’s interactives' },
  },
}
const GATE_SCHEMA = {
  type: 'object',
  required: ['pass', 'output'],
  properties: { pass: { type: 'boolean' }, output: { type: 'string', description: 'tail of build/test output' } },
}
const REVIEW_SCHEMA = {
  type: 'object',
  required: ['verdict', 'findings'],
  properties: {
    verdict: { enum: ['APPROVED', 'APPROVED-WITH-MINORS', 'CHANGES-REQUIRED'] },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['severity', 'location', 'issue', 'fix'],
        properties: {
          severity: { enum: ['blocker', 'serious', 'minor'] },
          location: { type: 'string' },
          issue: { type: 'string' },
          fix: { type: 'string' },
        },
      },
    },
  },
}

// --- Phase 1: Verify claims against PRIMARY sources -------------------------
phase('Verify')
const verified = await agent(
  `You are verifying facts for a Bitcoin lesson. Read the brief at ${REPO}/docs/authoring/lesson-brief.md section §${briefSection} (lesson #${n}). For every factual claim the lesson will make, verify it ONLY against the PRIMARY sources named in the brief (specs/code/official docs — NEVER blogs). For each: give text, tier (DEV=spec/code, INST=institutional docs, PROJ=project docs, PRESS=press), the exact primary-source URL, and status: 'verified' if a primary source clearly confirms a STABLE fact, else 'needs-recheck' (volatile/uncertain — omit volatile network stats entirely). Honor the guardrails in ${REPO}/CLAUDE.md: Drivechain is PROPOSED (BIP300/301), not live; editorial framings (e.g. "Layer N") are never asserted as protocol facts. Also decide newComponentNeeded: read ${REPO}/src/data/lessonData.ts StepKind union — true only if the brief's interactives genuinely need a new kind (else reuse existing renderers). Return the lesson id, the claims, and newComponentNeeded.`,
  { label: `verify:lesson-${n}`, agentType: 'ca-researcher', schema: CLAIMS_SCHEMA },
)
log(`Verified ${verified.claims.length} claims (${verified.claims.filter((c) => c.status === 'needs-recheck').length} needs-recheck). New component: ${verified.newComponentNeeded}`)

// --- Phase 2: Author the lesson --------------------------------------------
phase('Author')
const authorReport = await agent(
  `You are authoring lesson #${n} (id: ${verified.id}) for the LayerTwo Labs academy in ${REPO}.
READ FIRST: ${REPO}/CLAUDE.md (conventions — non-negotiable), ${REPO}/docs/authoring/lesson-brief.md §${briefSection} (the brief), ${REPO}/docs/authoring/epistemic-depth.md, ${REPO}/src/data/lessons/layers-map.ts (the closest template — copy its STRUCTURE), and ${REPO}/src/data/lessonData.ts (the LessonData + StepKind contract).
DO:
1. Create ${REPO}/src/data/lessons/${verified.id}.ts exporting a LessonData with: id '${verified.id}', the brief's analogy (world 'roads', avoid WORLD_BANNED words), factBadge keeping the proposed-not-live guardrail, steps reusing existing StepKinds where possible, and these verified claims (each as a VerifiableClaim with verifiedOn today, the given tier/url/status): ${JSON.stringify(verified.claims)}. Every interactive must clear WHAT/HOW/WHY/HOW-WE-KNOW with an explicit falsifier in the copy.
2. ${verified.newComponentNeeded ? `Create the new interactive component in ${REPO}/src/components/ following src/components/LayerMap.tsx as the model (real buttons/inputs only — NO drag-only; state-by-color paired with icon+text; aria-live on changing values; a full-size text/legend alternative for any visual chart; progress-gating state in src/state/types.ts + lessonReducer.ts; add the new StepKind to lessonData.ts and a router case in src/components/LessonShell.tsx). Add styles to src/styles/lesson.css using existing tokens.` : 'Reuse existing StepKind renderers — no new component.'}
3. Create ${REPO}/src/data/lessons/${verified.id}.test.ts mirroring layers-map.test.ts (analogy.world==='roads', ≥4 claims each sourced, prerequisites resolve, auditAnalogy clean on copy + layers).
4. Register: import and append to lessons[] in ${REPO}/src/data/registry.ts; update registry.test.ts to expect the new lesson + its prerequisite.
Report what files you created/edited and any decisions. Do NOT run git.`,
  { label: `author:lesson-${n}`, agentType: 'ca-executor' },
)
log('Authoring done.')

// --- Phase 3: Gate (build + tests), with a fix loop ------------------------
phase('Gate')
let gate
for (let attempt = 1; attempt <= MAX_GATE_FIXES; attempt++) {
  gate = await agent(
    `Run the gates in ${REPO}: \`cd ${REPO} && npm run build 2>&1 | tail -25 && echo "=== TESTS ===" && npm test 2>&1 | tail -12\`. The build runs tsc + verify:claims + verify:analogy + vite. Report pass=true only if the build is green AND all tests pass (needs-recheck claims only WARN — that's a pass). Return pass + the tail of output.`,
    { label: `gate:attempt-${attempt}`, schema: GATE_SCHEMA },
  )
  if (gate.pass) { log(`Gate green on attempt ${attempt}.`); break }
  if (attempt === MAX_GATE_FIXES) { log(`Gate still failing after ${attempt} attempts — shipping as DRAFT for human.`); break }
  log(`Gate failed (attempt ${attempt}); dispatching fixer.`)
  await agent(
    `The lesson #${n} build/tests in ${REPO} are failing. Output:\n${gate.output}\nFix the cause (type errors, a failing claim/analogy gate, or a test). Edit source files in ${REPO}/src. Do not weaken the analogy ban-list or delete tests to pass. Do not run git.`,
    { label: `gate-fix:attempt-${attempt}` },
  )
}

// --- Phase 4: Review (3 parallel auditors) ---------------------------------
phase('Review')
const reviewDims = [
  { key: 'analogy', doc: 'docs/authoring/analogy-audit.md', focus: 'analogy consistency (one world; every metaphor in-world; subordinate to mechanism; no strained/misleading pictures)' },
  { key: 'epistemic', doc: 'docs/authoring/epistemic-depth.md', focus: 'first-principles lead; each interactive does WHAT/HOW/WHY/HOW-WE-KNOW; every important claim has a stated falsifier' },
  { key: 'a11y', doc: 'CLAUDE.md', focus: 'WCAG 2.1 AA + the project a11y rules: full keyboard operability, no state-by-color-alone (icon+text), aria on changing values, text alternative for any visual chart, no sub-0.95rem content' },
]
const reviews = await parallel(
  reviewDims.map((d) => () =>
    agent(
      `You are the ${d.key} reviewer for lesson #${n} (${verified.id}) in ${REPO}. Review ONLY (do not edit). Read the standard at ${REPO}/${d.doc}, the lesson at ${REPO}/src/data/lessons/${verified.id}.ts, and any new component under ${REPO}/src/components/. Audit: ${d.focus}. Report findings {severity, location, issue, fix} and a verdict.`,
      { label: `review:${d.key}`, phase: 'Review', schema: REVIEW_SCHEMA },
    ).then((r) => ({ ...r, dim: d.key })),
  ),
)
const mustFix = reviews
  .filter(Boolean)
  .flatMap((r) => r.findings.filter((f) => f.severity !== 'minor').map((f) => ({ ...f, dim: r.dim })))
log(`Reviews: ${reviews.filter(Boolean).map((r) => `${r.dim}=${r.verdict}`).join(' · ')} — ${mustFix.length} non-minor findings`)

// --- Phase 5: Fix review findings (if any), then re-gate -------------------
phase('Fix')
if (mustFix.length > 0) {
  await agent(
    `Apply these review fixes to lesson #${n} in ${REPO} (do not run git). Each finding has {dim, severity, location, issue, fix}:\n${JSON.stringify(mustFix, null, 1)}\nAfter editing, run \`cd ${REPO} && npm run build >/dev/null 2>&1 && npm test 2>&1 | tail -4\` and confirm still green.`,
    { label: 'review-fix' },
  )
  log('Applied review fixes.')
} else {
  log('No non-minor review findings — skipping fix phase.')
}

// --- Phase 6: Ship (commit + PR; never merge) ------------------------------
phase('Ship')
const ship = await agent(
  `In ${REPO}: create branch \`feat/lesson${n}-${verified.id}\` off main, stage all changes, commit (message summarizing lesson #${n}, ending with "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"), push, and open a PR against main with gh (title "Lesson #${n} — <title>", body summarizing what shipped, the verified/needs-recheck claims, and the review verdicts). DO NOT merge. Return the PR URL. If gh is unavailable, just commit+push and report the branch.`,
  { label: 'ship', schema: { type: 'object', required: ['prUrl'], properties: { prUrl: { type: 'string' }, note: { type: 'string' } } } },
)

return {
  lesson: n,
  id: verified.id,
  claims: verified.claims.length,
  newComponent: verified.newComponentNeeded,
  reviews: reviews.filter(Boolean).map((r) => ({ dim: r.dim, verdict: r.verdict })),
  reviewFixesApplied: mustFix.length,
  pr: ship.prUrl,
}
