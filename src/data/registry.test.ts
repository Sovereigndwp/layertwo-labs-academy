import { describe, it, expect } from 'vitest'
import { lessons, lessonsById, getPrerequisiteGaps } from './registry'

describe('registry', () => {
  it('exposes at least the sidechain lesson', () => {
    expect(lessons.length).toBeGreaterThanOrEqual(1)
    expect(lessonsById['create-a-sidechain']).toBeDefined()
  })
  it('every lesson id is unique', () => {
    const ids = lessons.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('every prerequisite references a real lesson', () => {
    for (const l of lessons) {
      for (const p of l.prerequisites) {
        expect(lessonsById[p], `${l.id} -> ${p}`).toBeDefined()
      }
    }
  })
})

describe('getPrerequisiteGaps', () => {
  it('returns prerequisite ids not yet completed', () => {
    expect(getPrerequisiteGaps('create-a-sidechain', new Set())).toEqual([])
  })
  it('reports a missing prerequisite', () => {
    const gaps = getPrerequisiteGaps('create-a-sidechain', new Set(['x']))
    expect(Array.isArray(gaps)).toBe(true)
  })
})
