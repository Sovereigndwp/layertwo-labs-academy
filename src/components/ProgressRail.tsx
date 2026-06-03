import { lessonData } from '../data/lessonData'
import { useLesson } from '../state/LessonProvider'

/**
 * Horizontal step rail. Lets the learner jump back to any visited step (and the
 * current one), but not skip ahead — keeping the one-idea-at-a-time flow.
 */
export function ProgressRail() {
  const { state, dispatch } = useLesson()

  return (
    <ol className="rail" aria-label="Lesson progress">
      {lessonData.steps.map((s, i) => {
        const isCurrent = i === state.lessonStep
        const isDone = i < state.lessonStep
        const reachable = i <= state.lessonStep
        return (
          <li key={s.id} className="rail__item">
            <button
              type="button"
              className="rail__btn"
              data-done={isDone}
              aria-current={isCurrent ? 'step' : undefined}
              disabled={!reachable}
              onClick={() => dispatch({ type: 'GO_TO_STEP', step: i })}
            >
              <span className="rail__num" aria-hidden="true">
                {isDone ? '✓' : i + 1}
              </span>
              {s.navLabel}
            </button>
          </li>
        )
      })}
    </ol>
  )
}
