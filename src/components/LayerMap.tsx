import { useState } from 'react'
import type { LayerInfo, LessonStep } from '../data/lessonData'
import { useLesson } from '../state/LessonProvider'
import { StepFrame } from './StepFrame'
import { ClaimChip } from './ClaimChip'
import { Term } from './Term'

/** Maturity → an icon + text label (never color alone). */
const MATURITY: Record<LayerInfo['maturity'], { icon: string; label: string }> = {
  live: { icon: '●', label: 'Live today' },
  emerging: { icon: '◐', label: 'Emerging' },
  proposed: { icon: '○', label: 'Proposed (not live)' },
}

/** What happens to your exit when the operator turns hostile — icon + text. */
const HOSTILE: Record<
  LayerInfo['hostileOutcome'],
  { icon: string; label: string; tone: string }
> = {
  holds: { icon: '🛡', label: 'Exit holds — self-custody', tone: 'ok' },
  degrades: { icon: '⚠', label: 'Exit degrades — act before a timeout', tone: 'warn' },
  fails: { icon: '⛔', label: 'Exit can be blocked', tone: 'bad' },
}

/**
 * Lesson #2 interactive. Two views share one component, chosen by step id:
 *  - 'layer-map'      → comparison grid + "operator turns hostile" probe.
 *  - 'drivechain-fit' → trust × finality plane + "hostile hashrate" slider.
 *
 * Both clear the depth bar: WHAT (compare real layers) · HOW (each reveals its
 * trust model + exit answer) · WHY (force the hostile case until an exit breaks)
 * · HOW-WE-KNOW (every fact carries a ClaimChip to a primary source).
 */
export function LayerMap({ step }: { step: LessonStep }) {
  if (step.id === 'drivechain-fit') return <DrivechainFit step={step} />
  return <LayerComparison step={step} />
}

