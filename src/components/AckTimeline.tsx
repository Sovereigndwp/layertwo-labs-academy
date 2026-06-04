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
 * decays), WHY (threshold reveals cartel-vs-liveness tradeoff → ~95%),
 * and HOW-WE-KNOW (falsifier tied to BIP300).
 */
export function AckTimeline({ step }: { step: LessonStep }) {
  const { state, dispatch } = useLesson()
  const { ackCount, ackThreshold } = state
  const pct = (ackCount / TOTAL_BLOCKS) * 100
  const thresholdPct = (ackThreshold / TOTAL_BLOCKS) * 100
  const met = ackCount >= ackThreshold
  const filledSquares = Math.round((ackCount / TOTAL_BLOCKS) * STRIP_SQUARES)

  return (
    <StepFrame step={step} canAdvance={met} nextLabel="Activate the slot">
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
              target: {ackThreshold.toLocaleString()} (
              {((ackThreshold / TOTAL_BLOCKS) * 100).toFixed(1)}%)
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
            disabled={ackCount <= 0}
          >
            ⛏ Mine 100 — miners stop ACKing
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => dispatch({ type: 'SET_ACK_COUNT', count: 0 })}
          >
            ↺ Reset
          </button>
        </div>
        <p className="ack__strip-note">
          ACKs are counted over the trailing 2016 blocks. Push support up, then
          mine without ACKing — watch it fall. Activation needs sustained
          support, not one spike.
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
            {thresholdPct < 60 ? (
              <>
                <span aria-hidden="true">⚠</span>{' '}
                <span>
                  <strong>Low bar:</strong> a bare-majority cartel could force a
                  sidechain the rest of the network rejects.
                </span>
              </>
            ) : thresholdPct >= 99 ? (
              <>
                <span aria-hidden="true">⚠</span>{' '}
                <span>
                  <strong>Near-unanimous:</strong> a single hold-out could freeze
                  activation forever — a liveness risk.
                </span>
              </>
            ) : (
              <>
                <span aria-hidden="true">≈95%</span>{' '}
                <span>
                  is the balance: high enough that no cartel can force it, low
                  enough that a few hold-outs cannot freeze it.
                </span>
              </>
            )}
          </div>
        </div>

        {/* ── (c) How we know / falsifier ── */}
        <div className="ack__how">
          <strong>How we know:</strong> every{' '}
          <Term id="full-node">full node</Term> checks this against the public
          block history (BIP300). Falsifier — a sidechain that activated without
          sustained ~95% ACKs would be rejected by nodes.
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
