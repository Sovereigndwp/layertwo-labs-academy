import { describe, it, expect } from 'vitest'
import {
  isClaimStale,
  validateClaim,
  summarizeClaims,
  RECHECK_DAYS,
  type VerifiableClaim,
} from './claims'

const base: VerifiableClaim = {
  id: 'c1',
  text: 'Drivechain is a proposed soft fork.',
  tier: 'PROJ',
  sources: [{ label: 'LayerTwo Labs FAQ', url: 'https://layertwolabs.com' }],
  verifiedOn: '2026-06-03',
  status: 'verified',
}

describe('isClaimStale', () => {
  it('is false when verified within the recheck window', () => {
    const today = new Date('2026-06-10')
    expect(isClaimStale(base, today)).toBe(false)
  })
  it('is true when older than the recheck window', () => {
    const today = new Date('2026-06-03')
    const old = { ...base, verifiedOn: '2025-01-01' }
    expect(isClaimStale(old, today)).toBe(true)
  })
  it('is true when status is needs-recheck regardless of date', () => {
    const today = new Date('2026-06-03')
    expect(isClaimStale({ ...base, status: 'needs-recheck' }, today)).toBe(true)
  })
})

describe('validateClaim', () => {
  it('returns no errors for a well-formed claim', () => {
    expect(validateClaim(base)).toEqual([])
  })
  it('flags a claim with no sources', () => {
    expect(validateClaim({ ...base, sources: [] })).toContain('no sources')
  })
  it('flags a source with a non-http url', () => {
    const bad = { ...base, sources: [{ label: 'x', url: 'not-a-url' }] }
    expect(validateClaim(bad)).toContain('source url not http(s): not-a-url')
  })
  it('flags an invalid verifiedOn date', () => {
    expect(validateClaim({ ...base, verifiedOn: '06/03/2026' })).toContain(
      'verifiedOn not ISO YYYY-MM-DD: 06/03/2026',
    )
  })
})

describe('summarizeClaims', () => {
  it('counts by status and stale', () => {
    const today = new Date('2026-06-03')
    const claims: VerifiableClaim[] = [
      base,
      { ...base, id: 'c2', status: 'disputed' },
      { ...base, id: 'c3', verifiedOn: '2024-01-01' },
    ]
    const s = summarizeClaims(claims, today)
    expect(s.total).toBe(3)
    expect(s.verified).toBe(2)
    expect(s.disputed).toBe(1)
    expect(s.stale).toBe(1)
  })
})

it('RECHECK_DAYS is 180', () => {
  expect(RECHECK_DAYS).toBe(180)
})
