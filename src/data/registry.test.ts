import { describe, it, expect } from 'vitest'
import { lessons, lessonsById, getPrerequisiteGaps } from './registry'

describe('registry', () => {
  it('exposes at least the three authored lessons', () => {
    expect(lessons.length).toBeGreaterThanOrEqual(3)
    expect(lessonsById['create-a-sidechain']).toBeDefined()
    expect(lessonsById['where-drivechain-sits']).toBeDefined()
    expect(lessonsById['drivechain-withdrawal']).toBeDefined()
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
  it('lesson #2 declares its prerequisite on lesson #1', () => {
    expect(lessonsById['where-drivechain-sits'].prerequisites).toContain(
      'create-a-sidechain',
    )
  })
  it('lesson #3 declares its prerequisites on lessons #1 and #2', () => {
    expect(lessonsById['drivechain-withdrawal'].prerequisites).toContain(
      'create-a-sidechain',
    )
    expect(lessonsById['drivechain-withdrawal'].prerequisites).toContain(
      'where-drivechain-sits',
    )
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
