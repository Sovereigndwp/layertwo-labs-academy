import { ClaimChip } from './ClaimChip'
import { lessonData } from '../data/lessonData'

/** Source notes + accuracy disclaimer, always at the foot of the lesson. */
export function SourcesFooter() {
  return (
    <footer className="sources">
      {lessonData.claims.length > 0 && (
        <section aria-label="Verifiable claims" style={{ marginBottom: 'var(--sp-4)' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: 'var(--fs-300)', margin: '0 0 var(--sp-2)' }}>
            What this lesson claims — and how we know
          </h3>
          <ul className="claimlist">
            {lessonData.claims.map((c) => (
              <li key={c.id}>
                <ClaimChip claim={c} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <dl>
        {lessonData.sources.map((s) => (
          <div key={s.label}>
            <dt>{s.label}</dt>
            <dd>{s.detail}</dd>
          </div>
        ))}
      </dl>
    </footer>
  )
}
