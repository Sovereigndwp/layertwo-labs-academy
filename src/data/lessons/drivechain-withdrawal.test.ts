import { describe, it, expect } from 'vitest'
import { drivechainWithdrawalLesson } from './drivechain-withdrawal'
import { auditAnalogy } from '../../state/analogy'

describe('drivechainWithdrawalLesson', () => {
  it('uses the shared roads analogy world', () => {
    expect(drivechainWithdrawalLesson.analogy.world).toBe('roads')
  })

  it('declares its prerequisites on lessons #1 and #2', () => {
    expect(drivechainWithdrawalLesson.prerequisites).toContain('create-a-sidechain')
    expect(drivechainWithdrawalLesson.prerequisites).toContain('where-drivechain-sits')
  })

  it('has at least four claims, each with at least one source', () => {
    expect(drivechainWithdrawalLesson.claims.length).toBeGreaterThanOrEqual(4)
    for (const c of drivechainWithdrawalLesson.claims) {
      expect(c.sources.length, `claim ${c.id} has no sources`).toBeGreaterThanOrEqual(1)
    }
  })

  it('keeps Drivechain framed as proposed (never live on mainnet)', () => {
    const proposed = drivechainWithdrawalLesson.claims.find((c) => c.id === 'drivechain-proposed')
    expect(proposed?.text.toLowerCase()).toContain('proposed')
    expect(drivechainWithdrawalLesson.factBadge.full.toLowerCase()).toContain('not active')
  })

  it('resolves every prerequisite to a known lesson id', () => {
    const known = new Set(['create-a-sidechain', 'where-drivechain-sits'])
    for (const p of drivechainWithdrawalLesson.prerequisites) {
      expect(known.has(p), `unknown prerequisite ${p}`).toBe(true)
    }
  })

  it('is analogy-clean: no cross-world metaphor words in its copy', () => {
    const texts: { where: string; text: string }[] = []
    drivechainWithdrawalLesson.steps.forEach((s, i) => {
      texts.push({ where: `step[${i}].headline`, text: s.headline })
      texts.push({ where: `step[${i}].explain`, text: s.explain })
      texts.push({ where: `step[${i}].why`, text: s.why })
      ;(s.body ?? []).forEach((b, j) => texts.push({ where: `step[${i}].body[${j}]`, text: b }))
    })
    drivechainWithdrawalLesson.glossary.forEach((g) =>
      texts.push({ where: `glossary.${g.id}`, text: `${g.short} ${g.example ?? ''}` }),
    )
    drivechainWithdrawalLesson.quiz.forEach((q) => {
      texts.push({ where: `quiz.${q.id}.prompt`, text: q.prompt })
      q.choices.forEach((c) =>
        texts.push({ where: `quiz.${q.id}.${c.id}`, text: `${c.label} ${c.feedback}` }),
      )
    })
    expect(auditAnalogy(drivechainWithdrawalLesson.analogy, texts)).toEqual([])
  })
})
