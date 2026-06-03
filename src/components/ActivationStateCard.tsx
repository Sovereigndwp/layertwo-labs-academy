import type { LessonStep } from '../data/lessonData'
import { useLesson } from '../state/LessonProvider'
import { StepFrame } from './StepFrame'
import { Term } from './Term'

/**
 * Module 5 — Activate the Sidechain.
 * Flips the slot from "proposed" to "active" and, crucially, separates what
 * changed (network recognition) from what did NOT (software still must run).
 */
export function ActivationStateCard({ step }: { step: LessonStep }) {
  const { state, dispatch } = useLesson()
  const active = state.activationStatus === 'active'

  return (
    <StepFrame step={step} canAdvance={active}>
      <div className="activation">
        <div className="statuscard" data-status={active ? 'active' : 'proposed'}>
          <p style={{ margin: 0, color: 'var(--text-faint)' }}>
            Slot #{state.selectedSlot} · {state.sidechainName}
          </p>
          <p className="statuscard__badge" aria-live="polite">
            <span aria-hidden="true">{active ? '🟢' : '🟠'}</span>
            {active ? 'ACTIVE' : 'PROPOSED'}
          </p>
          {!active && (
            <button
              type="button"
              className="btn btn--primary"
              style={{ marginTop: 'var(--sp-3)' }}
              onClick={() =>
                dispatch({ type: 'SET_ACTIVATION', status: 'active' })
              }
            >
              Activate the slot
            </button>
          )}
        </div>

        {active && (
          <div className="changecols">
            <div className="card feedback--ok" style={{ borderColor: 'var(--ok)' }}>
              <h4>
                <span aria-hidden="true">✓</span> What changed
              </h4>
              <p className="option__note">
                The network now recognizes this slot as an active{' '}
                <Term id="sidechain" />. Miners have signalled enough{' '}
                <Term id="ack">ACKs</Term> over time, so the proposal is
                accepted.
              </p>
            </div>
            <div className="card">
              <h4>
                <span aria-hidden="true">○</span> What did NOT change
              </h4>
              <p className="option__note">
                Nothing runs automatically. To actually use {state.sidechainName},
                people still have to download and run the real sidechain
                software. Activation is recognition, not magic.
              </p>
            </div>
          </div>
        )}
      </div>
    </StepFrame>
  )
}
