import type { LessonStep, AcksConfig } from '../data/lessonData'
import { useLesson } from '../state/LessonProvider'
import { StepFrame } from './StepFrame'
import { Term } from './Term'

const STRIP_SQUARES = 96 // 3 rows of 32

/**
 * The `acks` interactive — shared by the lesson #1 *slot-activation* vote and
 * the lesson #3 *withdrawal-bundle* vote. ALL window sizes, thresholds, labels,
 * the falsifier, and the analogy helper come from `step.acks` (AcksConfig), so
 * the component carries no lesson-specific wording of its own. Two variants:
 *
 *  - 'activation' (lesson #1): rolling 2016-block ACK window + threshold probe,
 *    auto-activation. Teaches WHAT/HOW/WHY of slot activation.
 *  - 'withdrawal' (lesson #3): a 26,300-block countdown, a hostile-hashrate
 *    control, and an approve/expire outcome. The hostile control + countdown are
 *    what let the learner *discover* the censorship boundary (the WHY probe).
 */
export function AckTimeline({ step }: { step: LessonStep }) {
  const cfg = step.acks
  if (!cfg) return null
  return cfg.variant === 'withdrawal' ? (
    <WithdrawalBundleVote step={step} cfg={cfg} />
  ) : (
    <SlotActivationVote step={step} cfg={cfg} />
  )
}

/** Shared "How we know" + analogy footer, driven entirely by config. */
function HowWeKnow({ cfg }: { cfg: AcksConfig }) {
  return (
    <>
      <div className="ack__how">
        <strong>How we know:</strong>{' '}
        {cfg.howWeKnowTermId && (
          <>
            <Term id={cfg.howWeKnowTermId} />{' '}
          </>
        )}
        {cfg.howWeKnow}
      </div>
      <aside className="ack__helper" aria-label="Analogy helper">
        <strong>Picture it:</strong> {cfg.analogyHelper}
      </aside>
    </>
  )
}

