export type ClaimTier = 'DEV' | 'DATA' | 'INST' | 'PRESS' | 'PROJ' | 'ANEC'
export type ClaimStatus = 'verified' | 'needs-recheck' | 'disputed'

export interface ClaimSource {
  label: string
  url: string
}

export interface VerifiableClaim {
  id: string
  text: string
  tier: ClaimTier
  sources: ClaimSource[]
  verifiedOn: string
  status: ClaimStatus
}

export const RECHECK_DAYS = 180

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function daysBetween(a: Date, b: Date): number {
  const ms = a.getTime() - b.getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

export function isClaimStale(claim: VerifiableClaim, today: Date): boolean {
  if (claim.status === 'needs-recheck') return true
  if (!ISO_DATE.test(claim.verifiedOn)) return true
  const verified = new Date(claim.verifiedOn + 'T00:00:00Z')
  return daysBetween(today, verified) > RECHECK_DAYS
}

export function validateClaim(claim: VerifiableClaim): string[] {
  const errors: string[] = []
  if (!claim.id) errors.push('missing id')
  if (!claim.text.trim()) errors.push('empty text')
  if (claim.sources.length === 0) errors.push('no sources')
  for (const s of claim.sources) {
    if (!/^https?:\/\//.test(s.url)) errors.push(`source url not http(s): ${s.url}`)
  }
  if (!ISO_DATE.test(claim.verifiedOn))
    errors.push(`verifiedOn not ISO YYYY-MM-DD: ${claim.verifiedOn}`)
  return errors
}

export interface ClaimSummary {
  total: number
  verified: number
  disputed: number
  stale: number
}

export function summarizeClaims(claims: VerifiableClaim[], today: Date): ClaimSummary {
  return {
    total: claims.length,
    verified: claims.filter((c) => c.status === 'verified').length,
    disputed: claims.filter((c) => c.status === 'disputed').length,
    stale: claims.filter((c) => isClaimStale(c, today)).length,
  }
}
