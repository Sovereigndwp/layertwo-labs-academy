import type { LessonStep } from '../data/lessonData'
import { lessonData } from '../data/lessonData'
import { useLesson } from '../state/LessonProvider'
import { StepFrame } from './StepFrame'

/**
 * Module 9 — Advanced "For Miners" preview.
 * Locked until the learner opens it. We name the advanced topics (blind merged
 * mining, BIP300/301, withdrawals) but deliberately do NOT teach them here.
 */
export function AdvancedConceptLockbox({ step }: { step: LessonStep }) {
  const { state, dispatch } = useLesson()
  const unlocked = state.advancedUnlocked
  const adv = lessonData.advanced

  return (
    <StepFrame step={step} canAdvance>
      <div className="lockbox" data-unlocked={unlocked}>
        {!unlocked ? (
          <>
            <p style={{ fontSize: '2rem', margin: 0 }} aria-hidden="true">
              🔒
            </p>
            <h3 style={{ margin: 'var(--sp-2) 0' }}>{adv.title}</h3>
            <p className="option__note" style={{ maxWidth: '46ch', margin: '0 auto' }}>
              {adv.intro}
            </p>
            <button
              type="button"
              className="btn btn--primary"
              style={{ marginTop: 'var(--sp-4)' }}
              onClick={() => dispatch({ type: 'UNLOCK_ADVANCED' })}
            >
              Preview advanced topics
            </button>
          </>
        ) : (
          <>
            <h3 style={{ marginTop: 0 }}>{adv.title}</h3>
            <p className="option__note">{adv.intro}</p>
            <div className="lockbox__list">
              {adv.points.map((p) => (
                <div key={p.term} className="lockbox__item">
                  <b>{p.term}</b>
                  <p className="option__note" style={{ margin: '4px 0 0' }}>
                    {p.blurb}
                  </p>
                </div>
              ))}
            </div>
            <div className="feedback" style={{ marginTop: 'var(--sp-4)' }}>
              <span className="feedback__icon" aria-hidden="true">
                🛈
              </span>
              <p>{adv.reassurance}</p>
            </div>
          </>
        )}
      </div>
    </StepFrame>
  )
}
