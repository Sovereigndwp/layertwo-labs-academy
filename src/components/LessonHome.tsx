import { lessons } from '../data/registry'

/** Registry-driven lesson picker. Selecting a lesson calls onPick(lessonId). */
export function LessonHome({ onPick }: { onPick: (lessonId: string) => void }) {
  return (
    <main className="shell__main">
      <h1 className="step__headline" style={{ marginBottom: 'var(--sp-2)' }}>
        LayerTwo Labs · Learn
      </h1>
      <div className="card-grid card-grid--2">
        {lessons.map((l) => (
          <button key={l.id} type="button" className="option" onClick={() => onPick(l.id)}>
            <span className="option__title">
              {l.title.replace(/\s*Without Breaking Bitcoin$/i, '')}
            </span>
            <p className="option__note">{l.summary}</p>
            <p className="option__note" style={{ color: 'var(--text-faint)' }}>
              {l.audience} · {l.claims.length} sourced claims
            </p>
          </button>
        ))}
      </div>
    </main>
  )
}
