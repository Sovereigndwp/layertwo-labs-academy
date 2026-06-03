import { lessonData } from '../data/lessonData'

/** Source notes + accuracy disclaimer, always at the foot of the lesson. */
export function SourcesFooter() {
  return (
    <footer className="sources">
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
