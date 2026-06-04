import type { LessonStep } from '../data/lessonData'
import { useLesson } from '../state/LessonProvider'
import { StepFrame } from './StepFrame'
import { Term } from './Term'


/**
 * Module 5 — Activation (automatic).
 * In BIP300, activation happens automatically the instant sustained ACK
 * support crosses the threshold — every node checks the same public rule,
 * so there is no button to press and no authority to capture.
 * This component shows the result and separates what changed (network
 * recognition) from what did NOT (software still must run).
 */
export function ActivationStateCard({ step }: { step: LessonStep }) {
  const { state } = useLesson()
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
            <p style={{ marginTop: 'var(--sp-3)', color: 'var(--text-muted)', fontSize: 'var(--fs-300)' }}>
              This activates on its own once miner support crosses the threshold
              — there is no button to press. Go back to the Miner ACKs step and
              build sustained support.
            </p>
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
                <Term id="sidechain" />. Miners signalled enough{' '}
                <Term id="ack">ACKs</Term> over the trailing 2016 blocks, and
                every node applied the same rule automatically.
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