// ---------------------------------------------------------------------------
// View 1 — comparison grid + hostile-operator probe
// ---------------------------------------------------------------------------
function LayerComparison({ step }: { step: LessonStep }) {
  const { state, dispatch, lesson } = useLesson()
  const layers = lesson.layers ?? []
  const [open, setOpen] = useState<string | null>(null)
  const [hostile, setHostile] = useState(false)

  const claimById = (id: string) => lesson.claims.find((c) => c.id === id)
  const canAdvance = state.hostileProbed && state.exploredLayers.length >= 3

  const toggleHostile = () => {
    setHostile((h) => !h)
    if (!state.hostileProbed) dispatch({ type: 'SET_HOSTILE_PROBED' })
  }

  return (
    <StepFrame step={step} canAdvance={canAdvance} nextLabel="Now place Drivechain">
      <div className="layermap__toolbar">
        <button
          type="button"
          className="btn"
          aria-pressed={hostile}
          data-on={hostile}
          onClick={toggleHostile}
        >
          <span aria-hidden="true">{hostile ? '🔥 ' : '🧪 '}</span>
          {hostile ? 'Hostile operator: ON' : 'Assume the operator turns hostile'}
        </button>
        <p className="layermap__counter" aria-live="polite">
          Explored {state.exploredLayers.length} of {layers.length}
          {!canAdvance && ' · open 3 and try the hostile switch to continue'}
        </p>
        {hostile && (
          <p className="layermap__hostile-summary" role="status">
            Hostile mode on: self-custody (Bitcoin, Lightning) holds; a federation
            (Liquid) or a miner majority (Drivechain) can block your exit.
          </p>
        )}
      </div>

      <ul className="layergrid" aria-label="Bitcoin layers">
        {layers.map((layer) => {
          const isOpen = open === layer.id
          const explored = state.exploredLayers.includes(layer.id)
          const mat = MATURITY[layer.maturity]
          const host = HOSTILE[layer.hostileOutcome]
          return (
            <li key={layer.id} className="layercard" data-open={isOpen}>
              <button
                type="button"
                className="layercard__head"
                aria-expanded={isOpen}
                aria-controls={`layer-${layer.id}`}
                onClick={() => {
                  setOpen(isOpen ? null : layer.id)
                  if (!explored) dispatch({ type: 'EXPLORE_LAYER', layerId: layer.id })
                }}
              >
                <span className="layercard__name">
                  {layer.name}
                  {explored && (
                    <span className="layercard__seen" aria-label="explored">
                      ✓
                    </span>
                  )}
                </span>
                <span className="layercard__maturity" data-maturity={layer.maturity}>
                  <span aria-hidden="true">{mat.icon}</span> {mat.label}
                </span>
                <span className="layercard__metaphor">{layer.metaphor}</span>
                <span className="layercard__trust">
                  Trust model: <b>{layer.trustModel}</b>
                </span>
              </button>

              {hostile && (
                <p className="layercard__hostile" data-tone={host.tone}>
                  <span aria-hidden="true">{host.icon}</span> {host.label}
                </p>
              )}

              {isOpen && (
                <div className="layercard__body" id={`layer-${layer.id}`}>
                  <p>
                    <b>What you give up:</b> {layer.tradeoff}
                  </p>
                  <p>
                    <b>Who can stop you exiting?</b> {layer.whoCanStopExit}
                  </p>
                  {layer.claimIds.length > 0 && (
                    <ul className="claimlist">
                      {layer.claimIds.map((id) => {
                        const claim = claimById(id)
                        return claim ? (
                          <li key={id}>
                            <ClaimChip claim={claim} />
                          </li>
                        ) : null
                      })}
                    </ul>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <div className="slot-how">
        <strong>How we know — and the falsifier:</strong> the “who can stop you
        exiting?” answer is the test. Force the hostile case and the layers split:{' '}
        <Term id="self-custody">self-custody</Term> (Bitcoin, Lightning) holds,
        while a <Term id="federation">federation</Term> (Liquid) or a miner
        majority (Drivechain) can block your exit. If a layer’s funds were truly
        seizable by no one, the hostile switch would change nothing — for some
        layers, it changes everything.
      </div>
    </StepFrame>
  )
}

// ---------------------------------------------------------------------------
// View 2 — trust × finality plane + hostile-hashrate slider
// ---------------------------------------------------------------------------
function DrivechainFit({ step }: { step: LessonStep }) {
  const { state, dispatch, lesson } = useLesson()
  const layers = lesson.layers ?? []
  const placed = state.drivechainPlaced
  const [hashrate, setHashrate] = useState(20)

  const withdrawalClaim = lesson.claims.find((c) => c.id === 'drivechain-withdrawal')
  const hostile = hashrate >= 50

  const trustWord = (t: number) =>
    t < 33 ? 'low trust' : t < 66 ? 'medium trust' : 'high trust'
  const finalityWord = (f: number) =>
    f < 33
      ? 'self-sovereign settlement'
      : f < 66
        ? 'partly contingent settlement'
        : 'highly contingent settlement'

  return (
    <StepFrame step={step} canAdvance={placed} nextLabel="Reflect">
      {/* Visual plane is decorative — the numbered legend below carries the same
          data as real, full-size text for every reader. */}
      <div className="plane" aria-hidden="true">
        <span className="plane__y-label">more contingent ↑</span>
        <span className="plane__x-label">more trust →</span>
        {layers.map((l, i) => {
          const isDC = l.id === 'drivechain'
          return (
            <span
              key={l.id}
              className="plane__dot"
              data-drivechain={isDC || undefined}
              data-placed={isDC ? placed : undefined}
              style={{ left: `${l.trust}%`, bottom: `${l.finality}%` }}
            >
              {isDC && !placed ? '?' : i + 1}
            </span>
          )
        })}
      </div>

      <ol
        className="plane__legend"
        aria-label="Where each layer sits — trust and settlement"
      >
        {layers.map((l, i) => {
          const isDC = l.id === 'drivechain'
          return (
            <li key={l.id} data-drivechain={isDC || undefined}>
              <span className="plane__legend-num" aria-hidden="true">
                {isDC && !placed ? '?' : i + 1}
              </span>
              <span>
                <b>{l.name}</b> —{' '}
                {isDC && !placed
                  ? 'not placed yet'
                  : `${trustWord(l.trust)}, ${finalityWord(l.finality)}`}
              </span>
            </li>
          )
        })}
      </ol>

      {!placed ? (
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => dispatch({ type: 'PLACE_DRIVECHAIN' })}
        >
          Place Drivechain on the map
        </button>
      ) : (
        <div className="feedback feedback--info" role="status">
          <span className="feedback__icon" aria-hidden="true">
            📍
          </span>
          <p>
            Drivechain lands in the <b>high-trust, contingent-settlement</b>{' '}
            corner: its withdrawals depend on a miner majority, not on you alone.
            That position — not its features — is what the debate is about.
          </p>
        </div>
      )}

      <div className="slot-probe card">
        <label htmlFor="hashrate-slider">
          Probe the debate — hostile hashrate:{' '}
          <b>{hashrate}%</b>
        </label>
        <input
          id="hashrate-slider"
          type="range"
          min={0}
          max={100}
          step={5}
          value={hashrate}
          onChange={(e) => setHashrate(Number(e.target.value))}
        />
        <p aria-live="polite" className="slot-probe__feedback" data-tone={hostile ? 'bad' : 'ok'}>
          {hostile ? (
            <>
              <span aria-hidden="true">⛔ </span>
              Past 50%, a hostile majority can refuse to ACK — or redirect — your{' '}
              <Term id="withdrawal-vote">withdrawal</Term>. The whole model rests
              on miners <i>not</i> doing this. That is the tradeoff you met in
              lesson 1.
            </>
          ) : (
            <>
              <span aria-hidden="true">✓ </span>
              Below 50%, an honest majority carries the vote and your withdrawal
              proceeds over the 26,300-block window. Drivechain assumes this
              stays true.
            </>
          )}
        </p>
      </div>

      <div className="slot-how">
        <strong>How we know — and the falsifier:</strong> a full node enforcing
        BIP300 rejects any withdrawal bundle that settles without 13,150 ACKs
        across the 26,300-block window — if one ever settled without them, the
        rule would be broken.{' '}
        {withdrawalClaim && <ClaimChip claim={withdrawalClaim} />}
      </div>
    </StepFrame>
  )
}
