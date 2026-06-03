import type { LessonStep } from '../data/lessonData'
import { lessonData } from '../data/lessonData'
import { useLesson } from '../state/LessonProvider'
import { StepFrame } from './StepFrame'
import { SidechainProposalForm } from './SidechainProposalForm'

/**
 * Module 3 — Pick the Official Starting Version.
 * Three release cards; the current stable build is the sensible authoritative
 * choice. Feedback explains this is about a shared starting definition, not
 * freezing the software forever.
 */
export function SoftwareReleaseSelector({ step }: { step: LessonStep }) {
  const { state, dispatch } = useLesson()
  const picked = state.selectedRelease
  const pickedRelease = lessonData.releases.find((r) => r.id === picked)

  return (
    <StepFrame step={step} canAdvance={picked !== null}>
      <div className="card-grid card-grid--3" role="group" aria-label="Software releases">
        {lessonData.releases.map((rel) => {
          const isPicked = picked === rel.id
          return (
            <button
              key={rel.id}
              type="button"
              className="option"
              aria-pressed={isPicked}
              onClick={() =>
                dispatch({ type: 'SELECT_RELEASE', releaseId: rel.id })
              }
            >
              <span className="option__title">
                <span>{rel.version}</span>
                {rel.recommended && (
                  <span className="pill pill--rec">Latest stable</span>
                )}
              </span>
              <p className="option__note" style={{ color: 'var(--text-faint)' }}>
                {rel.date}
              </p>
              <p className="option__note">{rel.note}</p>
            </button>
          )
        })}
      </div>

      {pickedRelease && (
        <div
          className={
            pickedRelease.recommended
              ? 'feedback feedback--ok'
              : 'feedback feedback--info'
          }
          role="status"
        >
          <span className="feedback__icon" aria-hidden="true">
            {pickedRelease.recommended ? '✓' : 'ℹ'}
          </span>
          <p>
            {pickedRelease.recommended ? (
              <>
                <b>Good starting definition.</b>
                Flagging the current stable release gives everyone a clear,
                checkable answer to “what is this sidechain supposed to be?”. It
                does not freeze it forever — later soft-fork versions can ship,
                as long as withdrawals still match this flagged release.
              </>
            ) : (
              <>
                <b>You can choose this — but think about it.</b>
                Marking an old or still-changing build as authoritative makes
                the “official definition” fuzzier and invites disputes later.
                The point of this field is to reduce arguments, not add them.
              </>
            )}
          </p>
        </div>
      )}

      <div style={{ marginTop: 'var(--sp-4)' }}>
        <SidechainProposalForm />
      </div>
    </StepFrame>
  )
}
