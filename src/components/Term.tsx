import { Tooltip } from './Tooltip'
import { useLesson } from '../state/LessonProvider'

/**
 * An inline glossary-linked term. Hover/focus shows the definition; clicking
 * opens the full glossary drawer scrolled to this term. Every technical word
 * in the lesson should be wrapped in <Term> so nothing is undefined.
 */
export function Term({ id, children }: { id: string; children?: React.ReactNode }) {
  const { dispatch, lesson } = useLesson()
  const entry = lesson.glossary.find((g) => g.id === id)
  if (!entry) return <>{children ?? id}</>

  return (
    <Tooltip content={entry.short} example={entry.example}>
      <button
        type="button"
        className="term"
        onClick={() => dispatch({ type: 'OPEN_GLOSSARY', termId: id })}
        aria-label={`${entry.term}. ${entry.short} Open glossary.`}
      >
        {children ?? entry.term}
      </button>
    </Tooltip>
  )
}
