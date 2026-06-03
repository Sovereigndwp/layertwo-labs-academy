// Run with: npx tsx scripts/verify-claims.ts
// Exits 1 if any claim is invalid or stale. Used as a CI gate.
import { lessons } from '../src/data/registry'
import { validateClaim, isClaimStale } from '../src/state/claims'

const today = new Date()
let problems = 0

for (const lesson of lessons) {
  for (const claim of lesson.claims ?? []) {
    const errors = validateClaim(claim)
    if (errors.length) {
      problems++
      console.error(`✗ [${lesson.id}] claim "${claim.id}": ${errors.join('; ')}`)
    }
    if (isClaimStale(claim, today)) {
      problems++
      console.error(
        `✗ [${lesson.id}] claim "${claim.id}" is stale (verifiedOn ${claim.verifiedOn}, status ${claim.status})`,
      )
    }
  }
}

if (problems > 0) {
  console.error(`\n${problems} claim problem(s) found.`)
  process.exit(1)
}
console.log(`✓ all lesson claims valid and fresh`)
