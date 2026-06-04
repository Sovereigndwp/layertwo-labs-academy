import { ClaimChip } from './ClaimChip'
import { lessonData } from '../data/lessonData'

/**
 * Sources, verifiable claims, and the accuracy note — collapsed into a dropdown
 * so they are reachable on every screen without cluttering it. A native
 * <details> gives built-in keyboard accessibility (Enter/Space toggles, the
 * expanded/collapsed state is announced).
 */
export function SourcesFooter() {
  const claimCount = lessonData.claims.length
  return (
    <footer className="sources">
      <details className="sources__disclosure">
        <summary className="sources__summary">
          Sources &amp; how we know
          {claimCount > 0 && (
            <span className="sources__count">{claimCount} sourced claims</span>
          )}
        </summary>
        <div className="sources__body">
          {claimCount > 0 && (
            <section
              aria-label="Verifiable claims"
              style={{ marginBottom: 'var(--sp-4)' }}
            >
              <h3 className="sources__h">
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
        </div>
      </details>
    </footer>
  )
}
