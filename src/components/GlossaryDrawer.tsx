import { useEffect, useRef } from 'react'
import { lessonData } from '../data/lessonData'
import { useLesson } from '../state/LessonProvider'

/**
 * Slide-in glossary. Opens from any <Term> or the toolbar button. Closes on
 * Escape, overlay click, or the close button. When opened from a term, that
 * entry is highlighted and scrolled into view.
 */
export function GlossaryDrawer() {
  const { state, dispatch } = useLesson()
  const closeRef = useRef<HTMLButtonElement>(null)
  const focusItemRef = useRef<HTMLDivElement>(null)

  const close = () => dispatch({ type: 'CLOSE_GLOSSARY' })

  useEffect(() => {
    if (!state.glossaryOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    // Move focus into the drawer for keyboard + screen-reader users.
    if (state.glossaryFocusTerm && focusItemRef.current) {
      focusItemRef.current.scrollIntoView({ block: 'center' })
    } else {
      closeRef.current?.focus()
    }
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.glossaryOpen, state.glossaryFocusTerm])

  if (!state.glossaryOpen) return null

  return (
    <>
      <div className="drawer-overlay" onClick={close} aria-hidden="true" />
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Glossary"
      >
        <div className="drawer__head">
          <strong>Glossary</strong>
          <button
            ref={closeRef}
            type="button"
            className="iconbtn"
            onClick={close}
            aria-label="Close glossary"
          >
            ✕
          </button>
        </div>
        <dl className="drawer__body">
          {lessonData.glossary.map((g) => {
            const isFocus = g.id === state.glossaryFocusTerm
            return (
              <div
                key={g.id}
                ref={isFocus ? focusItemRef : undefined}
                className="glossitem"
                data-focus={isFocus}
              >
                <dt>{g.term}</dt>
                <dd>
                  {g.short}
                  {g.example && <em>Example: {g.example}</em>}
                </dd>
              </div>
            )
          })}
        </dl>
      </aside>
    </>
  )
}
