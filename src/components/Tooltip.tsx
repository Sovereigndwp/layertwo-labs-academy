import { useId, useState, type ReactNode } from 'react'

/**
 * Hover + focus tooltip. Works for mouse, keyboard, and touch (tap toggles).
 * The trigger keeps its own semantics; we only add aria-describedby.
 */
export function Tooltip({
  content,
  example,
  children,
}: {
  content: string
  example?: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <span
      className="tooltip"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={open ? id : undefined}>{children}</span>
      {open && (
        <span role="tooltip" id={id} className="tooltip__pop">
          {content}
          {example && <em>{example}</em>}
        </span>
      )}
    </span>
  )
}
