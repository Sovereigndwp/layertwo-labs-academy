import type { ReactNode } from 'react'
import type { LessonStep } from '../data/lessonData'
import { useLesson } from '../state/LessonProvider'

/**
 * Every screen wears the same five beats:
 *   eyebrow (nav label) · headline · explain · [learner action] · why-this-matters
 * The interactive action is passed as children. `canAdvance` gates the Next
 * button so the learner must actually do the action before moving on.
 */
export function StepFrame({
  step,
  children,
  canAdvance,
  nextLabel = 'Continue',
}: {
  step: LessonStep
  children: ReactNode
  canAdvance: boolean
  nextLabel?: string
}) {
  const { state, dispatch, lesson } = useLesson()
  const isFirst = state.lessonStep === 0
  const isLast = state.lessonStep === lesson.steps.length - 1

  return (
    <section className="step" aria-labelledby={`h-${step.id}`}>
      <p className="step__eyebrow">
        Step {state.lessonStep + 1} of {lesson.steps.length} · {step.navLabel}
      </p>
      <h2 id={`h-${step.id}`} className="step__headline">
        {step.headline}
      </h2>
      <p className="step__explain">{step.explain}</p>

      {children}

      <p className="step__why">
        <span aria-hidden="true">💡</span>
        <span>
          <b>Why this matters:</b> {step.why}
        </span>
      </p>

      <nav className="stepnav" aria-label="Lesson navigation">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => dispatch({ type: 'PREV_STEP' })}
          disabled={isFirst}
        >
          ← Back
        </button>
        {!isLast && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => dispatch({ type: 'NEXT_STEP' })}
            disabled={!canAdvance}
          >
            {nextLabel} →
          </button>
        )}
      </nav>
    </section>
  )
}
