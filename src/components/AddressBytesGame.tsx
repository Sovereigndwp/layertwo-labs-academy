import type { LessonStep } from '../data/lessonData'
import { useLesson } from '../state/LessonProvider'
import { StepFrame } from './StepFrame'
import { SidechainProposalForm } from './SidechainProposalForm'
import { Term } from './Term'

/**
 * Module 2 — Set the Sidechain Identity.
 * Three tags, one already taken. Picking the duplicate teaches why deposits
 * become ambiguous; picking a unique one explains recognition of deposits.
 * The learner may only advance once they have landed on a unique tag.
 */
export function AddressBytesGame({ step }: { step: LessonStep }) {
  const { state, dispatch, lesson } = useLesson()
  const picked = state.addressBytes

  return (
    <StepFrame step={step} canAdvance={state.isAddressBytesUnique === true}>
      <div className="card-grid card-grid--3" role="group" aria-label="Identity tags">
        {lesson.addressByteTags.map((tag) => {
          const isPicked = picked === tag.label
          return (
            <button
              key={tag.id}
              type="button"
              className="option"
              aria-pressed={isPicked}
              onClick={() =>
                dispatch({
                  type: 'SET_ADDRESS_BYTES',
                  tag: tag.label,
                  unique: !tag.taken,
                })
              }
            >
              <span className="option__title">
                <span className="option__meta">{tag.label}</span>
                {tag.taken ? (
                  <span className="pill pill--taken">Taken</span>
                ) : (
                  <span className="pill">Available</span>
                )}
              </span>
              <p className="option__note">
                {tag.taken
                  ? `Already used by ${tag.takenBy}.`
                  : 'No other sidechain is using these bytes.'}
              </p>
            </button>
          )
        })}
      </div>

      {state.isAddressBytesUnique === false && (
        <div className="feedback feedback--bad" role="alert">
          <span className="feedback__icon" aria-hidden="true">
            ✕
          </span>
          <p>
            <b>That tag is already taken.</b>
            If two sidechains share the same <Term id="address-bytes" />, the
            network cannot tell which one a <Term id="deposit" /> is for. Coins
            could be credited to the wrong chain. Pick an unused tag instead.
          </p>
        </div>
      )}

      {state.isAddressBytesUnique === true && (
        <div className="feedback feedback--ok" role="status">
          <span className="feedback__icon" aria-hidden="true">
            ✓
          </span>
          <p>
            <b>Unique tag set: {picked}.</b>
            Now the network and the sidechain software can recognize deposits
            meant for {state.sidechainName} — and nothing else gets confused
            with them.
          </p>
        </div>
      )}

      <div style={{ marginTop: 'var(--sp-4)' }}>
        <SidechainProposalForm />
      </div>
    </StepFrame>
  )
}
