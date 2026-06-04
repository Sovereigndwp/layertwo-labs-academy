import type { LessonStep } from '../data/lessonData'
import { TOTAL_SLOTS } from '../state/types'
import { useLesson } from '../state/LessonProvider'
import { StepFrame } from './StepFrame'
import { Term } from './Term'

const TARGET_SLOT = 1

/**
 * Module 1 — Choose a Slot.
 * 256 slots; we guide the learner to reserve slot 1 for Testchain and name it.
 * Teaching beat: a slot is only a reserved highway exit, not the sidechain itself.
 */
export function SlotGrid({ step }: { step: LessonStep }) {
  const { state, dispatch } = useLesson()
  const selected = state.selectedSlot

  return (
    <StepFrame step={step} canAdvance={selected !== null}>
      <p className="slot-legend" style={{ marginBottom: 'var(--sp-3)' }}>
        <span>
          <span className="swatch" style={{ background: 'var(--surface-2)' }} />
          Empty slot
        </span>
        <span>
          <span
            className="swatch"
            style={{ borderColor: 'var(--orange-bright)' }}
          />
          Suggested (slot {TARGET_SLOT})
        </span>
        <span>
          <span className="swatch" style={{ background: 'var(--orange)' }} />
          Your reserved slot
        </span>
      </p>

      <div
        className="slotgrid"
        role="group"
        aria-label={`${TOTAL_SLOTS} drivechain slots`}
      >
        {Array.from({ length: TOTAL_SLOTS }, (_, i) => {
          const num = i + 1
          const isSelected = selected === num
          const isTarget = num === TARGET_SLOT && selected === null
          const stateAttr = isSelected
            ? 'selected'
            : isTarget
              ? 'target'
              : 'empty'
          return (
            <button
              key={num}
              type="button"
              className="slot"
              data-state={stateAttr}
              aria-pressed={isSelected}
              aria-label={
                isSelected
                  ? `Slot ${num}, reserved for ${state.sidechainName}`
                  : `Slot ${num}, empty${isTarget ? ', suggested' : ''}`
              }
              onClick={() => dispatch({ type: 'SELECT_SLOT', slot: num })}
            >
              {num}
            </button>
          )
        })}
      </div>

      {selected !== null && (
        <div className="feedback feedback--ok" role="status">
          <span className="feedback__icon" aria-hidden="true">
            ✓
          </span>
          <p>
            <b>Slot {selected} reserved.</b>
            You have claimed an exit for a <Term id="sidechain" />. No road is
            built behind it yet — reserving the slot does not create or run
            anything yet.
          </p>
        </div>
      )}

      <label
        className="card"
        style={{ marginTop: 'var(--sp-4)', display: 'block' }}
      >
        <span style={{ fontWeight: 700 }}>Name this sidechain</span>
        <input
          type="text"
          value={state.sidechainName}
          onChange={(e) =>
            dispatch({ type: 'SET_SIDECHAIN_NAME', name: e.target.value })
          }
          aria-label="Sidechain name"
          style={{
            marginTop: '8px',
            width: '100%',
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-strong)',
            background: 'var(--surface-2)',
            color: 'var(--text)',
            font: 'inherit',
          }}
        />
      </label>
    </StepFrame>
  )
}
