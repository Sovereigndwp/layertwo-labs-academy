import type { LessonStep } from '../data/lessonData'
import { TOTAL_BLOCKS } from '../state/types'
import { useLesson } from '../state/LessonProvider'
import { StepFrame } from './StepFrame'
import { Term } from './Term'

// The strip is a *representative* view: 2016 real blocks would be unreadable,
// so each square stands for many blocks. We say so out loud — no fake scale.
const STRIP_SQUARES = 96 // 3 rows of 32
const BLOCKS_PER_SQUARE = Math.round(TOTAL_BLOCKS / STRIP_SQUARES)

/**
 * Module 4 — Miner ACK Timeline.
 * Teaches WHAT (miners ACK blocks), HOW (trailing 2016-block window, support
 * decays), WHY (threshold is the Enforcer's ~90% strong supermajority — and
 * why that is debated), and HOW-WE-KNOW (falsifier tied to lib/types.rs).
 */
export function AckTimeline({ step }: { step: LessonStep }) {
  const { state, dispatch } = useLesson()
  const { ackCount, ackThreshold } = state
  const pct = (ackCount / TOTAL_BLOCKS) * 100
  const thresholdPct = (ackThreshold / TOTAL_BLOCKS) * 100
  const met = ackCount >= ackThreshold
  const filledSquares = Math.round((ackCount / TOTAL_BLOCKS) * STRIP_SQUARES)

  return (
    <StepFrame step={step} canAdvance={met} nextLabel="See what activated">
      <div className="ack">
        {/* ── Meter ── */}
        <div className="ack__meter">
          <div className="ack__stats">
            <span>
              <span className="ack__pct" data-met={met} aria-hidden="true">
                {pct.toFixed(1)}%
              </span>
            </span>
            <span style={{ textAlign: 'right' }}>
              <strong>{ackCount.toLocaleString()}</strong> /{' '}
              {TOTAL_BLOCKS.toLocaleString()} blocks with an{' '}
              <Term id="ack" />
              <br />
              target: {ackThreshold.toLocaleString()} of {TOTAL_BLOCKS} (
              {thresholdPct.toFixed(0)}%)
            </span>
          </div>

          <div
            className="ack__bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={TOTAL_BLOCKS}
            aria-valuenow={ackCount}
            aria-label="ACK progress toward activation threshold"
          >
            <div className="ack__fill" style={{ width: `${pct}%` }} />
            <div
              className="ack__threshold"
              style={{ left: `${thresholdPct}%` }}
              title={`Activation threshold (${thresholdPct.toFixed(1)}%)`}
            />
          </div>

          <p aria-live="polite" style={{ margin: 0, fontSize: 'var(--fs-300)' }}>
            {met ? (
              <span style={{ color: 'var(--ok)' }}>
                ✓ Threshold reached — the slot can now be activated.
              </span>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>
                {(ackThreshold - ackCount).toLocaleString()} more ACK-blocks to
                go.
              </span>
            )}
          </p>
        </div>

        {/* ── Representative strip ── */}
        <div>
          <div
            className="ack__strip"
            role="img"
            aria-label={`${filledSquares} of ${STRIP_SQUARES} blocks shown filled, representing ${ackCount} ACKs`}
          >
            {Array.from({ length: STRIP_SQUARES }, (_, i) => (
              <span
                key={i}
                className="ack__block"
                data-ack={i < filledSquares}
              />
            ))}
          </div>
          <p className="ack__strip-note">
            Representative view: each square stands for about{' '}
            {BLOCKS_PER_SQUARE} blocks. One real block holds at most one ACK.
          </p>
        </div>

        {/* ── (a) Controls ── */}
        <div className="ack__controls">
          <button
            type="button"
            className="btn"
            onClick={() =>
              dispatch({ type: 'MINE_BLOCKS', amount: 100, supporting: true })
            }
            disabled={ackCount >= TOTAL_BLOCKS}
          >
            ⛏ Mine 100 — miners ACK
          </button>
          <button
            type="button"
            className="btn"
            onClick={() =>
              dispatch({ type: 'MINE_BLOCKS', amount: 1, supporting: true })
            }
            disabled={ackCount >= TOTAL_BLOCKS}
          >
            ⛏ Mine 1 — ACK
          </button>
          <button
            type="button"
            className="btn"
            onClick={() =>
              dispatch({ type: 'MINE_BLOCKS', amount: 100, supporting: false })
            }
          >
            ⛏ Mine 100 — miners stop ACKing
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => dispatch({ type: 'RESET_ACKS' })}
          >
            ↺ Reset
          </button>
        </div>
        <p className="ack__strip-note">
          ACKs are counted over the trailing 2016 blocks. Mine with support to
          raise it; mine without ACKing and the oldest ACKs roll out of the
          window and the count falls. Support must be sustained.
        </p>

        {/* ── (b) Threshold probe ── */}
        <div className="ack__meter">
          <label htmlFor="ack-threshold-slider" style={{ display: 'block', marginBottom: 'var(--sp-2)', fontSize: 'var(--fs-300)', color: 'var(--text-muted)' }}>
            Activation threshold:{' '}
            <strong>
              {ackThreshold.toLocaleString()} of {TOTAL_BLOCKS} blocks (
              {thresholdPct.toFixed(1)}%)
            </strong>
          </label>
          <input
            id="ack-threshold-slider"
            className="ack__slider"
            type="range"
            min={1008}
            max={2016}
            value={ackThreshold}
            onChange={(e) =>
              dispatch({
                type: 'SET_ACK_THRESHOLD',
                count: Number(e.target.value),
              })
            }
            aria-label={`Activation threshold, ${ackThreshold} of 2016 blocks`}
          />
          <div className="ack__callout">
            {thresholdPct >= 99 ? (
              <>
                <span aria-hidden="true">⚠</span>{' '}
                <span>
                  <strong>Near-unanimous —</strong> even a tiny holdout coalition could freeze activation forever. Higher than the software's ~90% bar.
                </span>
              </>
            ) : thresholdPct >= 80 ? (
              <>
                <span aria-hidden="true">ℹ</span>{' '}
                <span>
                  <strong>The Enforcer's real rule:</strong> a strong supermajority — about 90% (1815 of 2016 blocks) of sustained hashrate — activates the slot. A high bar that resists a hostile minority; but miners still collectively decide, which is the heart of the Drivechain debate.
                </span>
              </>
            ) : (
              <>
                <span aria-hidden="true">⚠</span>{' '}
                <span>
                  <strong>Below the software's ~90% bar:</strong> a smaller coalition of miners could force a sidechain through. The Enforcer sets the bar high on purpose.
                </span>
              </>
            )}
          </div>
        </div>

        {/* ── (b2) Discovery callout: below-threshold activation ── */}
        {met && thresholdPct < 80 && (
          <div className="ack__callout" role="alert">
            <span aria-hidden="true">ℹ</span>{' '}
            <span>
              You activated with only {thresholdPct.toFixed(0)}% — below the Enforcer's ~90% bar. A smaller coalition of miners forced it through; the real software sets the bar high to prevent exactly this. Note it still trusts miners collectively.
            </span>
          </div>
        )}

        {/* ── (c) How we know / falsifier ── */}
        <div className="ack__how">
          <strong>How we know:</strong> the Enforcer activates an unused slot at 1815 of 2016 blocks (~90%) — see lib/types.rs in bip300301_enforcer. Every{' '}
          <Term id="full-node">full node</Term> checks this against the public block history. Falsifier — a sidechain that activated without ~90% sustained support over its window would be rejected by nodes running the Enforcer.
        </div>

        {/* ── (d) Analogy helper (subordinate) ── */}
        <aside className="ack__helper" aria-label="Analogy helper">
          <strong>Picture it:</strong> the highway authority repeatedly voting to
          open a new exit — one vote is not enough; they must keep voting, in the
          open, for the exit to open.
        </aside>
      </div>
    </StepFrame>
  )
}
