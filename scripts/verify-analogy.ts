// Run with: npx tsx scripts/verify-analogy.ts
// Exits 1 if any lesson's copy uses a cross-world metaphor word. CI gate.
import { lessons } from '../src/data/registry'
import { auditAnalogy } from '../src/state/analogy'

let problems = 0
for (const lesson of lessons) {
  if (!lesson.analogy) continue
  const texts: { where: string; text: string }[] = []
  lesson.steps.forEach((s, i) => {
    texts.push({ where: `step[${i}].headline`, text: s.headline })
    texts.push({ where: `step[${i}].explain`, text: s.explain })
    texts.push({ where: `step[${i}].why`, text: s.why })
    ;(s.body ?? []).forEach((b, j) => texts.push({ where: `step[${i}].body[${j}]`, text: b }))
  })
  lesson.glossary.forEach((g) =>
    texts.push({ where: `glossary.${g.id}`, text: `${g.short} ${g.example ?? ''}` }),
  )
  const findings = auditAnalogy(lesson.analogy, texts)
  for (const f of findings) {
    problems++
    console.error(`✗ [${lesson.id}] cross-world word "${f.word}" (world=${lesson.analogy.world}) at ${f.where}`)
  }
}
if (problems > 0) {
  console.error(`\n${problems} analogy problem(s) found.`)
  process.exit(1)
}
console.log('✓ all lessons analogy-consistent')
