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
 * Mine blocks (one ACK each) toward 1916 / 2016 ≈ 95%. The point the learner
 * should feel: activation is a slow, repeated signal, not one switch.
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
              target: {ackThreshold.toLocaleString()} (~95%)
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
              title="Activation threshold (~95%)"
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

        <div className="ack__controls">
          <button
            type="button"
            className="btn"
            onClick={() => dispatch({ type: 'MINE_BLOCKS', amount: 1 })}
            disabled={ackCount >= TOTAL_BLOCKS}
          >
            ⛏ Mine next block
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => dispatch({ type: 'MINE_BLOCKS', amount: 100 })}
            disabled={ackCount >= TOTAL_BLOCKS}
          >
            ⛏ Mine 100 blocks
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => dispatch({ type: 'SET_ACK_COUNT', count: 0 })}
          >
            ↺ Reset
          </button>
        </div>

        <label>
          <span className="sr-only">Set ACK count with a slider</span>
          <input
            className="ack__slider"
            type="range"
            min={0}
            max={TOTAL_BLOCKS}
            value={ackCount}
            onChange={(e) =>
              dispatch({
                type: 'SET_ACK_COUNT',
                count: Number(e.target.value),
              })
            }
            aria-label={`ACK count, ${ackCount} of ${TOTAL_BLOCKS}`}
          />
        </label>

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
      </div>
    </StepFrame>
  )
}
