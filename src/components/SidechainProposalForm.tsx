import { useLesson } from '../state/LessonProvider'
import { lessonData } from '../data/lessonData'

/**
 * A compact, read-only recap of the proposal as it accumulates across steps.
 * Reused on the identity / release / activation screens so the learner always
 * sees the full "proposal" taking shape, not just the field in front of them.
 */
export function SidechainProposalForm() {
  const { state } = useLesson()
  const release = lessonData.releases.find((r) => r.id === state.selectedRelease)

  const rows: { label: string; value: string; done: boolean }[] = [
    {
      label: 'Slot',
      value: state.selectedSlot ? `#${state.selectedSlot}` : 'not chosen',
      done: state.selectedSlot !== null,
    },
    { label: 'Name', value: state.sidechainName || '—', done: !!state.sidechainName },
    {
      label: 'Identity tag',
      value: state.addressBytes ?? 'not set',
      done: state.addressBytes !== null,
    },
    {
      label: 'Authoritative version',
      value: release ? release.version : 'not chosen',
      done: !!release,
    },
  ]

  return (
    <div className="card" aria-label="Proposal summary">
      <strong style={{ display: 'block', marginBottom: 'var(--sp-2)' }}>
        Your proposal so far
      </strong>
      <dl style={{ display: 'grid', gap: '6px', margin: 0 }}>
        {rows.map((r) => (
          <div
            key={r.label}
            style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}
          >
            <dt style={{ color: 'var(--text-faint)' }}>
              <span aria-hidden="true">{r.done ? '✓ ' : '○ '}</span>
              {r.label}
            </dt>
            <dd
              style={{
                margin: 0,
                fontFamily: 'var(--font-mono)',
                color: r.done ? 'var(--text)' : 'var(--text-faint)',
              }}
            >
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
