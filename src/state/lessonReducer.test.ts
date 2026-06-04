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
