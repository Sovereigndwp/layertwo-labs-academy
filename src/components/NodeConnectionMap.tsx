import type { LessonStep } from '../data/lessonData'
import { useLesson } from '../state/LessonProvider'
import { StepFrame } from './StepFrame'
import { Term } from './Term'

/**
 * Module 6 — Connect to Bitcoin.
 * Click-to-connect (keyboard friendly; no drag required) DriveNet ↔ Testchain.
 * Teaching beat: a sidechain still needs a Bitcoin full node as its anchor.
 */
export function NodeConnectionMap({ step }: { step: LessonStep }) {
  const { state, dispatch } = useLesson()
  const connected = state.nodeConnected

  return (
    <StepFrame step={step} canAdvance={connected}>
      <div className="nodemap">
        <div className="node" data-side="bitcoin">
          <div className="node__icon" aria-hidden="true">
            ₿
          </div>
          <div className="node__name">Bitcoin Core + Enforcer</div>
          <div className="node__sub">full node · BitWindow frontend</div>
        </div>

        <button
          type="button"
          className="connect-btn"
          data-connected={connected}
          aria-pressed={connected}
          aria-label={
            connected
              ? 'Connected. Press to disconnect.'
              : 'Connect Testchain to the DriveNet full node'
          }
          onClick={() =>
            dispatch({ type: 'SET_NODE_CONNECTED', connected: !connected })
          }
        >
          <span aria-hidden="true">{connected ? '🔗' : '+'}</span>
        </button>

        <div className="node">
          <div className="node__icon" aria-hidden="true">
            ⬡
          </div>
          <div className="node__name">{state.sidechainName}</div>
          <div className="node__sub">sidechain software</div>
        </div>

        <div className="nodemap__wire" data-connected={connected} aria-hidden="true" />
      </div>

      <div
        className={connected ? 'feedback feedback--ok' : 'feedback'}
        role="status"
      >
        <span className="feedback__icon" aria-hidden="true">
          {connected ? '✓' : '○'}
        </span>
        <p>
          {connected ? (
            <>
              <b>Connected.</b>
              {state.sidechainName} now talks to Bitcoin through a{' '}
              <Term id="full-node">full node</Term> running the Enforcer — the
              same way a Lightning node needs a Bitcoin node. Bitcoin Core stays
              the reference point; the Enforcer only adds BIP300/301 awareness.
            </>
          ) : (
            <>
              <b>Not connected yet.</b>
              Press the button between the two nodes to link {state.sidechainName}{' '}
              to the Bitcoin node.
            </>
          )}
        </p>
      </div>
    </StepFrame>
  )
}
