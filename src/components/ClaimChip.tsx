import { Tooltip } from './Tooltip'
import { isClaimStale, type VerifiableClaim } from '../state/claims'

const TIER_LABEL: Record<VerifiableClaim['tier'], string> = {
  DEV: 'spec/code',
  DATA: 'measured',
  INST: 'institutional',
  PRESS: 'press',
  PROJ: 'project',
  ANEC: 'anecdotal',
}

/**
 * Inline citation for a single verifiable claim: a tier chip + the claim text,
 * with sources and the verification date in a tooltip. Stale/disputed claims
 * are visibly marked (icon + text, never color alone).
 */
export function ClaimChip({ claim }: { claim: VerifiableClaim }) {
  const stale = isClaimStale(claim, new Date())
  const flag =
    claim.status === 'disputed' ? '⚠ disputed' : stale ? '↻ recheck due' : '✓ verified'
  const tip = `${TIER_LABEL[claim.tier]} · ${flag} · verified ${claim.verifiedOn}\n${claim.sources
    .map((s) => s.label)
    .join(' · ')}`
  return (
    <span className="claimchip" data-status={claim.status} data-stale={stale}>
      <Tooltip content={tip}>
        <span className="claimchip__tier" aria-label={`source tier: ${TIER_LABEL[claim.tier]}`}>
          {claim.tier}
        </span>
      </Tooltip>{' '}
      {claim.text}{' '}
      {claim.sources.map((s, i) => (
        <a key={i} className="claimchip__src" href={s.url} target="_blank" rel="noreferrer">
          [{i + 1}]
        </a>
      ))}
    </span>
  )
}
