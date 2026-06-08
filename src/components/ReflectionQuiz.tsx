import type { LessonStep } from '../data/lessonData'
import { useLesson } from '../state/LessonProvider'
import { StepFrame } from './StepFrame'

/**
 * Module 8 — Reflection quiz.
 * Select-one cards with per-answer feedback. No score, no pass/fail — this is
 * a tiered reflection, not a test. The learner may advance once every question
 * has an answer (any answer; feedback teaches either way).
 */
export function ReflectionQuiz({ step }: { step: LessonStep }) {
  const { state, dispatch, lesson } = useLesson()
  const answered = lesson.quiz.every((q) =>
    state.quizAnswers.some((a) => a.questionId === q.id),
  )

  return (
    <StepFrame step={step} canAdvance={answered} nextLabel="See what comes next">
      <div className="quiz">
        {lesson.quiz.map((q) => {
          const picked = state.quizAnswers.find((a) => a.questionId === q.id)
          const pickedChoice = q.choices.find((c) => c.id === picked?.choiceId)
          return (
            <fieldset
              key={q.id}
              className="card"
              style={{ border: '1px solid var(--border)' }}
            >
              <legend className="quizq__prompt">{q.prompt}</legend>
              <div className="quizq__choices">
                {q.choices.map((c) => {
                  const isPicked = picked?.choiceId === c.id
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className="choice"
                      data-picked={isPicked}
                      data-correct={c.correct}
                      aria-pressed={isPicked}
                      onClick={() =>
                        dispatch({
                          type: 'ANSWER_QUIZ',
                          questionId: q.id,
                          choiceId: c.id,
                        })
                      }
                    >
                      <span className="choice__mark" aria-hidden="true">
                        {isPicked ? (c.correct ? '✓' : '✕') : '○'}
                      </span>
                      <span>{c.label}</span>
                    </button>
                  )
                })}
              </div>

              {pickedChoice && (
                <div
                  className={
                    pickedChoice.correct
                      ? 'feedback feedback--ok'
                      : 'feedback feedback--bad'
                  }
                  role="status"
                >
                  <span className="feedback__icon" aria-hidden="true">
                    {pickedChoice.correct ? '✓' : '✕'}
                  </span>
                  <p>{pickedChoice.feedback}</p>
                </div>
              )}
            </fieldset>
          )
        })}
      </div>
    </StepFrame>
  )
}
