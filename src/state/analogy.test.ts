import { describe, it, expect } from 'vitest'
import { auditAnalogy, WORLD_BANNED, type LessonAnalogy } from './analogy'

const roads: LessonAnalogy = {
  world: 'roads',
  blurb: 'Bitcoin is the main road; sidechains are side roads.',
  mappings: [{ term: 'slot', element: 'a numbered highway exit' }],
}

describe('auditAnalogy', () => {
  it('passes when copy stays in-world', () => {
    const f = auditAnalogy(roads, [{ where: 'step.slot', text: 'A slot is a numbered exit on the highway.' }])
    expect(f).toEqual([])
  })
  it('flags a cross-world word (parking) in a roads lesson', () => {
    const f = auditAnalogy(roads, [{ where: 'step.slot', text: 'A slot is a parking space.' }])
    expect(f).toHaveLength(1)
    expect(f[0]).toMatchObject({ word: 'parking', where: 'step.slot' })
  })
  it('is case-insensitive and word-bounded', () => {
    const f = auditAnalogy(roads, [{ where: 'x', text: 'Park the idea: a FLOOR here.' }])
    expect(f.map((x) => x.word).sort()).toEqual(['floor'])
  })
  it('returns no findings for an unknown world (nothing to ban)', () => {
    const f = auditAnalogy({ world: 'space', blurb: '', mappings: [] }, [{ where: 'x', text: 'parking floor' }])
    expect(f).toEqual([])
  })
})

it('WORLD_BANNED.roads includes parking and floor', () => {
  expect(WORLD_BANNED.roads).toEqual(expect.arrayContaining(['parking', 'floor']))
})
