import { describe, it, expect } from 'vitest'
import { layersMapLesson } from './layers-map'
import { auditAnalogy } from '../../state/analogy'

describe('layersMapLesson', () => {
  it('uses the shared roads analogy world', () => {
    expect(layersMapLesson.analogy.world).toBe('roads')
  })

  it('declares its prerequisite on lesson #1', () => {
    expect(layersMapLesson.prerequisites).toContain('create-a-sidechain')
  })

  it('has at least four claims, each with at least one source', () => {
    expect(layersMapLesson.claims.length).toBeGreaterThanOrEqual(4)
    for (const c of layersMapLesson.claims) {
      expect(c.sources.length, `claim ${c.id} has no sources`).toBeGreaterThanOrEqual(1)
    }
  })

  it('keeps Drivechain framed as proposed (never live on mainnet)', () => {
    const proposed = layersMapLesson.claims.find((c) => c.id === 'drivechain-proposed')
    expect(proposed?.text.toLowerCase()).toContain('proposed')
    expect(layersMapLesson.factBadge.full.toLowerCase()).toContain('not active')
  })

  it('ships every layer card with a backing answer to "who can stop you exiting?"', () => {
    expect(layersMapLesson.layers?.length).toBeGreaterThanOrEqual(5)
    for (const l of layersMapLesson.layers ?? []) {
      expect(l.whoCanStopExit.trim().length, `${l.id} missing exit answer`).toBeGreaterThan(0)
    }
    // every non-empty claimId on a card resolves to a real claim
    const ids = new Set(layersMapLesson.claims.map((c) => c.id))
    for (const l of layersMapLesson.layers ?? []) {
      for (const id of l.claimIds) {
        expect(ids.has(id), `${l.id} references unknown claim ${id}`).toBe(true)
      }
    }
  })

  it('is analogy-clean: no cross-world metaphor words in its copy', () => {
    const texts: { where: string; text: string }[] = []
    layersMapLesson.steps.forEach((s, i) => {
      texts.push({ where: `step[${i}].headline`, text: s.headline })
      texts.push({ where: `step[${i}].explain`, text: s.explain })
      texts.push({ where: `step[${i}].why`, text: s.why })
      ;(s.body ?? []).forEach((b, j) => texts.push({ where: `step[${i}].body[${j}]`, text: b }))
    })
    layersMapLesson.glossary.forEach((g) =>
      texts.push({ where: `glossary.${g.id}`, text: `${g.short} ${g.example ?? ''}` }),
    )
    ;(layersMapLesson.layers ?? []).forEach((l) =>
      texts.push({
        where: `layer.${l.id}`,
        text: `${l.metaphor} ${l.tradeoff} ${l.whoCanStopExit}`,
      }),
    )
    expect(auditAnalogy(layersMapLesson.analogy, texts)).toEqual([])
  })
})
