import { useEffect, useId, useRef, useState } from 'react'
import { useLesson } from '../state/LessonProvider'

/**
 * Factual guardrail as a quiet disclosure. It is present on every screen but
 * collapsed: a small neutral ⓘ control opens a dropdown with the "proposed
 * upgrade / not live on Bitcoin mainnet" disclaimer. This keeps the honesty
 * reachable everywhere without the visual noise of a persistent orange banner.
 */
export function FactBadge() {
  const { lesson } = useLesson()
  const { short, full } = lesson.factBadge
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
    }
  }, [open])

  return (
    <div className="factbadge" ref={ref}>
      <button
        type="button"
        className="factbadge__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Drivechain status — is this live on Bitcoin? Open for details."
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden="true">ⓘ</span>
      </button>
      {open && (
        <div
          className="factbadge__panel"
          id={panelId}
          role="region"
          aria-label="Status disclaimer"
        >
          <p className="factbadge__short">{short}</p>
          <p className="factbadge__full">{full}</p>
        </div>
      )}
    </div>
  )
}