// ---------------------------------------------------------------------------
// Lesson #1 — slot-activation vote (rolling window + threshold probe)
// ---------------------------------------------------------------------------
function SlotActivationVote({
  step,
  cfg,
}: {
  step: LessonStep
  cfg: AcksConfig
}) {
  const { state, dispatch } = useLesson()
  const { ackCount, ackThreshold } = state
  const total = cfg.windowBlocks
  const blocksPerSquare = Math.round(total / STRIP_SQUARES)
  const pct = (ackCount / total) * 100
  const thresholdPct = (ackThreshold / total) * 100
  const met = ackCount >= ackThreshold
  const filledSquares = Math.round((ackCount / total) * STRIP_SQUARES)
  const sliderMin = cfg.sliderMin ?? Math.round(total / 2)
  const sliderMax = cfg.sliderMax ?? total

  return (
    <StepFrame step={step} canAdvance={met} nextLabel={cfg.nextLabel}>
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
              {total.toLocaleString()} blocks with an <Term id="ack" />
              <br />
              target: {ackThreshold.toLocaleString()} of{' '}
              {total.toLocaleString()} ({thresholdPct.toFixed(0)}%)
            </span>
          </div>

          <div
            className="ack__bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={ackCount}
            aria-label={`ACK progress toward ${cfg.thresholdLabel.toLowerCase()}`}
          >
            <div className="ack__fill" style={{ width: `${pct}%` }} />
            <div
              className="ack__threshold"
              style={{ left: `${thresholdPct}%` }}
              title={`${cfg.thresholdLabel} (${thresholdPct.toFixed(1)}%)`}
            />
          </div>

          <p aria-live="polite" style={{ margin: 0, fontSize: 'var(--fs-300)' }}>
            {met ? (
              <span style={{ color: 'var(--ok)' }}>
                ✓ Threshold reached — the {cfg.subjectNoun} can now be{' '}
                {cfg.successVerb}.
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
            Representative view: each square stands for about {blocksPerSquare}{' '}
            blocks. One real block holds at most one ACK.
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
            disabled={ackCount >= total}
          >
            ⛏ Mine 100 — miners ACK
          </button>
          <button
            type="button"
            className="btn"
            onClick={() =>
              dispatch({ type: 'MINE_BLOCKS', amount: 1, supporting: true })
            }
            disabled={ackCount >= total}
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
          ACKs are counted over the trailing {total.toLocaleString()} blocks.
          Mine with support to raise it; mine without ACKing and the oldest ACKs
          roll out of the window and the count falls. Support must be sustained.
        </p>

        {/* ── (b) Threshold probe ── */}
        <div className="ack__meter">
          <label
            htmlFor="ack-threshold-slider"
            style={{
              display: 'block',
              marginBottom: 'var(--sp-2)',
              fontSize: 'var(--fs-300)',
              color: 'var(--text-muted)',
            }}
          >
            {cfg.thresholdLabel}:{' '}
            <strong>
              {ackThreshold.toLocaleString()} of {total.toLocaleString()} blocks
              ({thresholdPct.toFixed(1)}%)
            </strong>
          </label>
          <input
            id="ack-threshold-slider"
            className="ack__slider"
            type="range"
            min={sliderMin}
            max={sliderMax}
            value={ackThreshold}
            onChange={(e) =>
              dispatch({
                type: 'SET_ACK_THRESHOLD',
                count: Number(e.target.value),
              })
            }
            aria-label={`${cfg.thresholdLabel}, ${ackThreshold} of ${total} blocks`}
          />
          <div className="ack__callout">
            {thresholdPct >= 99 ? (
              <>
                <span aria-hidden="true">⚠</span>{' '}
                <span>
                  <strong>Near-unanimous —</strong> even a tiny holdout coalition
                  could freeze activation forever. Higher than the software's
                  ~90% bar.
                </span>
              </>
            ) : thresholdPct >= 80 ? (
              <>
                <span aria-hidden="true">ℹ</span>{' '}
                <span>
                  <strong>The Enforcer's real rule:</strong> a strong
                  supermajority — about 90% (1815 of 2016 blocks) of sustained
                  hashrate — activates the slot. A high bar that resists a
                  hostile minority; but miners still collectively decide, which
                  is the heart of the Drivechain debate.
                </span>
              </>
            ) : (
              <>
                <span aria-hidden="true">⚠</span>{' '}
                <span>
                  <strong>Below the software's ~90% bar:</strong> a smaller
                  coalition of miners could force a sidechain through. The
                  Enforcer sets the bar high on purpose.
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
              You activated with only {thresholdPct.toFixed(0)}% — below the
              Enforcer's ~90% bar. A smaller coalition of miners forced it
              through; the real software sets the bar high to prevent exactly
              this. Note it still trusts miners collectively.
            </span>
          </div>
        )}

        {/* ── (c) How we know + analogy ── */}
        <HowWeKnow cfg={cfg} />
      </div>
    </StepFrame>
  )
}

// ---------------------------------------------------------------------------
// Lesson #3 — withdrawal-bundle vote (countdown + hostile-hashrate probe)
// ---------------------------------------------------------------------------
function WithdrawalBundleVote({
  step,
  cfg,
}: {
  step: LessonStep
  cfg: AcksConfig
}) {
  const { state, dispatch } = useLesson()
  const { bundleAcks, bundleBlocksElapsed, bundleHostile } = state
  const total = cfg.windowBlocks
  const threshold = cfg.threshold
  const blocksPerSquare = Math.round(total / STRIP_SQUARES)

  const pct = (bundleAcks / total) * 100
  const thresholdPct = (threshold / total) * 100
  const blocksRemaining = total - bundleBlocksElapsed
  const approved = bundleAcks >= threshold
  const expired = !approved && blocksRemaining <= 0
  const filledSquares = Math.round((bundleAcks / total) * STRIP_SQUARES)
  const elapsedSquares = Math.round(
    (bundleBlocksElapsed / total) * STRIP_SQUARES,
  )

  const mine = (amount: number) =>
    dispatch({
      type: 'MINE_BUNDLE',
      amount,
      windowBlocks: total,
      threshold,
    })

  return (
    <StepFrame step={step} canAdvance={approved || expired} nextLabel={cfg.nextLabel}>
      <div className="ack">
        {/* ── Meter ── */}
        <div className="ack__meter">
          <div className="ack__stats">
            <span>
              <span className="ack__pct" data-met={approved} aria-hidden="true">
                {bundleAcks.toLocaleString()}
              </span>
            </span>
            <span style={{ textAlign: 'right' }}>
              <strong>{bundleAcks.toLocaleString()}</strong> /{' '}
              {threshold.toLocaleString()} <Term id="ack">ACKs</Term> on this{' '}
              <Term id="withdrawal-bundle">{cfg.subjectNoun}</Term>
              <br />
              target: {threshold.toLocaleString()} (half the{' '}
              {total.toLocaleString()}-block window)
            </span>
          </div>

          <div
            className="ack__bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={threshold}
            aria-valuenow={bundleAcks}
            aria-label={`Withdrawal-bundle ACK progress toward the ${threshold}-ACK ${cfg.thresholdLabel.toLowerCase()}`}
          >
            <div className="ack__fill" style={{ width: `${pct}%` }} />
            <div
              className="ack__threshold"
              style={{ left: `${thresholdPct}%` }}
              title={`${cfg.thresholdLabel} (${threshold.toLocaleString()} ACKs)`}
            />
          </div>

          <p aria-live="polite" style={{ margin: 0, fontSize: 'var(--fs-300)' }}>
            {approved ? (
              <span style={{ color: 'var(--ok)' }}>
                ✓ {threshold.toLocaleString()} ACKs reached — the{' '}
                {cfg.subjectNoun} is {cfg.successVerb} and its M6 payout can be
                included.
              </span>
            ) : expired ? (
              <span style={{ color: 'var(--bad)' }}>
                ✕ Window expired at {total.toLocaleString()} blocks with only{' '}
                {bundleAcks.toLocaleString()} of {threshold.toLocaleString()}{' '}
                ACKs — the bundle is dropped unpaid. The withdrawal was censored.
              </span>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>
                {Math.max(0, threshold - bundleAcks).toLocaleString()} more ACKs
                needed · {blocksRemaining.toLocaleString()} of{' '}
                {total.toLocaleString()} blocks remaining in the window.
              </span>
            )}
          </p>
        </div>

        {/* ── Countdown clock ── */}
        <div className="ack__meter">
          <div className="ack__stats">
            <span style={{ fontSize: 'var(--fs-300)', color: 'var(--text-muted)' }}>
              <Term id="vote-window">Blocks Remaining</Term>
            </span>
            <span style={{ textAlign: 'right' }}>
              <strong>{blocksRemaining.toLocaleString()}</strong> /{' '}
              {total.toLocaleString()} blocks (~6 months)
            </span>
          </div>
          <div
            className="ack__bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={bundleBlocksElapsed}
            aria-label={`Vote window elapsed: ${bundleBlocksElapsed} of ${total} blocks`}
          >
            <div
              className="ack__fill"
              style={{ width: `${(bundleBlocksElapsed / total) * 100}%`, opacity: 0.5 }}
            />
          </div>
        </div>

        {/* ── Representative strip ── */}
        <div>
          <div
            className="ack__strip"
            role="img"
            aria-label={`${filledSquares} of ${STRIP_SQUARES} squares filled, representing ${bundleAcks} ACKs; ${elapsedSquares} squares of window elapsed`}
          >
            {Array.from({ length: STRIP_SQUARES }, (_, i) => (
              <span
                key={i}
                className="ack__block"
                data-ack={i < filledSquares}
                data-elapsed={i < elapsedSquares}
              />
            ))}
          </div>
          <p className="ack__strip-note">
            Representative view: each square stands for about {blocksPerSquare}{' '}
            blocks. From one block to the next, the ACK count moves by at most 1.
          </p>
        </div>

        {/* ── (a) Controls ── */}
        <div className="ack__controls">
          <button
            type="button"
            className="btn"
            onClick={() => mine(2000)}
            disabled={approved || expired}
          >
            ⛏ Mine 2,000 blocks
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => mine(100)}
            disabled={approved || expired}
          >
            ⛏ Mine 100 blocks
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => dispatch({ type: 'RESET_BUNDLE' })}
          >
            ↺ Reset
          </button>
        </div>
        <p className="ack__strip-note">
          Each block, miners cast at most one ACK toward the bundle. With honest
          support the count climbs by 1 per block; under a hostile majority it
          falls by 1 per block. Either way the window keeps counting down — and
          when it hits zero an unapproved bundle expires.
        </p>

        {/* ── (b) Hostile-hashrate control (the WHY probe) ── */}
        <div className="ack__meter">
          <label
            className="ack__hostile-toggle"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--sp-2)',
              fontSize: 'var(--fs-300)',
            }}
          >
            <input
              type="checkbox"
              checked={bundleHostile}
              onChange={(e) =>
                dispatch({ type: 'SET_BUNDLE_HOSTILE', hostile: e.target.checked })
              }
              aria-label="Turn the hashrate majority hostile (over 50% refuses to ACK)"
            />
            <span>
              <strong>Hostile hashrate majority (&gt;50%)</strong> — when on,
              mining blocks drives the bundle's ACK count <em>down</em> instead
              of up.
            </span>
          </label>
          <div className="ack__callout">
            {bundleHostile ? (
              <>
                <span aria-hidden="true">⚠</span>{' '}
                <span>
                  <strong>Hostile majority active.</strong> Mine to the end of
                  the window and watch the count stall below{' '}
                  {threshold.toLocaleString()} — the bundle expires unpaid. This
                  is censorship: a &gt;50% majority can simply withhold ACKs.
                </span>
              </>
            ) : (
              <>
                <span aria-hidden="true">ℹ</span>{' '}
                <span>
                  Honest support: keep mining and the count rises toward{' '}
                  {threshold.toLocaleString()}. Toggle the hostile majority to
                  see the censorship boundary for yourself.
                </span>
              </>
            )}
          </div>
        </div>

        {/* ── (b2) Discovery callout: censored outcome ── */}
        {expired && (
          <div className="ack__callout" role="alert">
            <span aria-hidden="true">✕</span>{' '}
            <span>
              The window ran out with the count held below{' '}
              {threshold.toLocaleString()}. Because a payout needs{' '}
              {threshold.toLocaleString()} ACKs and the count never crossed it,
              the bundle is dropped unpaid — the withdrawal was{' '}
              <strong>censored</strong> by the hostile majority. The requests
              must be re-submitted in a new bundle.
            </span>
          </div>
        )}

        {/* ── (c) How we know + analogy ── */}
        <HowWeKnow cfg={cfg} />
      </div>
    </StepFrame>
  )
}
