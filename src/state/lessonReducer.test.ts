import { describe, it, expect } from 'vitest'
import { lessonReducer } from './lessonReducer'
import { initialLessonState } from './types'

const mine = (state: typeof initialLessonState, amount: number, supporting: boolean) =>
  lessonReducer(state, { type: 'MINE_BLOCKS', amount, supporting })

describe('ACK rolling window', () => {
  it('counts ACK blocks mined with support', () => {
    const s = mine(initialLessonState, 500, true)
    expect(s.ackCount).toBe(500)
  })
  it('caps the window at 2016', () => {
    const s = mine(initialLessonState, 3000, true)
    expect(s.ackCount).toBe(2016)
  })
  it('DECAYS as non-ACK blocks push old ACKs out of the trailing window', () => {
    let s = mine(initialLessonState, 2016, true) // window full of ACKs
    expect(s.ackCount).toBe(2016)
    s = mine(s, 100, false) // 100 non-ACK blocks evict 100 oldest ACKs
    expect(s.ackCount).toBe(1916)
    s = mine(s, 100, false)
    expect(s.ackCount).toBe(1816)
  })
  it('does not go negative', () => {
    const s = mine(initialLessonState, 50, false)
    expect(s.ackCount).toBe(0)
  })
  it('RESET_ACKS clears the window', () => {
    let s = mine(initialLessonState, 1000, true)
    s = lessonReducer(s, { type: 'RESET_ACKS' })
    expect(s.ackCount).toBe(0)
    expect(s.ackWindow).toEqual([])
  })
})

describe('automatic activation', () => {
  it('activates automatically when ACKs reach the threshold', () => {
    const s = lessonReducer(initialLessonState, { type: 'MINE_BLOCKS', amount: 1916, supporting: true })
    expect(s.ackCount).toBe(1916)
    expect(s.activationStatus).toBe('active')
  })
  it('stays active even if support later decays below the threshold', () => {
    let s = lessonReducer(initialLessonState, { type: 'MINE_BLOCKS', amount: 1916, supporting: true })
    s = lessonReducer(s, { type: 'MINE_BLOCKS', amount: 500, supporting: false })
    expect(s.ackCount).toBeLessThan(1916)
    expect(s.activationStatus).toBe('active')
  })
  it('lowering the threshold below current support auto-activates', () => {
    let s = lessonReducer(initialLessonState, { type: 'MINE_BLOCKS', amount: 1008, supporting: true })
    expect(s.activationStatus).not.toBe('active') // 1008 < default 1815
    s = lessonReducer(s, { type: 'SET_ACK_THRESHOLD', count: 1008 }) // bar drops to a bare majority
    expect(s.activationStatus).toBe('active')
  })
})

describe('lesson #3 withdrawal-bundle vote', () => {
  const mineBundle = (
    state: typeof initialLessonState,
    amount: number,
  ) =>
    lessonReducer(state, {
      type: 'MINE_BUNDLE',
      amount,
      windowBlocks: 26300,
      threshold: 13150,
    })

  it('honest support climbs the ACK count by 1 per block and advances the window', () => {
    const s = mineBundle(initialLessonState, 5000)
    expect(s.bundleAcks).toBe(5000)
    expect(s.bundleBlocksElapsed).toBe(5000)
  })

  it('reaches the 13,150 approval threshold with sustained support', () => {
    const s = mineBundle(initialLessonState, 13150)
    expect(s.bundleAcks).toBe(13150) // approved (>= threshold)
    expect(s.bundleAcks).toBeGreaterThanOrEqual(13150)
  })

  it('a hostile majority drives the ACK count DOWN by 1 per block (censorship)', () => {
    let s = mineBundle(initialLessonState, 5000) // climb to 5000
    expect(s.bundleAcks).toBe(5000)
    s = lessonReducer(s, { type: 'SET_BUNDLE_HOSTILE', hostile: true })
    s = mineBundle(s, 5000) // hostile: count falls
    expect(s.bundleAcks).toBe(0) // floored at 0, never negative
  })

  it('a sustained hostile majority lets the window expire below threshold (censored, unpaid)', () => {
    let s = lessonReducer(initialLessonState, { type: 'SET_BUNDLE_HOSTILE', hostile: true })
    s = mineBundle(s, 26300) // run the whole window hostile
    expect(s.bundleBlocksElapsed).toBe(26300) // window exhausted
    expect(s.bundleAcks).toBeLessThan(13150) // never approved
  })

  it('does not advance past the window once expired', () => {
    let s = mineBundle(initialLessonState, 26300) // exhaust the window
    expect(s.bundleBlocksElapsed).toBe(26300)
    s = mineBundle(s, 1000) // further mining is a no-op
    expect(s.bundleBlocksElapsed).toBe(26300)
  })

  it('RESET_BUNDLE clears acks, elapsed, and hostile', () => {
    let s = mineBundle(initialLessonState, 3000)
    s = lessonReducer(s, { type: 'SET_BUNDLE_HOSTILE', hostile: true })
    s = lessonReducer(s, { type: 'RESET_BUNDLE' })
    expect(s.bundleAcks).toBe(0)
    expect(s.bundleBlocksElapsed).toBe(0)
    expect(s.bundleHostile).toBe(false)
  })
})
