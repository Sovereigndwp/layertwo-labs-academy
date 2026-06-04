import { useState } from 'react'
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

  const [probe, setProbe] = useState<string>('')
  const probeNum = Number(probe)
  const probeFeedback =
    probe === '' ? 'Enter a slot number to test the limit.'
    : !Number.isInteger(probeNum) || probeNum < 1 ? 'Slots are numbered from 1.'
    : probeNum <= 256 ? `✓ Slot ${probeNum} is valid — one of the 256.`
    : `✗ There is no slot ${probeNum}. The sidechain number is a single byte — 256 values in total. 256 is a hard ceiling set by the encoding, not a rule anyone can raise.`

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

      <div className="slot-probe card">
        <label htmlFor="slot-probe-input">
          Probe the limit — propose a slot number:
        </label>
        <input
          id="slot-probe-input"
          type="number"
          min={1}
          value={probe}
          onChange={(e) => setProbe(e.target.value)}
          placeholder="try 256, then 257"
        />
        <p aria-live="polite" className="slot-probe__feedback">
          {probeFeedback}
        </p>
      </div>

      <div className="slot-how">
        <strong>How we know two sidechains can't fight over a slot:</strong> the{' '}
        <Term id="enforcer">Enforcer</Term> rejects a re-proposal of an
        already-taken (slot, description), so miners cannot reset or hijack it.
        Falsifier — if you could re-propose slot 1 with different software and
        wipe its votes, slots would not be stable; the code refuses it.
      </div>

      <aside className="slot-helper" aria-label="Analogy helper">
        <strong>Picture it:</strong> a slot is a numbered exit on the Bitcoin
        highway — claiming it reserves that exit number, but the side road still
        has to be built.
      </aside>
    </StepFrame>
  )
}
