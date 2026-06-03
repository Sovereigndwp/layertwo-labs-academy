import type { LessonStep } from '../data/lessonData'
import { StepFrame } from './StepFrame'
import { Term } from './Term'

/**
 * Step 1 — Hook. The road analogy, shown as two lanes, not a wall of text.
 */
export function HookScreen({ step }: { step: LessonStep }) {
  return (
    <StepFrame step={step} canAdvance nextLabel="Start with the basics">
      <div className="hook__road">
        <div className="road road--main">
          <span className="road__label">Bitcoin</span>
          <span className="road__lane" aria-hidden="true" />
          <span className="option__note" style={{ flex: 'none' }}>
            the main road
          </span>
        </div>
        <div className="road road--side">
          <span className="road__label">Sidechain</span>
          <span className="road__lane" aria-hidden="true" />
          <span className="option__note" style={{ flex: 'none' }}>
            a road built next to it
          </span>
        </div>
      </div>
      <div className="feedback feedback--info">
        <span className="feedback__icon" aria-hidden="true">
          🛣
        </span>
        <p>
          <Term id="drivechain" /> is a proposed way to let people open new side
          roads — without forcing every Bitcoin user to drive on them.
        </p>
      </div>
    </StepFrame>
  )
}

/**
 * Step 2 — First principles. Four plain ideas as numbered cards.
 */
export function PrinciplesScreen({ step }: { step: LessonStep }) {
  return (
    <StepFrame step={step} canAdvance nextLabel="Choose a slot">
      <div className="card-grid">
        {(step.body ?? []).map((line, i) => (
          <div key={i} className="card principle">
            <span className="principle__num" aria-hidden="true">
              {i + 1}
            </span>
            <p style={{ margin: 0 }}>{line}</p>
          </div>
        ))}
      </div>
    </StepFrame>
  )
}
