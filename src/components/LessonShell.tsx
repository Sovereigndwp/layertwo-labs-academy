import { useEffect, useRef } from 'react'
import { lessonData, type LessonStep } from '../data/lessonData'
import { useLesson } from '../state/LessonProvider'
import { ProgressRail } from './ProgressRail'
import { FactBadge } from './FactBadge'
import { GlossaryDrawer } from './GlossaryDrawer'
import { SourcesFooter } from './SourcesFooter'
import { HookScreen, PrinciplesScreen } from './Hook'
import { SlotGrid } from './SlotGrid'
import { AddressBytesGame } from './AddressBytesGame'
import { SoftwareReleaseSelector } from './SoftwareReleaseSelector'
import { AckTimeline } from './AckTimeline'
import { ActivationStateCard } from './ActivationStateCard'
import { NodeConnectionMap } from './NodeConnectionMap'
import { ReflectionQuiz } from './ReflectionQuiz'
import { AdvancedConceptLockbox } from './AdvancedConceptLockbox'

/** Maps a step's `kind` to the component that renders it. */
function StepRouter({ step }: { step: LessonStep }) {
  switch (step.kind) {
    case 'hook':
      return <HookScreen step={step} />
    case 'principles':
      return <PrinciplesScreen step={step} />
    case 'slot':
      return <SlotGrid step={step} />
    case 'identity':
      return <AddressBytesGame step={step} />
    case 'release':
      return <SoftwareReleaseSelector step={step} />
    case 'acks':
      return <AckTimeline step={step} />
    case 'activation':
      return <ActivationStateCard step={step} />
    case 'connect':
      return <NodeConnectionMap step={step} />
    case 'quiz':
      return <ReflectionQuiz step={step} />
    case 'advanced':
      return <AdvancedConceptLockbox step={step} />
    default:
      return null
  }
}

export function LessonShell() {
  const { state, dispatch } = useLesson()
  const step = lessonData.steps[state.lessonStep]
  const mainRef = useRef<HTMLElement>(null)

  // On every step change, jump back to the top (and move focus there for
  // keyboard/screen-reader users) — otherwise the new step opens at the
  // scroll position of the Next button, i.e. the bottom of the page.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
    mainRef.current?.focus({ preventScroll: true })
  }, [state.lessonStep])

  return (
    <div className="shell">
      <a className="skip-link" href="#lesson-main">
        Skip to lesson
      </a>

      <header className="shell__topbar">
        <div className="brand">
          <span className="brand__dot" aria-hidden="true" />
          <span>
            LayerTwo Labs · Learn
            <small>{lessonData.title}</small>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'center' }}>
          <FactBadge />
          <button
            type="button"
            className="iconbtn"
            onClick={() => dispatch({ type: 'OPEN_GLOSSARY' })}
            aria-label="Open glossary"
            title="Glossary"
          >
            📖
          </button>
        </div>
      </header>

      <main className="shell__main" id="lesson-main" ref={mainRef} tabIndex={-1}>
        <ProgressRail />
        <StepRouter step={step} />
        <SourcesFooter />
      </main>

      <GlossaryDrawer />
    </div>
  )
}
